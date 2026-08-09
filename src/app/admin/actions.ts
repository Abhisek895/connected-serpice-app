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
    select: { id: true, name: true, email: true, role: true, plan: true, createdAt: true },
  });
  return { users, total: users.length };
}

// ─── Payments ────────────────────────────────────────────────────────────────
export async function getAdminPayments() {
  try {
    await checkAuth();
    const payments = await prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, email: true } } },
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
