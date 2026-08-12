"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true, name: true, email: true, role: true, plan: true,
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
      payments: { select: { id: true, amount: true, plan: true, status: true, createdAt: true } },
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
  const eventIds = userEvents.map(e => e.id);

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
  const payments = await prisma.payment.aggregate({ where: { status: "SUCCESS" }, _sum: { amount: true } });
  const totalRevenue = (payments._sum.amount || 0) / 100;
  return { totalUsers, newThisWeek, activePages, linkViews, totalRevenue };
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
export async function getAdminUsers(search = "", role = "") {
  await checkAuth();
  const users = await prisma.user.findMany({
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
      createdAt: true,
      referralCode: true,
      walletBalance: true,
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
        select: { amount: true },
      },
    },
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
  const [recentUsers, recentEvents, recentPayments] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 30, select: { id: true, name: true, email: true, role: true, createdAt: true } }),
    prisma.event.findMany({ orderBy: { createdAt: "desc" }, take: 30, include: { user: { select: { name: true, email: true } } } }),
    prisma.payment.findMany({ orderBy: { createdAt: "desc" }, take: 30, include: { user: { select: { name: true, email: true } } } }),
  ]);

  const logs = [
    ...recentUsers.map((u) => ({ type: "USER_SIGNUP", actor: u.email || u.name || u.id, detail: `Role: ${u.role}`, at: u.createdAt })),
    ...recentEvents.map((e) => ({ type: "PAGE_CREATED", actor: e.user?.email || e.userId, detail: `Slug: ${e.slug} | Status: ${e.status}`, at: e.createdAt })),
    ...recentPayments.map((p) => ({ type: "PAYMENT", actor: p.user?.email || p.userId, detail: `₹${(p.amount / 100).toFixed(2)} — ${p.status}`, at: p.createdAt })),
  ].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

  return logs.slice(0, 80);
}

// ─── System Health ───────────────────────────────────────────────────────────
export async function getAdminSystemHealth() {
  await checkAuth();
  const [totalUsers, totalEvents, totalPayments, totalViews, publishedPages] = await Promise.all([
    prisma.user.count(),
    prisma.event.count(),
    prisma.payment.count({ where: { status: "SUCCESS" } }),
    prisma.response.count(),
    prisma.event.count({ where: { status: "PUBLISHED" } }),
  ]);
  return { totalUsers, totalEvents, totalPayments, totalViews, publishedPages, dbStatus: "healthy", appVersion: "1.0.0" };
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
  content?: { title?: string; description?: string; thumbnailUrl?: string }
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
    },
    create: {
      name: demoId,
      price,
      durationDays,
      isActive,
      title: content?.title,
      description: content?.description,
      thumbnailUrl: content?.thumbnailUrl,
    }
  });
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
    const rewardSetting = await prisma.systemSetting.findUnique({ where: { key: "referral_reward_amount" } });
    const minWithdrawalSetting = await prisma.systemSetting.findUnique({ where: { key: "referral_min_withdrawal" } });
    const enabledSetting = await prisma.systemSetting.findUnique({ where: { key: "referral_enabled" } });

    return {
      success: true,
      settings: {
        rewardAmount: rewardSetting?.value ? parseInt(rewardSetting.value, 10) : 500, // ₹500 default
        minWithdrawal: minWithdrawalSetting?.value ? parseInt(minWithdrawalSetting.value, 10) : 500, // ₹500 default
        enabled: enabledSetting?.value !== "false", // default true
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      settings: { rewardAmount: 500, minWithdrawal: 500, enabled: true },
    };
  }
}

export async function updateAdminReferralSettings({
  rewardAmount,
  minWithdrawal,
  enabled,
}: {
  rewardAmount: number;
  minWithdrawal: number;
  enabled: boolean;
}) {
  await checkAuth();
  try {
    await prisma.$transaction([
      prisma.systemSetting.upsert({
        where: { key: "referral_reward_amount" },
        update: { value: rewardAmount.toString(), description: "Reward amount in INR per paid referral" },
        create: { key: "referral_reward_amount", value: rewardAmount.toString(), description: "Reward amount in INR per paid referral" },
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

