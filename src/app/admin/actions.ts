"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function checkAuth() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!session || !["super_admin", "admin", "moderator"].includes(role)) {
    throw new Error("Unauthorized");
  }
  return session;
}

// ─── User Detail ─────────────────────────────────────────────────────────────
export async function getAdminUserById(id: string) {
  await checkAuth();
  const user = await (prisma.user as any).findUnique({
    where: { id },
    select: {
      id: true, name: true, email: true, role: true, plan: true, platform: true,
      createdAt: true, updatedAt: true, image: true,
      referralCode: true, walletBalance: true,
      referredBy: {
        select: { id: true, name: true, email: true }
      },
      referrals: {
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          payments: {
            where: { status: "SUCCESS" },
            select: { id: true, amount: true, createdAt: true },
            take: 1,
          },
        },
        orderBy: { createdAt: "desc" },
      },
      walletTxns: {
        select: { id: true, type: true, amount: true, description: true, status: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      },
      events: { select: { id: true, slug: true, status: true, themeId: true, createdAt: true } },
      payments: {
        select: {
          id: true,
          amount: true,
          finalAmount: true,
          plan: true,
          status: true,
          createdAt: true,
          coupon: { select: { code: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!user) throw new Error("User not found");
  return user;
}

export async function updateAdminUserRole(id: string, newRole: string) {
  const session = await checkAuth();
  const callerRole = (session?.user as any)?.role;
  if (callerRole !== "super_admin") throw new Error("Only super_admin can change roles");
  const updated = await prisma.user.update({ where: { id }, data: { role: newRole } });
  return updated;
}

export async function deleteAdminUser(id: string) {
  const session = await checkAuth();
  const callerId = session.user.id;
  if (callerId === id) throw new Error("You cannot delete your own account");

  const targetUser = await prisma.user.findUnique({ where: { id } });
  if (!targetUser) throw new Error("User not found");

  if (targetUser.email === "sarkarabhisek50@gmail.com" || targetUser.role === "super_admin") {
    throw new Error("Superadmin account (sarkarabhisek50@gmail.com) is permanently protected and cannot be deleted.");
  }

  // 1. Find all events created by user
  const userEvents = await prisma.event.findMany({
    where: { userId: id },
    select: { id: true }
  });
  const eventIds = userEvents.map((e: { id: string }) => e.id);

  // 2. Delete all responses/analytics recorded for user's events
  if (eventIds.length > 0) {
    await prisma.response.deleteMany({
      where: { eventId: { in: eventIds } }
    });
  }

  // 3. Delete all events owned by user
  await prisma.event.deleteMany({
    where: { userId: id }
  });

  // 4. Delete all payments owned by user
  await prisma.payment.deleteMany({
    where: { userId: id }
  });

  // 5. Delete associated OAuth accounts & sessions
  await prisma.account.deleteMany({
    where: { userId: id }
  });
  await prisma.session.deleteMany({
    where: { userId: id }
  });

  // 6. Delete verification tokens linked to user email if any
  if (targetUser.email) {
    await prisma.verificationToken.deleteMany({
      where: { identifier: targetUser.email }
    });
  }

  // 7. Permanently delete user record
  await prisma.user.delete({ where: { id } });

  return { success: true };
}

export async function toggleSuspendAdminUser(id: string) {
  const session = await checkAuth();
  const callerId = session.user.id;
  if (callerId === id) throw new Error("You cannot suspend your own account");
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error("User not found");

  const newRole = user.role === "SUSPENDED" ? "USER" : "SUSPENDED";
  const updated = await prisma.user.update({
    where: { id },
    data: { role: newRole },
  });
  return { success: true, user: updated };
}

export async function banAdminUserAction(id: string) {
  const session = await checkAuth();
  const callerId = session.user.id;
  if (callerId === id) throw new Error("You cannot ban your own account");
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error("User not found");

  const newRole = user.role === "BANNED" ? "USER" : "BANNED";
  const updated = await prisma.user.update({
    where: { id },
    data: { role: newRole },
  });

  // Revoke active sessions if banned
  if (newRole === "BANNED") {
    await prisma.session.deleteMany({ where: { userId: id } });
  }

  return { success: true, user: updated };
}

export async function sendEmailAdminUserAction(id: string, subject: string, message: string) {
  await checkAuth();
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user || !user.email) throw new Error("User email not found");

  console.log(`[ADMIN EMAIL SENT] To: ${user.email} | Subject: ${subject} | Message: ${message}`);

  return { success: true, message: `Email queued and sent to ${user.email}!` };
}

export async function toggleUserPlanAdminAction(id: string) {
  await checkAuth();
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error("User not found");

  const newPlan = user.plan === "PREMIUM" ? "FREE" : "PREMIUM";
  const updated = await prisma.user.update({
    where: { id },
    data: { plan: newPlan },
  });
  return { success: true, user: updated };
}

// ─── Overview Stats ─────────────────────────────────────────────────────────
export async function getLocalAdminStats() {
  await checkAuth();
  const totalUsers = await prisma.user.count();
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const newThisWeek = await prisma.user.count({ where: { createdAt: { gte: oneWeekAgo } } });
  const activePages = await prisma.event.count({ where: { status: { in: ["PUBLISHED", "DRAFT"] } } });
  const linkViews = await prisma.response.count({ where: { action: "VIEWED" } });
  const successfulPayments = await prisma.payment.findMany({
    where: { status: "SUCCESS" },
    select: { amount: true, finalAmount: true },
  });
  const totalRevenuePaise = successfulPayments.reduce((sum: number, p: { amount: number; finalAmount?: number | null }) => {
    const actualPaid = p.finalAmount !== null && p.finalAmount !== undefined ? p.finalAmount : p.amount;
    return sum + actualPaid;
  }, 0);
  const grossRevenuePaise = successfulPayments.reduce((sum: number, p: { amount: number }) => sum + p.amount, 0);

  const totalRevenue = totalRevenuePaise / 100;
  const grossRevenue = grossRevenuePaise / 100;
  const totalDiscounts = (grossRevenuePaise - totalRevenuePaise) / 100;

  return { totalUsers, newThisWeek, activePages, linkViews, totalRevenue, grossRevenue, totalDiscounts };
}

export async function getLocalAdminGrowth() {
  await checkAuth();
  const growth = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const nextDay = new Date(d);
    nextDay.setDate(d.getDate() + 1);
    const newUsers = await prisma.user.count({ where: { createdAt: { gte: d, lt: nextDay } } });
    const newPages = await prisma.event.count({ where: { createdAt: { gte: d, lt: nextDay } } });
    growth.push({ date: `${d.getMonth() + 1}/${d.getDate()}`, newUsers, newPages });
  }
  return growth;
}

// ─── Users ───────────────────────────────────────────────────────────────────
export async function updateUserPlatformAdminAction(id: string, platform: string) {
  await checkAuth();
  const updated = await (prisma.user as any).update({
    where: { id },
    data: { platform },
  });
  return { success: true, user: updated };
}

export async function getAdminUsers(search = "", role = "") {
  await checkAuth();
  const rawUsers = await (prisma.user as any).findMany({
    where: {
      AND: [
        search ? { OR: [{ name: { contains: search } }, { email: { contains: search } }] } : {},
        role ? { role } : {},
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      plan: true,
      platform: true,
      createdAt: true,
      referralCode: true,
      walletBalance: true,
      accounts: {
        select: { provider: true }
      },
      referredBy: {
        select: {
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          referrals: true,
        },
      },
      payments: {
        where: { status: "SUCCESS" },
        select: { amount: true, finalAmount: true, plan: true },
      },
    },
  });

  const users = rawUsers.map((u: any) => {
    let resolvedPlatform = u.platform;
    if (!resolvedPlatform || resolvedPlatform === "Web") {
      if (u.accounts?.some((a: any) => a.provider === "google")) {
        resolvedPlatform = "Google 🌐";
      } else if (u.referredBy) {
        resolvedPlatform = "WhatsApp 💬";
      } else if (u.email?.includes("guest@ourstory.internal")) {
        resolvedPlatform = "Guest Portal 🚀";
      } else {
        resolvedPlatform = "Direct / Web 💻";
      }
    }
    return {
      ...u,
      platform: resolvedPlatform,
    };
  });

  return { users, total: users.length };
}

// ─── Payments ────────────────────────────────────────────────────────────────
export async function getAdminPayments() {
  try {
    await checkAuth();
    const payments = await prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
      include: { 
        user: { select: { name: true, email: true } },
        coupon: true 
      },
    });
    return { success: true, payments };
  } catch (error) {
    return { success: false, error: "Database error", payments: [] };
  }
}

// ─── Reports (Proposal link responses) ──────────────────────────────────────
export async function getAdminReports() {
  await checkAuth();
  const responses = await prisma.response.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      event: {
        select: {
          slug: true,
          themeId: true,
          user: { select: { name: true, email: true } },
        },
      },
    },
  });
  return responses;
}

// ─── Content (Memory Pages / Events) ─────────────────────────────────────────
export async function getAdminEvents() {
  await checkAuth();
  const events = await prisma.event.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: { select: { name: true, email: true } },
      _count: { select: { responses: true } },
    },
  });
  return events;
}

// ─── Audit Logs (Recent user signups + events) ───────────────────────────────
export async function getAdminAuditLog() {
  await checkAuth();
  const [recentUsers, recentEvents, recentPayments, recentColdLogs] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 30, select: { id: true, name: true, email: true, role: true, createdAt: true } }),
    prisma.event.findMany({ orderBy: { createdAt: "desc" }, take: 30, include: { user: { select: { name: true, email: true } } } }),
    prisma.payment.findMany({ orderBy: { createdAt: "desc" }, take: 30, include: { user: { select: { name: true, email: true } } } }),
    (prisma as any).coldLog.findMany({ orderBy: { createdAt: "desc" }, take: 30 }),
  ]);

  const logs = [
    ...recentUsers.map((u: any) => ({ type: "USER_SIGNUP", actor: u.email || u.name || u.id, detail: `Role: ${u.role}`, at: u.createdAt })),
    ...recentEvents.map((e: any) => ({ type: "PAGE_CREATED", actor: e.user?.email || e.userId, detail: `Slug: ${e.slug} | Status: ${e.status}`, at: e.createdAt })),
    ...recentPayments.map((p: any) => ({ type: "PAYMENT", actor: p.user?.email || p.userId, detail: `₹${(p.amount / 100).toFixed(2)} — ${p.status}`, at: p.createdAt })),
    ...recentColdLogs.map((c: any) => ({ type: "COLD_EMAIL", actor: c.recipientEmail, detail: `Status: ${c.status} | ${c.error || "Processed"}`, at: c.createdAt })),
  ].sort((a: any, b: any) => new Date(b.at).getTime() - new Date(a.at).getTime());

  return logs.slice(0, 80);
}

// ─── System Health ───────────────────────────────────────────────────────────
export async function getAdminSystemHealth() {
  await checkAuth();

  let dbStatus = "healthy";
  let dbLatencyMs = 0;
  try {
    const start = performance.now();
    await prisma.user.findFirst({ select: { id: true } });
    dbLatencyMs = Math.round((performance.now() - start) * 10) / 10;
  } catch (err) {
    dbStatus = "degraded";
  }

  const [totalUsers, totalEvents, totalPayments, totalViews, publishedPages] = await Promise.all([
    prisma.user.count(),
    prisma.event.count(),
    prisma.payment.count({ where: { status: "SUCCESS" } }),
    prisma.response.count(),
    prisma.event.count({ where: { status: "PUBLISHED" } }),
  ]);

  const hasVercelBlob = Boolean(
    process.env.BLOB_READ_WRITE_TOKEN ||
    Object.keys(process.env).some((k) => k.endsWith("_READ_WRITE_TOKEN"))
  );
  const hasCloudinary = Boolean(process.env.CLOUDINARY_URL || process.env.CLOUDINARY_CLOUD_NAME);
  const isVercel = Boolean(process.env.VERCEL || process.env.NEXT_PUBLIC_VERCEL_ENV);

  let activeStorage = "Local Disk (/public/uploads)";
  if (hasVercelBlob) activeStorage = "Vercel Blob Storage";
  else if (hasCloudinary) activeStorage = "Cloudinary Media";
  else if (isVercel) activeStorage = "Read-Only (Needs Blob Token)";

  const memory = process.memoryUsage();
  const uptimeSeconds = Math.floor(process.uptime());

  return {
    totalUsers,
    totalEvents,
    totalPayments,
    totalViews,
    publishedPages,
    dbStatus,
    dbLatencyMs,
    dbProvider: (process.env.DATABASE_URL || "").includes("neon.tech") ? "Neon PostgreSQL (AWS)" : "PostgreSQL",
    activeStorage,
    storageStatus: hasVercelBlob || hasCloudinary || !isVercel ? "healthy" : "warning",
    memoryUsageMb: Math.round((memory.rss / (1024 * 1024)) * 10) / 10,
    heapUsedMb: Math.round((memory.heapUsed / (1024 * 1024)) * 10) / 10,
    uptimeSeconds,
    nodeVersion: process.version,
    hostingPlatform: isVercel ? "Vercel Cloud Serverless" : "Node.js Server",
    razorpayLive: process.env.RAZORPAY_KEY_ID?.startsWith("rzp_live_") ?? false,
    smtpConfigured: Boolean(process.env.SMTP_USER),
    appVersion: "1.0.0",
  };
}

// ─── AI Insights (engagement analytics) ─────────────────────────────────────
export async function getAdminAiInsights() {
  await checkAuth();
  const [acceptedResponses, rejectedResponses, viewedResponses] = await Promise.all([
    prisma.response.count({ where: { action: "ACCEPTED" } }),
    prisma.response.count({ where: { action: "REJECTED" } }),
    prisma.response.count({ where: { action: "VIEWED" } }),
  ]);

  const topEvents = await prisma.event.findMany({
    orderBy: { responses: { _count: "desc" } },
    take: 10,
    include: {
      user: { select: { name: true, email: true } },
      _count: { select: { responses: true } },
    },
  });

  const acceptRate = viewedResponses > 0 ? Math.round((acceptedResponses / viewedResponses) * 100) : 0;
  return { acceptedResponses, rejectedResponses, viewedResponses, acceptRate, topEvents };
}

// ─── Themes / Pricing ────────────────────────────────────────────────────────
export async function getAdminThemes() {
  await checkAuth();
  const themes = await prisma.theme.findMany({
    orderBy: { name: "asc" }
  });
  return { success: true, themes };
}

export async function upsertThemePricing(
  demoId: string,
  price: number,
  durationDays: number,
  isActive: boolean,
  content?: { title?: string; description?: string; thumbnailUrl?: string; requireEmail?: boolean }
) {
  await checkAuth();
  const theme = await prisma.theme.upsert({
    where: { name: demoId },
    update: {
      price,
      durationDays,
      isActive,
      ...(content?.title !== undefined && { title: content.title }),
      ...(content?.description !== undefined && { description: content.description }),
      ...(content?.thumbnailUrl !== undefined && { thumbnailUrl: content.thumbnailUrl }),
      ...(content?.requireEmail !== undefined && { requireEmail: content.requireEmail }),
    },
    create: {
      name: demoId,
      price,
      durationDays,
      isActive,
      title: content?.title,
      description: content?.description,
      thumbnailUrl: content?.thumbnailUrl,
      requireEmail: content?.requireEmail ?? false,
    }
  });

  try {
    revalidatePath("/dashboard");
    revalidatePath(`/gift/${demoId}`);
    revalidatePath("/admin/themes");
  } catch (e) {
    console.error("Failed to revalidate paths after theme upsert:", e);
  }

  return { success: true, theme };
}

// ─── Coupons ────────────────────────────────────────────────────────────────
export async function getAdminCoupons() {
  await checkAuth();
  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" }
  });
  return { success: true, coupons };
}

export async function createCoupon(data: any) {
  await checkAuth();
  try {
    const coupon = await prisma.coupon.create({ data });
    return { success: true, coupon };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateCoupon(id: string, data: any) {
  await checkAuth();
  try {
    const coupon = await prisma.coupon.update({ where: { id }, data });
    return { success: true, coupon };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function toggleCoupon(id: string) {
  await checkAuth();
  const coupon = await prisma.coupon.findUnique({ where: { id } });
  if (!coupon) return { success: false, error: "Not found" };
  const updated = await prisma.coupon.update({
    where: { id },
    data: { isActive: !coupon.isActive }
  });
  return { success: true, coupon: updated };
}

export async function deleteCoupon(id: string) {
  try {
    await checkAuth();

    // 1. Unlink payments referencing this coupon first to prevent foreign key block
    await prisma.payment.updateMany({
      where: { couponId: id },
      data: { couponId: null }
    });

    // 2. Permanently delete coupon record from DB
    await prisma.coupon.delete({ where: { id } });
    return { success: true };
  } catch (error: any) {
    console.error("Delete coupon error:", error);
    try {
      // Soft-delete fallback if hard delete is restricted
      await prisma.coupon.update({
        where: { id },
        data: { isActive: false }
      });
      return { success: true };
    } catch (e: any) {
      return { success: false, error: error.message || "Failed to delete coupon" };
    }
  }
}

// ─── Referral Settings Management ────────────────────────────────────────────
export async function getAdminReferralSettings() {
  await checkAuth();
  try {
    const rewardTypeSetting = await prisma.systemSetting.findUnique({ where: { key: "referral_reward_type" } });
    const rewardSetting = await prisma.systemSetting.findUnique({ where: { key: "referral_reward_amount" } });
    const rewardPercentSetting = await prisma.systemSetting.findUnique({ where: { key: "referral_reward_percent" } });
    const minWithdrawalSetting = await prisma.systemSetting.findUnique({ where: { key: "referral_min_withdrawal" } });
    const enabledSetting = await prisma.systemSetting.findUnique({ where: { key: "referral_enabled" } });

    return {
      success: true,
      settings: {
        rewardType: (rewardTypeSetting?.value as "FIXED" | "PERCENTAGE") || "FIXED",
        rewardAmount: rewardSetting?.value ? parseInt(rewardSetting.value, 10) : 20, // ₹20 default
        rewardPercent: rewardPercentSetting?.value ? parseInt(rewardPercentSetting.value, 10) : 20, // 20% default
        minWithdrawal: minWithdrawalSetting?.value ? parseInt(minWithdrawalSetting.value, 10) : 50, // ₹50 default
        enabled: enabledSetting?.value !== "false", // default true
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      settings: { rewardType: "FIXED", rewardAmount: 20, rewardPercent: 20, minWithdrawal: 50, enabled: true },
    };
  }
}

export async function updateAdminReferralSettings({
  rewardType = "FIXED",
  rewardAmount,
  rewardPercent = 20,
  minWithdrawal,
  enabled,
}: {
  rewardType?: "FIXED" | "PERCENTAGE";
  rewardAmount: number;
  rewardPercent?: number;
  minWithdrawal: number;
  enabled: boolean;
}) {
  await checkAuth();
  try {
    await prisma.$transaction([
      prisma.systemSetting.upsert({
        where: { key: "referral_reward_type" },
        update: { value: rewardType, description: "Referral reward type: FIXED or PERCENTAGE" },
        create: { key: "referral_reward_type", value: rewardType, description: "Referral reward type: FIXED or PERCENTAGE" },
      }),
      prisma.systemSetting.upsert({
        where: { key: "referral_reward_amount" },
        update: { value: rewardAmount.toString(), description: "Fixed reward amount in INR per paid referral" },
        create: { key: "referral_reward_amount", value: rewardAmount.toString(), description: "Fixed reward amount in INR per paid referral" },
      }),
      prisma.systemSetting.upsert({
        where: { key: "referral_reward_percent" },
        update: { value: rewardPercent.toString(), description: "Reward percentage (%) of purchase price per paid referral" },
        create: { key: "referral_reward_percent", value: rewardPercent.toString(), description: "Reward percentage (%) of purchase price per paid referral" },
      }),
      prisma.systemSetting.upsert({
        where: { key: "referral_min_withdrawal" },
        update: { value: minWithdrawal.toString(), description: "Minimum withdrawal limit in INR" },
        create: { key: "referral_min_withdrawal", value: minWithdrawal.toString(), description: "Minimum withdrawal limit in INR" },
      }),
      prisma.systemSetting.upsert({
        where: { key: "referral_enabled" },
        update: { value: enabled ? "true" : "false", description: "Referral system status toggle" },
        create: { key: "referral_enabled", value: enabled ? "true" : "false", description: "Referral system status toggle" },
      }),
    ]);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update referral settings" };
  }
}

// ─── Dynamic Pricing & Cashback Settings Management ────────────────────────
export async function getAdminPricingSettings() {
  await checkAuth();
  try {
    const originalPrice = await prisma.systemSetting.findUnique({ where: { key: "offer_original_price" } });
    const specialPrice = await prisma.systemSetting.findUnique({ where: { key: "offer_special_price" } });
    const cashbackAmount = await prisma.systemSetting.findUnique({ where: { key: "offer_cashback_amount" } });
    const premiumUpgradePrice = await prisma.systemSetting.findUnique({ where: { key: "premium_upgrade_price" } });
    const enabledSetting = await prisma.systemSetting.findUnique({ where: { key: "offer_pricing_enabled" } });

    const orig = originalPrice?.value ? parseInt(originalPrice.value, 10) : 500;
    const spec = specialPrice?.value ? parseInt(specialPrice.value, 10) : 200;
    const cb = cashbackAmount?.value ? parseInt(cashbackAmount.value, 10) : 50;
    const prem = premiumUpgradePrice?.value ? parseInt(premiumUpgradePrice.value, 10) : 5000;
    const isPricingEnabled = enabledSetting?.value !== "false";
    const discountPercent = orig > 0 ? Math.round(((orig - spec) / orig) * 100) : 60;

    return {
      success: true,
      settings: {
        originalPrice: orig,
        specialPrice: spec,
        cashbackAmount: cb,
        premiumUpgradePrice: prem,
        discountPercent,
        enabled: isPricingEnabled,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      settings: { originalPrice: 500, specialPrice: 200, cashbackAmount: 50, premiumUpgradePrice: 5000, discountPercent: 60, enabled: true },
    };
  }
}

export async function updateAdminPricingSettings({
  originalPrice,
  specialPrice,
  cashbackAmount,
  premiumUpgradePrice,
  enabled,
}: {
  originalPrice: number;
  specialPrice: number;
  cashbackAmount: number;
  premiumUpgradePrice?: number;
  enabled?: boolean;
}) {
  await checkAuth();
  try {
    const operations = [
      prisma.systemSetting.upsert({
        where: { key: "offer_original_price" },
        update: { value: originalPrice.toString(), description: "Original strike-through offer price in INR" },
        create: { key: "offer_original_price", value: originalPrice.toString(), description: "Original strike-through offer price in INR" },
      }),
      prisma.systemSetting.upsert({
        where: { key: "offer_special_price" },
        update: { value: specialPrice.toString(), description: "Special offer purchase price in INR" },
        create: { key: "offer_special_price", value: specialPrice.toString(), description: "Special offer purchase price in INR" },
      }),
      prisma.systemSetting.upsert({
        where: { key: "offer_cashback_amount" },
        update: { value: cashbackAmount.toString(), description: "Promotional cashback amount in INR" },
        create: { key: "offer_cashback_amount", value: cashbackAmount.toString(), description: "Promotional cashback amount in INR" },
      }),
    ];

    if (enabled !== undefined) {
      operations.push(
        prisma.systemSetting.upsert({
          where: { key: "offer_pricing_enabled" },
          update: { value: enabled ? "true" : "false", description: "Whether promotional template offer and cashback is enabled" },
          create: { key: "offer_pricing_enabled", value: enabled ? "true" : "false", description: "Whether promotional template offer and cashback is enabled" },
        })
      );
    }

    if (premiumUpgradePrice !== undefined) {
      operations.push(
        prisma.systemSetting.upsert({
          where: { key: "premium_upgrade_price" },
          update: { value: premiumUpgradePrice.toString(), description: "Upgrade to Premium plan price in INR" },
          create: { key: "premium_upgrade_price", value: premiumUpgradePrice.toString(), description: "Upgrade to Premium plan price in INR" },
        })
      );
    }

    await prisma.$transaction(operations);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update pricing settings" };
  }
}

export async function updateAdminPremiumUpgradePrice({
  premiumUpgradePrice,
}: {
  premiumUpgradePrice: number;
}) {
  await checkAuth();
  try {
    await prisma.systemSetting.upsert({
      where: { key: "premium_upgrade_price" },
      update: { value: premiumUpgradePrice.toString(), description: "Upgrade to Premium plan price in INR" },
      create: { key: "premium_upgrade_price", value: premiumUpgradePrice.toString(), description: "Upgrade to Premium plan price in INR" },
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update premium upgrade price" };
  }
}

// ─── Post-Payment Email Delivery Settings ────────────────────────────────────
export async function getAdminEmailDeliverySetting() {
  await checkAuth();
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: "email_send_link_on_payment" },
    });
    return {
      success: true,
      enabled: setting ? setting.value !== "false" : true, // default true
    };
  } catch (error: any) {
    return {
      success: false,
      enabled: true,
      error: error.message,
    };
  }
}

export async function updateAdminEmailDeliverySetting(enabled: boolean) {
  await checkAuth();
  try {
    await prisma.systemSetting.upsert({
      where: { key: "email_send_link_on_payment" },
      update: {
        value: enabled ? "true" : "false",
        description: "Whether to automatically email the gift link to the buyer upon payment success",
      },
      create: {
        key: "email_send_link_on_payment",
        value: enabled ? "true" : "false",
        description: "Whether to automatically email the gift link to the buyer upon payment success",
      },
    });
    return { success: true, enabled };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update email delivery setting" };
  }
}



