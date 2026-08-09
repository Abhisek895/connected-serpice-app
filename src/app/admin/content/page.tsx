"use client";

import { useEffect, useState } from "react";
import { FileHeart, Loader2, ShieldAlert, Eye } from "lucide-react";
import { getAdminEvents } from "@/app/admin/actions";

export default function ContentPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getAdminEvents()
      .then(setEvents)
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, []);

  const statusColors: Record<string, string> = {
    PUBLISHED: "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20",
    DRAFT: "text-amber-400 bg-amber-500/10 border border-amber-500/20",
    DISABLED: "text-slate-400 bg-slate-800/50 border border-slate-700",
    EXPIRED: "text-rose-400 bg-rose-500/10 border border-rose-500/20",
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
          <FileHeart className="w-6 h-6 text-rose-400" /> Memory Pages
        </h2>
        <p className="text-slate-400 text-sm mt-1">All generated proposal and memory pages in the platform.</p>
      </div>

      <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {events.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">No pages created yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-[#1e293b]/50 border-b border-slate-800 text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-6 py-4 font-semibold">Slug / Link</th>
                  <th className="px-6 py-4 font-semibold">Owner</th>
                  <th className="px-6 py-4 font-semibold">Theme</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Views</th>
                  <th className="px-6 py-4 font-semibold">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {events.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs text-indigo-400">/p/{e.slug}</span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      <div>{e.user?.name || "—"}</div>
                      <div className="text-slate-500">{e.user?.email}</div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">{e.themeId}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[e.status] || ""}`}>{e.status}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1 text-blue-400 text-xs">
                        <Eye className="w-3.5 h-3.5" /> {e._count?.responses ?? 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">{new Date(e.createdAt).toLocaleDateString()}</td>
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
