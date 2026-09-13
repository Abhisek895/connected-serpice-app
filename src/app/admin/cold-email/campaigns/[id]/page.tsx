"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Mail, Play, Pause, XCircle, Trash2, ArrowLeft, RefreshCw, CheckCircle,
  AlertCircle, Clock, ShieldCheck, Zap, Server, Loader2, Filter, Search
} from "lucide-react";
import {
  getColdCampaignById,
  startColdCampaign,
  pauseColdCampaign,
  resumeColdCampaign,
  cancelColdCampaign,
  deleteColdCampaign,
  getColdLogs,
} from "../../actions";

export default function CampaignDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: campaignId } = use(params);
  const router = useRouter();

  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // Recipient search & filter
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadCampaign = useCallback(async () => {
    try {
      const data = await getColdCampaignById(campaignId);
      setCampaign(data);
    } catch (err: any) {
      showToast(err.message || "Failed to load campaign details", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [campaignId]);

  useEffect(() => {
    loadCampaign();
  }, [loadCampaign]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadCampaign();
  };

  const handleStart = async () => {
    setActionLoading(true);
    try {
      const res = await startColdCampaign(campaignId);
      showToast(res.message, "success");
      loadCampaign();
    } catch (err: any) {
      showToast(err.message || "Failed to start campaign", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePause = async () => {
    setActionLoading(true);
    try {
      const res = await pauseColdCampaign(campaignId);
      showToast(res.message, "info");
      loadCampaign();
    } catch (err: any) {
      showToast(err.message || "Failed to pause campaign", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleResume = async () => {
    setActionLoading(true);
    try {
      const res = await resumeColdCampaign(campaignId);
      showToast(res.message, "success");
      loadCampaign();
    } catch (err: any) {
      showToast(err.message || "Failed to resume campaign", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this campaign? Pending recipients will be skipped.")) return;
    setActionLoading(true);
    try {
      const res = await cancelColdCampaign(campaignId);
      showToast(res.message, "info");
      loadCampaign();
    } catch (err: any) {
      showToast(err.message || "Failed to cancel campaign", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this campaign?")) return;
    setActionLoading(true);
    try {
      await deleteColdCampaign(campaignId);
      showToast("Campaign deleted.", "info");
      router.push("/admin/cold-email");
    } catch (err: any) {
      showToast(err.message || "Failed to delete campaign", "error");
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-3" />
        <p className="text-sm font-medium">Loading Campaign Details...</p>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="p-12 text-center text-slate-400 space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="text-xl font-bold text-white">Campaign Not Found</h3>
        <Link href="/admin/cold-email" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold">
          <ArrowLeft className="w-4 h-4" /> Return to Dashboard
        </Link>
      </div>
    );
  }

  const total = campaign.totalRecipients || 1;
  const processed = campaign.sentCount + campaign.failedCount;
  const successRate = processed > 0 ? Math.round((campaign.sentCount / processed) * 100) : 100;

  const filteredRecipients = (campaign.recipients || []).filter((r: any) => {
    const matchesSearch = !searchQuery || r.email.toLowerCase().includes(searchQuery.toLowerCase()) || (r.name && r.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusBadgeColor: Record<string, string> = {
    DRAFT: "bg-slate-800 text-slate-400 border-slate-700",
    QUEUED: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    RUNNING: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    PAUSED: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    COMPLETED: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    CANCELLED: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl font-semibold text-xs text-white shadow-2xl flex items-center gap-2.5 transition animate-in fade-in slide-in-from-top-4 ${toast.type === "success" ? "bg-emerald-600" : toast.type === "error" ? "bg-rose-600" : "bg-indigo-600"
            }`}
        >
          {toast.type === "success" && <CheckCircle className="w-4 h-4" />}
          {toast.type === "error" && <AlertCircle className="w-4 h-4" />}
          {toast.type === "info" && <Zap className="w-4 h-4" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <Link href="/admin/cold-email" className="text-xs text-slate-400 hover:text-white flex items-center gap-1 mb-2 font-semibold">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Cold Email Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-white tracking-tight">{campaign.name}</h2>
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusBadgeColor[campaign.status]}`}>
              {campaign.status}
            </span>
          </div>
          <p className="text-slate-400 text-xs mt-1 font-mono">Subject: {campaign.subject}</p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-indigo-400" : ""}`} /> Refresh
          </button>

          {(campaign.status === "DRAFT" || campaign.status === "QUEUED") && (
            <button onClick={handleStart} disabled={actionLoading} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md">
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-white" />} Start Campaign
            </button>
          )}

          {campaign.status === "RUNNING" && (
            <button onClick={handlePause} disabled={actionLoading} className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md">
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pause className="w-3.5 h-3.5 fill-white" />} Pause
            </button>
          )}

          {campaign.status === "PAUSED" && (
            <button onClick={handleResume} disabled={actionLoading} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md">
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-white" />} Resume
            </button>
          )}

          {(campaign.status === "RUNNING" || campaign.status === "PAUSED") && (
            <button onClick={handleCancel} disabled={actionLoading} className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl text-xs font-bold">
              Cancel
            </button>
          )}

          <button onClick={handleDelete} disabled={actionLoading} className="p-2 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-xl">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress & Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Progress Bar Card */}
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 md:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Campaign Progress</span>
            <span className="text-lg font-extrabold text-indigo-400 font-mono">{campaign.progress}%</span>
          </div>
          <div className="w-full h-3 bg-[#0a0f1e] rounded-full overflow-hidden border border-slate-800">
            <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 transition-all duration-500" style={{ width: `${campaign.progress}%` }} />
          </div>
          <div className="grid grid-cols-4 gap-2 text-center text-xs pt-2">
            <div><span className="text-slate-500 text-[10px] block">Total</span><span className="font-bold text-white text-base">{campaign.totalRecipients}</span></div>
            <div><span className="text-emerald-400 text-[10px] block">Sent</span><span className="font-bold text-emerald-400 text-base">{campaign.sentCount}</span></div>
            <div><span className="text-rose-400 text-[10px] block">Failed</span><span className="font-bold text-rose-400 text-base">{campaign.failedCount}</span></div>
            <div><span className="text-amber-400 text-[10px] block">Pending</span><span className="font-bold text-amber-400 text-base">{campaign.pendingCount}</span></div>
          </div>
        </div>

        {/* Rate & Config Card */}
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 space-y-3 text-xs text-slate-300">
          <h4 className="font-bold text-white uppercase text-[11px] tracking-wider border-b border-slate-800 pb-2">Rate & Timestamps</h4>
          <div className="flex justify-between font-mono"><span className="text-slate-500">Hourly Limit:</span><span>{campaign.hourlyLimit || 30} emails/hr</span></div>
          <div className="flex justify-between font-mono"><span className="text-slate-500">Daily Limit:</span><span>{campaign.dailyLimit || 200} emails/day</span></div>
          <div className="flex justify-between font-mono"><span className="text-slate-500">Delay:</span><span>{((campaign.delayMs || 5000) / 1000).toFixed(1)}s</span></div>
          <div className="flex justify-between font-mono"><span className="text-slate-500">Success Rate:</span><span className="text-emerald-400 font-bold">{successRate}%</span></div>
          <div className="flex justify-between font-mono"><span className="text-slate-500">Created:</span><span>{new Date(campaign.createdAt).toLocaleDateString()}</span></div>
        </div>
      </div>

      {/* Recipient Details Table */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Mail className="w-5 h-5 text-indigo-400" /> Recipient Queue ({filteredRecipients.length})
          </h3>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search recipient..."
                className="pl-9 pr-3 py-1.5 bg-[#0a0f1e] border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-[#0a0f1e] border border-slate-700 rounded-xl text-slate-300 text-xs"
            >
              <option value="all">All Statuses</option>
              <option value="PENDING">PENDING</option>
              <option value="PROCESSING">PROCESSING</option>
              <option value="SENT">SENT</option>
              <option value="FAILED">FAILED</option>
              <option value="SKIPPED">SKIPPED</option>
            </select>
          </div>
        </div>

        {filteredRecipients.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">No recipients match filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#0a0f1e] text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3">Recipient Email</th>
                  <th className="p-3">Name</th>
                  <th className="p-3 text-center">Attempts</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3">Sent At / Last Error</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
                {filteredRecipients.map((r: any) => (
                  <tr key={r.id} className="hover:bg-slate-900/50 transition">
                    <td className="p-3 font-semibold text-white">{r.email}</td>
                    <td className="p-3 text-slate-400">{r.name || "—"}</td>
                    <td className="p-3 text-center">{r.attemptCount}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${r.status === "SENT" ? "bg-emerald-500/20 text-emerald-400" : r.status === "FAILED" ? "bg-rose-500/20 text-rose-400" : r.status === "PROCESSING" ? "bg-purple-500/20 text-purple-400 animate-pulse" : "bg-slate-800 text-slate-400"
                        }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400 max-w-xs truncate">
                      {r.sentAt ? new Date(r.sentAt).toLocaleString() : r.lastError || "—"}
                    </td>
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
