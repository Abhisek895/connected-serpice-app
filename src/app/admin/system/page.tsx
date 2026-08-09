"use client";

import { useEffect, useState } from "react";
import { Activity, CheckCircle, Loader2, ShieldAlert } from "lucide-react";
import { getAdminSystemHealth } from "@/app/admin/actions";

export default function SystemHealthPage() {
  const [health, setHealth] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getAdminSystemHealth()
      .then(setHealth)
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <div className="flex h-[80vh] items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;
  if (error) return (
    <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-lg">
      <h3 className="text-rose-400 font-bold flex items-center gap-2"><ShieldAlert className="w-5 h-5" /> Error</h3>
      <p className="text-sm text-slate-300 mt-1">{error}</p>
    </div>
  );

  const metrics = [
    { label: "Database", value: health.dbStatus, good: health.dbStatus === "healthy" },
    { label: "App Version", value: health.appVersion, good: true },
    { label: "Total Users", value: health.totalUsers, good: true },
    { label: "Total Pages Created", value: health.totalEvents, good: true },
    { label: "Published Pages", value: health.publishedPages, good: true },
    { label: "Successful Payments", value: health.totalPayments, good: true },
    { label: "Total Link Views", value: health.totalViews, good: true },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Activity className="w-6 h-6 text-emerald-400" /> System Health
        </h2>
        <p className="text-slate-400 text-sm mt-1">Real-time status and metrics for the OurStory platform.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((m) => (
          <div key={m.label} className="bg-[#111827] border border-slate-800 rounded-xl p-5 flex items-center gap-4">
            <CheckCircle className={`w-6 h-6 shrink-0 ${m.good ? "text-emerald-400" : "text-rose-400"}`} />
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wider">{m.label}</p>
              <p className={`text-xl font-bold mt-0.5 ${m.good ? "text-white" : "text-rose-400"}`}>{m.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
