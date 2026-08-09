"use client";

import { useEffect, useState } from "react";
import { Flag, Loader2, ShieldAlert, Eye, Check, X } from "lucide-react";
import { getAdminReports } from "@/app/admin/actions";

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getAdminReports()
      .then(setReports)
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, []);

  const actionIcon: Record<string, React.ReactNode> = {
    VIEWED: <span className="flex items-center gap-1 text-blue-400 text-xs font-medium"><Eye className="w-3.5 h-3.5" /> Viewed</span>,
    ACCEPTED: <span className="flex items-center gap-1 text-emerald-400 text-xs font-medium"><Check className="w-3.5 h-3.5" /> Accepted</span>,
    REJECTED: <span className="flex items-center gap-1 text-rose-400 text-xs font-medium"><X className="w-3.5 h-3.5" /> Rejected</span>,
  };

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
          <Flag className="w-6 h-6 text-amber-400" /> Proposal Link Activity
        </h2>
        <p className="text-slate-400 text-sm mt-1">All visitor interactions with generated proposal links.</p>
      </div>

      <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {reports.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">No link interactions recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-[#1e293b]/50 border-b border-slate-800 text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-6 py-4 font-semibold">Page / Slug</th>
                  <th className="px-6 py-4 font-semibold">Owner</th>
                  <th className="px-6 py-4 font-semibold">Action</th>
                  <th className="px-6 py-4 font-semibold">Country</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {reports.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-indigo-400">/p/{r.event?.slug}</td>
                    <td className="px-6 py-4 text-xs text-slate-400">{r.event?.user?.email || "—"}</td>
                    <td className="px-6 py-4">{actionIcon[r.action] || r.action}</td>
                    <td className="px-6 py-4 text-slate-400 text-xs">{r.country || "—"}</td>
                    <td className="px-6 py-4 text-slate-400 text-xs">{new Date(r.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
