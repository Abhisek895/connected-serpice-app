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
    const rewardTypeSetting = await prisma.systemSetting.findUnique({ where: { key: "referral_reward_type" } });
    const rewardSetting = await prisma.systemSetting.findUnique({ where: { key: "referral_reward_amount" } });
    const rewardPercentSetting = await prisma.systemSetting.findUnique({ where: { key: "referral_reward_percent" } });
    const minWithdrawalSetting = await prisma.systemSetting.findUnique({ where: { key: "referral_min_withdrawal" } });
    const enabledSetting = await prisma.systemSetting.findUnique({ where: { key: "referral_enabled" } });

    const rewardType = rewardTypeSetting?.value || "FIXED";
    const rewardAmount = rewardSetting?.value ? parseInt(rewardSetting.value, 10) : 20;
    const rewardPercent = rewardPercentSetting?.value ? parseInt(rewardPercentSetting.value, 10) : 20;
    const minWithdrawal = minWithdrawalSetting?.value ? parseInt(minWithdrawalSetting.value, 10) : 50;
    const referralEnabled = enabledSetting?.value !== "false";

    // 2. Fetch User with Referrals and Wallet Transactions + Active Themes
    const [user, activeThemes] = await Promise.all([
      prisma.user.findUnique({
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
                select: { id: true, amount: true, finalAmount: true, createdAt: true },
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
      }),
      prisma.theme.findMany({
        where: { isActive: true },
        select: { id: true, name: true, title: true, description: true, price: true, durationDays: true, isPremium: true, thumbnailUrl: true },
        orderBy: { price: "asc" },
      }),
    ]);

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    let currentWalletBalance = user.walletBalance;
    const updatedTxns = [...user.walletTxns];

    // Referral rewards are credited only by the verified payment fulfillment path.
    // This endpoint is intentionally read-only so loading the dashboard can never mint money.

    // 3. Calculate Total Earned & Referral Statuses
    const totalEarned = updatedTxns
      .filter((t) => t.type === "REFERRAL_EARNED" && t.status === "COMPLETED")
      .reduce((sum, t) => sum + t.amount, 0);

    const referralsMapped = user.referrals.map((ref) => {
      const qualifyingPayment = ref.payments[0];
      const paidAmount = qualifyingPayment
        ? (qualifyingPayment.finalAmount ?? qualifyingPayment.amount)
        : 0;
      const hasPaid = paidAmount > 0;
      const paymentIds = ref.payments.map((p) => p.id);
      const isRewardCredited = updatedTxns.some(
        (t) =>
          t.type === "REFERRAL_EARNED" &&
          t.status === "COMPLETED" &&
          (t.referenceId === ref.id ||
            (t.referenceId && paymentIds.includes(t.referenceId)) ||
            (t.description && ref.email && t.description.includes(ref.email.split("@")[0])))
      );

      const rewardStatus = isRewardCredited
        ? "EARNED"
        : hasPaid
          ? "PENDING"
          : qualifyingPayment
            ? "NOT_ELIGIBLE"
            : "PENDING";

      return {
        id: ref.id,
        name: ref.name || "Anonymous",
        email: ref.email?.replace(/(.{2})(.*)(@.*)/, "$1***$3") || "---", // mask email
        joinedAt: ref.createdAt,
        hasPaid,
        rewardStatus,
        rewardMessage: rewardStatus === "NOT_ELIGIBLE"
          ? "No referral bonus: this order used a 100% coupon/free credit, so OurStory received no payment."
          : undefined,
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
      rewardType,
      rewardAmount,
      rewardPercent,
      minWithdrawal,
      referralEnabled,
      themes: activeThemes,
    });
  } catch (err) {
    console.error("[referral/stats]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
