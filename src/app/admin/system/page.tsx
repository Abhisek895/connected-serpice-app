"use client";

import { useEffect, useState } from "react";
import { Activity, CheckCircle, Loader2, ShieldAlert, Gift, Save, CheckCircle2, AlertCircle } from "lucide-react";
import { getAdminSystemHealth, getAdminReferralSettings, updateAdminReferralSettings } from "@/app/admin/actions";

export default function SystemHealthPage() {
  const [health, setHealth] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Referral Settings State
  const [rewardAmount, setRewardAmount] = useState<number>(500);
  const [minWithdrawal, setMinWithdrawal] = useState<number>(500);
  const [referralEnabled, setReferralEnabled] = useState<boolean>(true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    Promise.all([
      getAdminSystemHealth(),
      getAdminReferralSettings(),
    ])
      .then(([healthData, settingsData]) => {
        setHealth(healthData);
        if (settingsData.success && settingsData.settings) {
          setRewardAmount(settingsData.settings.rewardAmount);
          setMinWithdrawal(settingsData.settings.minWithdrawal);
          setReferralEnabled(settingsData.settings.enabled);
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSaveReferralSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    setSaveMessage(null);

    try {
      const res = await updateAdminReferralSettings({
        rewardAmount: Number(rewardAmount),
        minWithdrawal: Number(minWithdrawal),
        enabled: referralEnabled,
      });

      if (res.success) {
        setSaveMessage({
          type: "success",
          text: `Referral settings saved! Reward: ₹${rewardAmount}, Min Withdrawal: ₹${minWithdrawal}, Status: ${referralEnabled ? "Active" : "Disabled"}.`,
        });
      } else {
        setSaveMessage({ type: "error", text: res.error || "Failed to save settings." });
      }
    } catch (err: any) {
      setSaveMessage({ type: "error", text: err.message || "An error occurred." });
    } finally {
      setIsSavingSettings(false);
    }
  };

  if (isLoading) return <div className="flex h-[80vh] items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;
  if (error) return (
    <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-lg">
      <h3 className="text-rose-400 font-bold flex items-center gap-2"><ShieldAlert className="w-5 h-5" /> Error</h3>
      <p className="text-sm text-slate-300 mt-1">{error}</p>
    </div>
  );

  const metrics = [
    { label: "Database", value: health?.dbStatus, good: health?.dbStatus === "healthy" },
    { label: "App Version", value: health?.appVersion, good: true },
    { label: "Total Users", value: health?.totalUsers, good: true },
    { label: "Total Pages Created", value: health?.totalEvents, good: true },
    { label: "Published Pages", value: health?.publishedPages, good: true },
    { label: "Successful Payments", value: health?.totalPayments, good: true },
    { label: "Total Link Views", value: health?.totalViews, good: true },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Activity className="w-6 h-6 text-emerald-400" /> System Health &amp; Platform Controls
        </h2>
        <p className="text-slate-400 text-sm mt-1">Real-time metrics and configurable settings for OurStory.</p>
      </div>

      {/* Referral & Wallet Settings Controls */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Referral &amp; Affiliate Settings 💰</h3>
            <p className="text-xs text-slate-400">Control the reward amount per referral, minimum withdrawal threshold, and program toggle.</p>
          </div>
        </div>

        {saveMessage && (
          <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 text-sm font-semibold ${
            saveMessage.type === "success" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-rose-500/10 border-rose-500/20 text-rose-400"
          }`}>
            {saveMessage.type === "success" ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
            <span>{saveMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleSaveReferralSettings} className="space-y-5 max-w-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Referral Reward (₹)
              </label>
              <input
                type="number"
                min="0"
                step="10"
                value={rewardAmount}
                onChange={(e) => setRewardAmount(Number(e.target.value))}
                placeholder="500"
                className="w-full px-4 py-2.5 bg-[#0a0f1e] border border-slate-700 rounded-xl text-white font-bold text-sm focus:outline-none focus:border-amber-400 transition"
              />
              <p className="text-[11px] text-slate-400 mt-1">Amount credited to referrer per paid user</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Minimum Withdrawal (₹)
              </label>
              <input
                type="number"
                min="0"
                step="50"
                value={minWithdrawal}
                onChange={(e) => setMinWithdrawal(Number(e.target.value))}
                placeholder="500"
                className="w-full px-4 py-2.5 bg-[#0a0f1e] border border-slate-700 rounded-xl text-white font-bold text-sm focus:outline-none focus:border-amber-400 transition"
              />
              <p className="text-[11px] text-slate-400 mt-1">Minimum wallet balance required for UPI payout</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Referral Program Status
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-200 cursor-pointer">
                <input
                  type="radio"
                  name="referralEnabled"
                  checked={referralEnabled === true}
                  onChange={() => setReferralEnabled(true)}
                  className="w-4 h-4 text-emerald-500 focus:ring-emerald-400"
                />
                <span className="text-emerald-400">Active (Program ON)</span>
              </label>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-200 cursor-pointer">
                <input
                  type="radio"
                  name="referralEnabled"
                  checked={referralEnabled === false}
                  onChange={() => setReferralEnabled(false)}
                  className="w-4 h-4 text-rose-500 focus:ring-rose-400"
                />
                <span className="text-rose-400">Disabled (Program OFF)</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSavingSettings}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
          >
            {isSavingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSavingSettings ? "Saving Settings…" : "Save Referral Settings"}
          </button>
        </form>
      </div>

      {/* System Metrics */}
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
