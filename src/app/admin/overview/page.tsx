"use client";

import { useEffect, useState } from "react";
import { Users, UserPlus, MessageCircle, Phone, Flag, ShieldAlert, Loader2 } from "lucide-react";
import KpiCard from "@/components/admin/KpiCard";
import GrowthChart from "@/components/admin/GrowthChart";
import { adminFetch } from "@/components/admin/api";

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<any>(null);
  const [growth, setGrowth] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [overviewRes, growthRes] = await Promise.all([
          adminFetch("stats/overview"),
          adminFetch("stats/growth?days=30")
        ]);
        setStats(overviewRes);
        setGrowth(growthRes);
      } catch (err: any) {
        setError(err.message || "Failed to load stats");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-lg">
        <h3 className="text-rose-400 font-bold flex items-center gap-2">
          <ShieldAlert className="w-5 h-5" /> Error Loading Overview
        </h3>
        <p className="text-sm text-slate-300 mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">CEO & Admin Overview</h2>
        <p className="text-slate-400 text-sm mt-1">Live metrics and platform health snapshot.</p>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <KpiCard
            title="Total Users"
            value={stats.totalUsers.toLocaleString()}
            icon={Users}
            trend="neutral"
            trendLabel="Lifetime"
          />
          <KpiCard
            title="New This Week"
            value={stats.newThisWeek.toLocaleString()}
            icon={UserPlus}
            trend="up"
            trendLabel="from last week"
          />
          <KpiCard
            title="Active Today (DAU)"
            value={stats.activeToday.toLocaleString()}
            icon={ActivityIcon}
            trend="up"
            trendLabel="active"
          />
          <KpiCard
            title="Messages Sent Today"
            value={stats.messagesSentToday.toLocaleString()}
            icon={MessageCircle}
          />
          <KpiCard
            title="Voice Sessions Today"
            value={stats.voiceSessionsToday.toLocaleString()}
            icon={Phone}
          />
          <KpiCard
            title="Pending Reports"
            value={stats.pendingReports.toLocaleString()}
            icon={Flag}
            trend={stats.pendingReports > 0 ? "down" : "neutral"}
            trendLabel={stats.pendingReports > 0 ? "Requires attention" : "Queue empty"}
          />
          <KpiCard
            title="Critical AI Alerts"
            value={stats.criticalAiAlerts.toLocaleString()}
            icon={ShieldAlert}
            trend={stats.criticalAiAlerts > 0 ? "down" : "neutral"}
            trendLabel="High risk behavior"
          />
        </div>
      )}

      <div className="pt-4">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          Platform Growth (30 Days)
        </h3>
        <GrowthChart data={growth} />
      </div>
    </div>
  );
}

function ActivityIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}
