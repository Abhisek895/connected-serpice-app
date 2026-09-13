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
    const premiumUpgradeSetting = await prisma.systemSetting.findUnique({ where: { key: "premium_upgrade_price" } });
    const enabledSetting = await prisma.systemSetting.findUnique({ where: { key: "offer_pricing_enabled" } });

    const isOfferEnabled = enabledSetting?.value !== "false";
    const originalPrice = originalPriceSetting?.value ? parseInt(originalPriceSetting.value, 10) : 500;
    const defaultSpecialPrice = specialPriceSetting?.value ? parseInt(specialPriceSetting.value, 10) : 200;
    const specialPrice = isPremium ? 0 : defaultSpecialPrice;
    const cashbackAmount = cashbackSetting?.value ? parseInt(cashbackSetting.value, 10) : 50;
    const premiumUpgradePrice = premiumUpgradeSetting?.value ? parseInt(premiumUpgradeSetting.value, 10) : 5000;
    const discountPercent = isPremium ? 100 : (originalPrice > 0 ? Math.round(((originalPrice - defaultSpecialPrice) / originalPrice) * 100) : 60);

    return NextResponse.json({
      success: true,
      enabled: isOfferEnabled,
      originalPrice,
      specialPrice,
      cashbackAmount,
      discountPercent,
      premiumUpgradePrice,
      isPremium,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      enabled: true,
      originalPrice: 500,
      specialPrice: 200,
      cashbackAmount: 50,
      discountPercent: 60,
      premiumUpgradePrice: 5000,
      isPremium: false,
    });
  }
}
