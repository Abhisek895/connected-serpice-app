"use client";

import { useEffect, useState } from "react";
import { Users, UserPlus, FileHeart, MousePointerClick, DollarSign, ShieldAlert, Loader2 } from "lucide-react";
import KpiCard from "@/components/admin/KpiCard";
import GrowthChart from "@/components/admin/GrowthChart";
import { getLocalAdminStats, getLocalAdminGrowth } from "../actions";

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<any>(null);
  const [growth, setGrowth] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [overviewRes, growthRes] = await Promise.all([
          getLocalAdminStats(),
          getLocalAdminGrowth()
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
        <h2 className="text-2xl font-bold text-white tracking-tight">Admin Overview</h2>
        <p className="text-slate-400 text-sm mt-1">Live metrics and platform health snapshot for OurStory.</p>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <KpiCard title="Total Users" value={stats.totalUsers.toLocaleString()} icon={Users} trend="neutral" trendLabel="Lifetime" />
          <KpiCard title="New This Week" value={stats.newThisWeek.toLocaleString()} icon={UserPlus} trend="up" trendLabel="from last week" />
          <KpiCard title="Memory Pages" value={stats.activePages.toLocaleString()} icon={FileHeart} trend="up" trendLabel="draft & published" />
          <KpiCard title="Total Link Views" value={stats.linkViews.toLocaleString()} icon={MousePointerClick} trend="up" trendLabel="visitor interactions" />
          <KpiCard
            title="Total Revenue"
            value={`₹${stats.totalRevenue.toLocaleString()}`}
            icon={DollarSign}
            trend={stats.totalRevenue > 0 ? "up" : "neutral"}
            trendLabel="all time"
          />
        </div>
      )}

      <div className="pt-4">
        <h3 className="text-lg font-bold text-white mb-4">Platform Growth (30 Days)</h3>
        <GrowthChart data={growth} />
      </div>
    </div>
  );
}
