import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MIN_WITHDRAWAL_PAISE = 50000; // ₹500 minimum

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { upiId, amount } = await req.json();

    if (!upiId || typeof upiId !== "string" || !upiId.includes("@")) {
      return NextResponse.json({ error: "Invalid UPI ID. Format: yourname@upi" }, { status: 400 });
    }

    const minWithdrawalSetting = await prisma.systemSetting.findUnique({ where: { key: "referral_min_withdrawal" } });
    const minWithdrawalINR = minWithdrawalSetting?.value ? parseInt(minWithdrawalSetting.value, 10) : 50;
    const minWithdrawalPaise = minWithdrawalINR * 100;

    const amountPaise = Number(amount);
    if (!amountPaise || amountPaise < minWithdrawalPaise) {
      return NextResponse.json({
        error: `Minimum withdrawal is ₹${minWithdrawalINR}`
      }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { walletBalance: true, name: true, email: true },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (user.walletBalance < amountPaise) {
      return NextResponse.json({
        error: `Insufficient balance. Available: ₹${(user.walletBalance / 100).toFixed(0)}`
      }, { status: 400 });
    }

    // Deduct from wallet + create pending withdrawal record in a transaction
    await prisma.$transaction([
      prisma.user.update({
        where: { id: session.user.id },
        data: { walletBalance: { decrement: amountPaise } },
      }),
      prisma.walletTransaction.create({
        data: {
          userId: session.user.id,
          type: "WITHDRAWAL_PENDING",
          amount: -amountPaise,
          description: `Withdrawal request of ₹${(amountPaise / 100).toFixed(0)} to UPI: ${upiId}`,
          status: "PENDING",
          referenceId: upiId,
        },
      }),
    ]);

    // TODO: Send admin notification email here when email system is ready
    console.log(`[WITHDRAWAL REQUEST] User: ${user.email} | Amount: ₹${amountPaise / 100} | UPI: ${upiId}`);

    return NextResponse.json({
      success: true,
      message: `Withdrawal of ₹${(amountPaise / 100).toFixed(0)} requested. We'll transfer to ${upiId} within 24-48 hours.`,
    });
  } catch (err) {
    console.error("[referral/withdraw]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
