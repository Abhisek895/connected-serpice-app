import { prisma } from "@/lib/prisma";
import { sendColdEmail } from "./smtp";
import { renderEmailTemplate } from "./template";

export interface WorkerProcessResult {
  processed: number;
  sent: number;
  failed: number;
  skipped: number;
  message: string;
}

/**
 * Recovers recipients stuck in PROCESSING state due to server crash/restart
 */
export async function recoverStuckRecipients() {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  try {
    const recovered = await (prisma as any).coldRecipient.updateMany({
      where: {
        status: "PROCESSING",
        updatedAt: { lt: fiveMinutesAgo },
      },
      data: {
        status: "PENDING",
      },
    });
    if (recovered.count > 0) {
      console.log(`[ColdEmailWorker] Recovered ${recovered.count} stuck PROCESSING recipients back to PENDING.`);
    }
  } catch (err) {
    console.error("[ColdEmailWorker] Error recovering stuck recipients:", err);
  }
}

/**
 * Gets sending stats for an SMTP account (sent this hour & sent today)
 */
export async function getSmtpUsage(smtpAccountId: string) {
  const now = new Date();
  const startOfHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), 0, 0, 0);
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

  const [sentThisHour, sentToday] = await Promise.all([
    (prisma as any).coldLog.count({
      where: {
        smtpAccountId,
        status: "SENT",
        createdAt: { gte: startOfHour },
      },
    }),
    (prisma as any).coldLog.count({
      where: {
        smtpAccountId,
        status: "SENT",
        createdAt: { gte: startOfDay },
      },
    }),
  ]);

  return { sentThisHour, sentToday };
}

/**
 * Finds eligible SMTP accounts that are active and under their limits
 */
export async function getEligibleSmtpAccounts() {
  const accounts = await (prisma as any).smtpAccount.findMany({
    where: { isActive: true },
  });

  const eligible = [];
  for (const account of accounts) {
    const usage = await getSmtpUsage(account.id);
    if (usage.sentThisHour < account.hourlyLimit && usage.sentToday < account.dailyLimit) {
      eligible.push({
        ...account,
        sentThisHour: usage.sentThisHour,
        sentToday: usage.sentToday,
        remainingHourly: account.hourlyLimit - usage.sentThisHour,
        remainingDaily: account.dailyLimit - usage.sentToday,
      });
    }
  }

  return eligible;
}

/**
 * Processes a batch of queued emails for all RUNNING campaigns
 */
export async function processQueueBatch(maxBatchSize: number = 5): Promise<WorkerProcessResult> {
  // Step 1: Recover any stuck processing items
  await recoverStuckRecipients();

  // Step 2: Find running campaigns
  const runningCampaigns = await (prisma as any).coldCampaign.findMany({
    where: { status: "RUNNING" },
  });

  if (runningCampaigns.length === 0) {
    return { processed: 0, sent: 0, failed: 0, skipped: 0, message: "No active running campaigns found." };
  }

  // Step 3: Find active SMTP accounts
  const eligibleSmtps = await getEligibleSmtpAccounts();
  if (eligibleSmtps.length === 0) {
    return {
      processed: 0,
      sent: 0,
      failed: 0,
      skipped: 0,
      message: "No eligible active SMTP accounts available (or limits reached).",
    };
  }

  let totalProcessed = 0;
  let totalSent = 0;
  let totalFailed = 0;
  let totalSkipped = 0;

  const now = new Date();

  for (const campaign of runningCampaigns) {
    // Check if campaign pending recipients exist
    const pendingRecipients = await (prisma as any).coldRecipient.findMany({
      where: {
        campaignId: campaign.id,
        status: "PENDING",
        OR: [
          { nextAttemptAt: null },
          { nextAttemptAt: { lte: now } },
        ],
      },
      take: maxBatchSize,
      orderBy: { createdAt: "asc" },
    });

    if (pendingRecipients.length === 0) {
      // Check if all recipients for this campaign are done
      const remainingPending = await (prisma as any).coldRecipient.count({
        where: { campaignId: campaign.id, status: { in: ["PENDING", "PROCESSING"] } },
      });

      if (remainingPending === 0) {
        // Mark campaign as COMPLETED
        await (prisma as any).coldCampaign.update({
          where: { id: campaign.id },
          data: {
            status: "COMPLETED",
            completedAt: new Date(),
          },
        });
        await (prisma as any).coldLog.create({
          data: {
            campaignId: campaign.id,
            recipientEmail: "SYSTEM",
            status: "SYSTEM",
            error: `Campaign "${campaign.name}" completed all recipients.`,
          },
        });
      }
      continue;
    }

    // Process recipients one by one with rate-limited delays
    for (const recipient of pendingRecipients) {
      // Re-verify campaign is still RUNNING before each recipient
      const currentCampaign = await (prisma as any).coldCampaign.findUnique({
        where: { id: campaign.id },
        select: { status: true, subject: true, content: true },
      });

      if (!currentCampaign || currentCampaign.status !== "RUNNING") {
        console.log(`[ColdEmailWorker] Campaign ${campaign.id} is no longer RUNNING (status: ${currentCampaign?.status}). Skipping.`);
        totalSkipped++;
        break;
      }

      // Re-verify SMTP account availability
      let currentEligibleSmtps = await getEligibleSmtpAccounts();
      if (campaign.smtpAccountId) {
        currentEligibleSmtps = currentEligibleSmtps.filter((a) => a.id === campaign.smtpAccountId);
      }

      if (currentEligibleSmtps.length === 0) {
        console.log(`[ColdEmailWorker] No eligible SMTP account available for campaign ${campaign.id}. Halting batch.`);
        break;
      }

      // Pick SMTP account round-robin / lowest daily usage
      currentEligibleSmtps.sort((a, b) => a.sentToday - b.sentToday);
      const selectedSmtp = currentEligibleSmtps[0];

      // Atomic Lock: PENDING -> PROCESSING to prevent race conditions
      const lockResult = await (prisma as any).coldRecipient.updateMany({
        where: {
          id: recipient.id,
          status: "PENDING",
        },
        data: {
          status: "PROCESSING",
          smtpAccountId: selectedSmtp.id,
          attemptCount: recipient.attemptCount + 1,
        },
      });

      if (lockResult.count === 0) {
        // Another worker claimed this recipient
        continue;
      }

      totalProcessed++;

      // Render custom template placeholders
      const renderedBody = renderEmailTemplate({
        template: currentCampaign.content,
        recipientEmail: recipient.email,
        recipientName: recipient.name,
      });

      const renderedSubject = renderEmailTemplate({
        template: currentCampaign.subject,
        recipientEmail: recipient.email,
        recipientName: recipient.name,
      });

      // Send the single email
      const sendResult = await sendColdEmail({
        smtpAccount: selectedSmtp,
        toEmail: recipient.email,
        toName: recipient.name,
        subject: renderedSubject,
        htmlContent: renderedBody,
      });

      const attemptNum = recipient.attemptCount + 1;

      if (sendResult.success) {
        totalSent++;
        // Update recipient to SENT
        await (prisma as any).coldRecipient.update({
          where: { id: recipient.id },
          data: {
            status: "SENT",
            sentAt: new Date(),
            lastError: null,
          },
        });

        // Log SUCCESS
        await (prisma as any).coldLog.create({
          data: {
            campaignId: campaign.id,
            recipientId: recipient.id,
            smtpAccountId: selectedSmtp.id,
            recipientEmail: recipient.email,
            status: "SENT",
            attempt: attemptNum,
          },
        });

        // Update campaign counters
        await (prisma as any).coldCampaign.update({
          where: { id: campaign.id },
          data: {
            sentCount: { increment: 1 },
            pendingCount: { decrement: 1 },
          },
        });
      } else {
        totalFailed++;
        const errorMessage = sendResult.error || "Unknown SMTP sending error";

        // Check if retry eligible (up to 3 attempts)
        if (attemptNum < 3) {
          // Schedule retry with delay (5 mins for attempt 2, 15 mins for attempt 3)
          const retryDelayMinutes = attemptNum === 1 ? 5 : 15;
          const nextAttemptAt = new Date(Date.now() + retryDelayMinutes * 60 * 1000);

          await (prisma as any).coldRecipient.update({
            where: { id: recipient.id },
            data: {
              status: "PENDING",
              lastError: errorMessage,
              nextAttemptAt,
            },
          });

          await (prisma as any).coldLog.create({
            data: {
              campaignId: campaign.id,
              recipientId: recipient.id,
              smtpAccountId: selectedSmtp.id,
              recipientEmail: recipient.email,
              status: "RETRYING",
              attempt: attemptNum,
              error: `Attempt ${attemptNum} failed: ${errorMessage}. Retrying in ${retryDelayMinutes}m.`,
            },
          });
        } else {
          // Mark permanent FAILED
          await (prisma as any).coldRecipient.update({
            where: { id: recipient.id },
            data: {
              status: "FAILED",
              lastError: errorMessage,
            },
          });

          await (prisma as any).coldLog.create({
            data: {
              campaignId: campaign.id,
              recipientId: recipient.id,
              smtpAccountId: selectedSmtp.id,
              recipientEmail: recipient.email,
              status: "FAILED",
              attempt: attemptNum,
              error: `Permanent failure after ${attemptNum} attempts: ${errorMessage}`,
            },
          });

          await (prisma as any).coldCampaign.update({
            where: { id: campaign.id },
            data: {
              failedCount: { increment: 1 },
              pendingCount: { decrement: 1 },
            },
          });
        }
      }

      // Respect SMTP delay between emails
      const delay = selectedSmtp.delayMs || campaign.delayMs || 3000;
      await new Promise((resolve) => setTimeout(resolve, Math.min(delay, 5000)));
    }
  }

  return {
    processed: totalProcessed,
    sent: totalSent,
    failed: totalFailed,
    skipped: totalSkipped,
    message: `Batch processed: ${totalProcessed} emails (${totalSent} sent, ${totalFailed} failed).`,
  };
}
