import { prisma } from "@/lib/prisma";

export async function creditReferrer(payment: {
  id: string;
  referredByCode?: string | null;
  amount: number;
  finalAmount?: number | null;
  status?: string;
  razorpayPaymentId?: string | null;
  demoId: string | null;
  userId: string;
}) {
  // Referral rewards are earned only from a real, positive Razorpay payment.
  // A successful free order (including a 100% coupon) must never create wallet credit.
  const paidAmount = payment.finalAmount ?? payment.amount;
  const isMockPayment =
    !payment.razorpayPaymentId ||
    payment.razorpayPaymentId.startsWith("mock_") ||
    payment.razorpayPaymentId.startsWith("guest_free_");

  if (payment.status !== "SUCCESS" || paidAmount <= 0 || isMockPayment) return;

  // 1. Check if referral program is enabled
  const enabledSetting = await prisma.systemSetting.findUnique({ where: { key: "referral_enabled" } });
  if (enabledSetting?.value === "false") return;

  // 2. Find the referrer — either via payment.referredByCode or buyer's stored referredById
  let referrer: { id: string; name: string | null; email: string | null } | null = null;
  let buyer: { id: string; name: string | null; email: string | null; referredById: string | null } | null = null;

  buyer = await prisma.user.findUnique({
    where: { id: payment.userId },
    select: { id: true, name: true, email: true, referredById: true },
  });

  if (!buyer) return;

  if (payment.referredByCode) {
    referrer = await prisma.user.findUnique({
      where: { referralCode: payment.referredByCode },
      select: { id: true, name: true, email: true },
    });
  }

  // Fallback to buyer's account referrer if payment code didn't resolve
  if (!referrer && buyer.referredById) {
    referrer = await prisma.user.findUnique({
      where: { id: buyer.referredById },
      select: { id: true, name: true, email: true },
    });
  }

  if (!referrer) return;

  // 3. Don't credit if the buyer IS the referrer (self-referral guard)
  if (referrer.id === payment.userId) return;

  // 4. IDEMPOTENCY GUARD — check if we already credited for this payment or buyer
  const alreadyCredited = await prisma.walletTransaction.findFirst({
    where: {
      userId: referrer.id,
      type: "REFERRAL_EARNED",
      OR: [
        { referenceId: payment.id },
        { referenceId: buyer.id }
      ]
    },
  });
  if (alreadyCredited) return; // Already credited — do nothing

  // 5. Calculate bonus amount
  let creditPaise = 0;
  const rewardTypeSetting = await prisma.systemSetting.findUnique({ where: { key: "referral_reward_type" } });
  const rewardType = rewardTypeSetting?.value || "FIXED";

  if (rewardType === "PERCENTAGE") {
    const rewardPercentSetting = await prisma.systemSetting.findUnique({ where: { key: "referral_reward_percent" } });
    const globalPercent = rewardPercentSetting?.value ? parseInt(rewardPercentSetting.value, 10) : 20;
    creditPaise = Math.round((paidAmount * globalPercent) / 100);
  } else {
    // Fixed reward
    const rewardSetting = await prisma.systemSetting.findUnique({ where: { key: "referral_reward_amount" } });
    const fixedINR = rewardSetting?.value ? parseInt(rewardSetting.value, 10) : 20;
    creditPaise = fixedINR * 100;
  }

  if (creditPaise <= 0) return;

  // 6. Credit in an atomic transaction
  await prisma.$transaction([
    prisma.walletTransaction.create({
      data: {
        userId: referrer.id,
        type: "REFERRAL_EARNED",
        amount: creditPaise,
        description: `Referral bonus for payment on ${payment.demoId || "template"}`,
        referenceId: payment.id, // unique per payment — ensures idempotency
        status: "COMPLETED",
      },
    }),
    prisma.user.update({
      where: { id: referrer.id },
      data: { walletBalance: { increment: creditPaise } },
    }),
  ]);

  console.log(
    `[referral-credit] Credited ₹${(creditPaise / 100).toFixed(2)} to referrer ${referrer.email} for payment ${payment.id}`
  );
}
