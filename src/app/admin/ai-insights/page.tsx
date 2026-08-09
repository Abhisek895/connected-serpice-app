"use client";

import { useEffect, useState } from "react";
import { BrainCircuit, Loader2, ShieldAlert, Eye, Check, X, TrendingUp } from "lucide-react";
import { getAdminAiInsights } from "@/app/admin/actions";

export default function AiInsightsPage() {
  const [insights, setInsights] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getAdminAiInsights()
      .then(setInsights)
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

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <BrainCircuit className="w-6 h-6 text-purple-400" /> Engagement Insights
        </h2>
        <p className="text-slate-400 text-sm mt-1">Proposal acceptance rates and visitor engagement analytics.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Views", value: insights.viewedResponses, icon: <Eye className="w-5 h-5 text-blue-400" />, color: "text-blue-400" },
          { label: "Accepted", value: insights.acceptedResponses, icon: <Check className="w-5 h-5 text-emerald-400" />, color: "text-emerald-400" },
          { label: "Rejected", value: insights.rejectedResponses, icon: <X className="w-5 h-5 text-rose-400" />, color: "text-rose-400" },
          { label: "Accept Rate", value: `${insights.acceptRate}%`, icon: <TrendingUp className="w-5 h-5 text-purple-400" />, color: "text-purple-400" },
        ].map((stat) => (
          <div key={stat.label} className="bg-[#111827] border border-slate-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">{stat.icon}<span className="text-slate-400 text-xs uppercase tracking-wider">{stat.label}</span></div>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div>
        <h3 className="text-lg font-bold text-white mb-4">Top Performing Pages</h3>
        <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden">
          {insights.topEvents.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">No page data yet.</div>
          ) : (
            <div className="divide-y divide-slate-800">
              {insights.topEvents.map((e: any, i: number) => (
                <div key={e.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-800/30 transition-colors">
                  <span className="text-slate-500 text-sm font-bold w-6">#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-xs text-indigo-400">/p/{e.slug}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{e.user?.email || "—"}</p>
                  </div>
                  <div className="flex items-center gap-1 text-blue-400 text-sm font-bold">
                    <Eye className="w-4 h-4" /> {e._count?.responses ?? 0}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
