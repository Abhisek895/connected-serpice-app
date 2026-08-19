import { Suspense } from "react";
import DashboardDemos from "./DashboardDemos";
import EventCardContainer from "./EventCardContainer";
import DashboardStats from "./DashboardStats";
import DashboardEmptyState from "./DashboardEmptyState";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import DeleteAllButton from "./DeleteAllButton";
import DashboardTourClient from "./DashboardTourClient";
import Link from "next/link";
import { Gift, ArrowRight } from "lucide-react";

export default async function DashboardPage() {
  const { userId } = await getCurrentUser();
  const dbUser = await prisma.user.findUnique({ where: { id: userId } });
  const isPremiumUser = dbUser?.plan === "PREMIUM" || dbUser?.role === "super_admin";

  const events = await prisma.event.findMany({
    where: { userId },
    include: { theme: true, responses: true },
    orderBy: { createdAt: "desc" }
  });

  const themePricing = (await prisma.theme.findMany()) as unknown as Array<{
    name: string; price: number; durationDays: number; isActive: boolean;
    title?: string | null; description?: string | null; thumbnailUrl?: string | null;
  }>;

  const hasReferrals = (dbUser as any)?.referrals?.length > 0;
  const walletBalance = (dbUser as any)?.walletBalance ?? 0;

  return (
    <DashboardTourClient>
      <div className="space-y-8">

        {/* ── Animated Stats Bar (only when user has events) ── */}
        <DashboardStats events={events} />

        {/* ── Referral Banner (shown for all users to drive viral adoption) ── */}
        <Link
          href="/dashboard/referral"
          className="flex items-center justify-between gap-4 w-full px-5 py-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-purple-500/10 border border-amber-400/20 hover:border-amber-400/40 hover:from-amber-500/15 hover:via-rose-500/15 hover:to-purple-500/15 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-rose-500 flex items-center justify-center shadow-md shadow-amber-400/30 shrink-0">
              <Gift className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">
                {walletBalance > 0
                  ? `💰 Wallet: ₹${(walletBalance / 100).toFixed(0)} available`
                  : "💰 Earn rewards for every friend you refer!"}
              </p>
              <p className="text-xs text-slate-500">
                {walletBalance > 0
                  ? "Apply your wallet balance at checkout to save on templates"
                  : "Share your unique link → They sign up → You earn instantly"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-rose-500 group-hover:text-rose-600 shrink-0">
            <span className="hidden sm:block">Referral Hub</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        {/* ── Template Demos ── */}
        <Suspense fallback={<div className="py-8 text-center text-slate-400 text-sm">Loading templates...</div>}>
          <DashboardDemos themePricing={themePricing} isPremiumUser={isPremiumUser} />
        </Suspense>

        {/* ── Saved Events OR Empty State ── */}
        {events.length > 0 ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <span>My Saved Links & Events 💌</span>
                  <span className="bg-rose-100 text-rose-600 px-2.5 py-0.5 rounded-full text-xs font-bold">
                    {events.length} Saved
                  </span>
                </h2>
                <p className="text-slate-500 text-sm mt-0.5">
                  Your generated proposal links stay saved here permanently even after refreshing the page!
                </p>
              </div>
              <DeleteAllButton />
            </div>
            <EventCardContainer events={events} isPremiumUser={isPremiumUser} />
          </div>
        ) : (
          <DashboardEmptyState />
        )}

      </div>
    </DashboardTourClient>
  );
}
