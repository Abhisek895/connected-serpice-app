import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  try {
    const { userId } = await getCurrentUser();
    let isPremium = false;
    if (userId) {
      const dbUser = await prisma.user.findUnique({ where: { id: userId } });
      if (dbUser) {
        isPremium = dbUser.plan === "PREMIUM" || dbUser.role === "super_admin";
      }
    }

    const originalPriceSetting = await prisma.systemSetting.findUnique({ where: { key: "offer_original_price" } });
    const specialPriceSetting = await prisma.systemSetting.findUnique({ where: { key: "offer_special_price" } });
    const cashbackSetting = await prisma.systemSetting.findUnique({ where: { key: "offer_cashback_amount" } });

    const originalPrice = originalPriceSetting?.value ? parseInt(originalPriceSetting.value, 10) : 499;
    const defaultSpecialPrice = specialPriceSetting?.value ? parseInt(specialPriceSetting.value, 10) : 199;
    const specialPrice = isPremium ? 0 : defaultSpecialPrice;
    const cashbackAmount = cashbackSetting?.value ? parseInt(cashbackSetting.value, 10) : 50;
    const discountPercent = isPremium ? 100 : (originalPrice > 0 ? Math.round(((originalPrice - defaultSpecialPrice) / originalPrice) * 100) : 60);

    return NextResponse.json({
      success: true,
      originalPrice,
      specialPrice,
      cashbackAmount,
      discountPercent,
      isPremium,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      originalPrice: 499,
      specialPrice: 199,
      cashbackAmount: 50,
      discountPercent: 60,
      isPremium: false,
    });
  }
}
