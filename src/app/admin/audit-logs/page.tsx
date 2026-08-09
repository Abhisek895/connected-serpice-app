"use client";

import { useEffect, useState } from "react";
import { ListOrdered, Loader2, ShieldAlert } from "lucide-react";
import { getAdminAuditLog } from "@/app/admin/actions";

const typeColors: Record<string, string> = {
  USER_SIGNUP: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
  PAGE_CREATED: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  PAYMENT: "text-amber-400 bg-amber-500/10 border-amber-500/20",
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getAdminAuditLog()
      .then(setLogs)
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
          <ListOrdered className="w-6 h-6 text-indigo-400" /> Audit Logs
        </h2>
        <p className="text-slate-400 text-sm mt-1">All recent platform activity — signups, page creation, payments.</p>
      </div>

      <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-sm divide-y divide-slate-800">
        {logs.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">No activity recorded yet.</div>
        ) : (
          logs.map((log, i) => (
            <div key={i} className="flex items-start gap-4 px-6 py-4 hover:bg-slate-800/30 transition-colors">
              <span className={`mt-0.5 px-2 py-0.5 rounded text-xs font-bold border ${typeColors[log.type] || "text-slate-400 bg-slate-800 border-slate-700"} whitespace-nowrap`}>
                {log.type.replace("_", " ")}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-slate-200 text-sm font-medium truncate">{log.actor}</p>
                <p className="text-slate-400 text-xs mt-0.5">{log.detail}</p>
              </div>
              <span className="text-slate-500 text-xs whitespace-nowrap">{new Date(log.at).toLocaleString()}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
