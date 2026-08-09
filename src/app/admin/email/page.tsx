"use client";

import { useEffect, useState } from "react";
import { Loader2, ShieldAlert, Mail } from "lucide-react";
import { adminFetch } from "@/components/admin/api";

export default function GenericPage() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        // No GET endpoint exists for email tools yet in VibePass backend
        // We simulate a successful load of an empty dashboard
        const res = { data: [] };
        // Handle various response formats gracefully
        const items = Array.isArray(res) ? res : (res.data || res.items || res.logs || res.reports || []);
        setData(Array.isArray(items) ? items : []);
      } catch (err: any) {
        setError(err.message || "Failed to load data");
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
          <ShieldAlert className="w-5 h-5" /> Error Loading Email Tools
        </h3>
        <p className="text-sm text-slate-300 mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Mail className="w-6 h-6 text-indigo-500" /> Email Tools
        </h2>
        <p className="text-slate-400 text-sm mt-1">Manage email campaigns and templates.</p>
      </div>

      <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 text-center text-slate-400 text-sm">
          {data.length === 0 ? "No data available for Email Tools." : "Loaded \ records."}
        </div>
      </div>
    </div>
  );
}
