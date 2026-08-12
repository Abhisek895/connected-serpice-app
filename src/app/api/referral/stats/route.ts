import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // 1. Fetch Referral Settings
    const rewardSetting = await prisma.systemSetting.findUnique({ where: { key: "referral_reward_amount" } });
    const minWithdrawalSetting = await prisma.systemSetting.findUnique({ where: { key: "referral_min_withdrawal" } });
    const enabledSetting = await prisma.systemSetting.findUnique({ where: { key: "referral_enabled" } });

    const rewardAmount = rewardSetting?.value ? parseInt(rewardSetting.value, 10) : 500;
    const minWithdrawal = minWithdrawalSetting?.value ? parseInt(minWithdrawalSetting.value, 10) : 500;
    const referralEnabled = enabledSetting?.value !== "false";
    const rewardPaise = rewardAmount * 100;

    // 2. Fetch User with Referrals and Wallet Transactions
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        referralCode: true,
        walletBalance: true,
        referrals: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            payments: {
              where: { status: "SUCCESS" },
              select: { id: true, amount: true, createdAt: true },
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        walletTxns: {
          select: { id: true, type: true, amount: true, description: true, referenceId: true, createdAt: true, status: true },
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    let currentWalletBalance = user.walletBalance;
    const updatedTxns = [...user.walletTxns];

    // 3. Auto-Reconcile: Check for paid referrals that haven't been credited yet
    if (referralEnabled) {
      for (const ref of user.referrals) {
        const hasPaid = ref.payments.length > 0;
        if (hasPaid) {
          // Check if a referral reward transaction already exists for this referral
          const hasRewardRecord = updatedTxns.some(
            (t) =>
              t.type === "REFERRAL_EARNED" &&
              (t.referenceId === ref.id || (t.description && ref.email && t.description.includes(ref.email.split("@")[0])))
          );

          if (!hasRewardRecord) {
            // Auto-credit missing referral reward to referrer's wallet
            const [newTxn] = await prisma.$transaction([
              prisma.walletTransaction.create({
                data: {
                  userId,
                  type: "REFERRAL_EARNED",
                  amount: rewardPaise,
                  description: `Referral reward for ${ref.name || ref.email}`,
                  referenceId: ref.id,
                  status: "COMPLETED",
                },
              }),
              prisma.user.update({
                where: { id: userId },
                data: { walletBalance: { increment: rewardPaise } },
              }),
            ]);

            currentWalletBalance += rewardPaise;
            updatedTxns.unshift(newTxn);
          }
        }
      }
    }

    // 4. Calculate Total Earned & Referral Statuses
    const totalEarned = updatedTxns
      .filter((t) => t.type === "REFERRAL_EARNED" && t.status === "COMPLETED")
      .reduce((sum, t) => sum + t.amount, 0);

    const referralsMapped = user.referrals.map((ref) => {
      const hasPaid = ref.payments.length > 0;
      const isRewardCredited = updatedTxns.some(
        (t) =>
          t.type === "REFERRAL_EARNED" &&
          t.status === "COMPLETED" &&
          (t.referenceId === ref.id || (t.description && ref.email && t.description.includes(ref.email.split("@")[0])))
      );

      return {
        id: ref.id,
        name: ref.name || "Anonymous",
        email: ref.email?.replace(/(.{2})(.*)(@.*)/, "$1***$3") || "---", // mask email
        joinedAt: ref.createdAt,
        hasPaid,
        rewardStatus: isRewardCredited ? "EARNED" : "PENDING",
      };
    });

    return NextResponse.json({
      referralCode: user.referralCode,
      referralUrl: user.referralCode
        ? `${process.env.NEXTAUTH_URL}/?ref=${user.referralCode}`
        : null,
      walletBalance: currentWalletBalance, // in paise
      totalEarned,                          // in paise
      referralCount: user.referrals.length,
      referrals: referralsMapped,
      recentTxns: updatedTxns,
      rewardAmount,
      minWithdrawal,
      referralEnabled,
    });
  } catch (err) {
    console.error("[referral/stats]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
