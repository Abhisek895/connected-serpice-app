import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type ActiveCouponItem = {
  code: string;
  discountType: string;
  discountValue: number;
  expiresAt: Date | null;
  maxUses: number | null;
  usedCount: number;
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const demoId = searchParams.get("demoId")?.trim();

    // Fetch active coupons directly from DB
    const rawCoupons: ActiveCouponItem[] = await prisma.coupon.findMany({
      where: { isActive: true },
      select: {
        code: true,
        discountType: true,
        discountValue: true,
        expiresAt: true,
        maxUses: true,
        usedCount: true,
      },
      orderBy: { createdAt: "desc" },
    }).catch(() => []);

    const now = new Date();
    const activeCoupons = rawCoupons
      .filter((c: ActiveCouponItem) => {
        if (c.expiresAt && now > c.expiresAt) return false;
        if (c.maxUses && c.usedCount >= c.maxUses) return false;
        return true;
      })
      .map((c: ActiveCouponItem) => ({
        code: c.code,
        discountType: c.discountType,
        discountValue: c.discountValue,
      }));

    if (demoId) {
      let theme = await prisma.theme.findUnique({
        where: { name: demoId },
      }).catch(() => null);

      if (!theme) {
        theme = await prisma.theme.findUnique({
          where: { id: demoId },
        }).catch(() => null);
      }

      if (!theme) {
        return NextResponse.json({
          success: false,
          message: `Theme "${demoId}" not found in database`,
        }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        demoId: theme.name,
        price: theme.price,
        priceINR: theme.price / 100,
        durationDays: theme.durationDays,
        title: theme.title,
        description: theme.description,
        thumbnailUrl: theme.thumbnailUrl,
        isActive: theme.isActive,
        activeCoupons,
      });
    }

    // Return all themes configured in the database
    const themes = await prisma.theme.findMany({
      orderBy: { name: "asc" },
    }).catch(() => []);

    return NextResponse.json({
      success: true,
      themes,
      activeCoupons,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to fetch theme pricing",
    }, { status: 500 });
  }
}
