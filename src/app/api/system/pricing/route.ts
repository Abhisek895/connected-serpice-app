import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const originalPriceSetting = await prisma.systemSetting.findUnique({ where: { key: "offer_original_price" } });
    const specialPriceSetting = await prisma.systemSetting.findUnique({ where: { key: "offer_special_price" } });
    const cashbackSetting = await prisma.systemSetting.findUnique({ where: { key: "offer_cashback_amount" } });

    const originalPrice = originalPriceSetting?.value ? parseInt(originalPriceSetting.value, 10) : 499;
    const specialPrice = specialPriceSetting?.value ? parseInt(specialPriceSetting.value, 10) : 199;
    const cashbackAmount = cashbackSetting?.value ? parseInt(cashbackSetting.value, 10) : 50;
    const discountPercent = originalPrice > 0 ? Math.round(((originalPrice - specialPrice) / originalPrice) * 100) : 60;

    return NextResponse.json({
      success: true,
      originalPrice,
      specialPrice,
      cashbackAmount,
      discountPercent,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      originalPrice: 499,
      specialPrice: 199,
      cashbackAmount: 50,
      discountPercent: 60,
    });
  }
}
