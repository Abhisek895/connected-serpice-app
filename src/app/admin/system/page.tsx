"use client";

import { useEffect, useState } from "react";
import { Activity, CheckCircle, Loader2, ShieldAlert, Gift, Save, CheckCircle2, AlertCircle, Tag, Sparkles } from "lucide-react";
import { getAdminSystemHealth, getAdminReferralSettings, updateAdminReferralSettings, getAdminPricingSettings, updateAdminPricingSettings } from "@/app/admin/actions";

export default function SystemHealthPage() {
  const [health, setHealth] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Referral Settings State
  const [rewardType, setRewardType] = useState<"FIXED" | "PERCENTAGE">("FIXED");
  const [rewardAmount, setRewardAmount] = useState<number>(20);
  const [rewardPercent, setRewardPercent] = useState<number>(20);
  const [minWithdrawal, setMinWithdrawal] = useState<number>(500);
  const [referralEnabled, setReferralEnabled] = useState<boolean>(true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Pricing & Cashback Settings State
  const [originalPrice, setOriginalPrice] = useState<number>(499);
  const [specialPrice, setSpecialPrice] = useState<number>(199);
  const [cashbackAmount, setCashbackAmount] = useState<number>(50);
  const [isSavingPricing, setIsSavingPricing] = useState(false);
  const [pricingSaveMessage, setPricingSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    Promise.all([
      getAdminSystemHealth(),
      getAdminReferralSettings(),
      getAdminPricingSettings(),
    ])
      .then(([healthData, settingsData, pricingData]) => {
        setHealth(healthData);
        if (settingsData.success && settingsData.settings) {
          setRewardType((settingsData.settings.rewardType as "FIXED" | "PERCENTAGE") || "FIXED");
          setRewardAmount(settingsData.settings.rewardAmount ?? 20);
          setRewardPercent(settingsData.settings.rewardPercent ?? 20);
          setMinWithdrawal(settingsData.settings.minWithdrawal ?? 50);
          setReferralEnabled(settingsData.settings.enabled ?? true);
        }
        if (pricingData.success && pricingData.settings) {
          setOriginalPrice(pricingData.settings.originalPrice);
          setSpecialPrice(pricingData.settings.specialPrice);
          setCashbackAmount(pricingData.settings.cashbackAmount);
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSavePricingSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPricing(true);
    setPricingSaveMessage(null);

    try {
      const res = await updateAdminPricingSettings({
        originalPrice: Number(originalPrice),
        specialPrice: Number(specialPrice),
        cashbackAmount: Number(cashbackAmount),
      });

      if (res.success) {
        const discount = originalPrice > 0 ? Math.round(((originalPrice - specialPrice) / originalPrice) * 100) : 60;
        setPricingSaveMessage({
          type: "success",
          text: `Pricing updated live! Strike Price: ₹${originalPrice}, Special Price: ₹${specialPrice} (${discount}% OFF), Cashback: ₹${cashbackAmount}.`,
        });
      } else {
        setPricingSaveMessage({ type: "error", text: res.error || "Failed to save pricing settings." });
      }
    } catch (err: any) {
      setPricingSaveMessage({ type: "error", text: err.message || "An error occurred." });
    } finally {
      setIsSavingPricing(false);
    }
  };

  const handleSaveReferralSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    setSaveMessage(null);

    try {
      const res = await updateAdminReferralSettings({
        rewardType,
        rewardAmount: Number(rewardAmount),
        rewardPercent: Number(rewardPercent),
        minWithdrawal: Number(minWithdrawal),
        enabled: referralEnabled,
      });

      if (res.success) {
        const rewardDesc = rewardType === "PERCENTAGE" ? `${rewardPercent}%` : `₹${rewardAmount}`;
        setSaveMessage({
          type: "success",
          text: `Referral settings saved! Mode: ${rewardType === "PERCENTAGE" ? "Percentage (%)" : "Fixed Amount (₹)"}, Reward: ${rewardDesc}, Min Withdrawal: ₹${minWithdrawal}, Status: ${referralEnabled ? "Active" : "Disabled"}.`,
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

        <form onSubmit={handleSaveReferralSettings} className="space-y-6 max-w-xl">
          {/* Reward Calculation Mode Toggle */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Reward Calculation Mode
            </label>
            <div className="grid grid-cols-2 gap-3 bg-[#0a0f1e] p-1.5 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setRewardType("FIXED")}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
                  rewardType === "FIXED"
                    ? "bg-amber-500 text-slate-950 shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <span>Fixed Amount (₹)</span>
              </button>
              <button
                type="button"
                onClick={() => setRewardType("PERCENTAGE")}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
                  rewardType === "PERCENTAGE"
                    ? "bg-amber-500 text-slate-950 shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <span>Percentage (%)</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {rewardType === "FIXED" ? (
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Referral Reward (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={rewardAmount}
                  onChange={(e) => setRewardAmount(Number(e.target.value))}
                  placeholder="20"
                  className="w-full px-4 py-2.5 bg-[#0a0f1e] border border-slate-700 rounded-xl text-white font-bold text-sm focus:outline-none focus:border-amber-400 transition"
                />
                <p className="text-[11px] text-slate-400 mt-1">Fixed ₹ amount credited to referrer per paid user</p>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Referral Reward (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={rewardPercent}
                  onChange={(e) => setRewardPercent(Number(e.target.value))}
                  placeholder="20"
                  className="w-full px-4 py-2.5 bg-[#0a0f1e] border border-slate-700 rounded-xl text-white font-bold text-sm focus:outline-none focus:border-amber-400 transition"
                />
                <p className="text-[11px] text-slate-400 mt-1">% of purchase price credited to referrer per paid user</p>
              </div>
            )}

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

          {/* Live Admin Reward Calculation Preview */}
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3.5 text-xs text-amber-300 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 font-bold">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Live Earnings Preview:</span>
            </div>
            <div className="text-right font-mono">
              {rewardType === "PERCENTAGE" ? (
                <span>On ₹199 purchase → Referrer earns <strong className="text-amber-400 text-sm">₹{((199 * rewardPercent) / 100).toFixed(2)}</strong> ({rewardPercent}%)</span>
              ) : (
                <span>On any paid purchase → Referrer earns <strong className="text-amber-400 text-sm">₹{rewardAmount}</strong> (Fixed)</span>
              )}
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
            <span>Save Referral Settings</span>
          </button>
        </form>
      </div>

      {/* Promotional Pricing, Offers & Cashback Controls Card */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Promotional Pricing &amp; Cashback Controls 🏷️</h3>
            <p className="text-xs text-slate-400">Manage live strike-through pricing, special purchase offer price, and cashback amount across the app.</p>
          </div>
        </div>

        {pricingSaveMessage && (
          <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 text-sm font-semibold ${
            pricingSaveMessage.type === "success" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-rose-500/10 border-rose-500/20 text-rose-400"
          }`}>
            {pricingSaveMessage.type === "success" ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
            <span>{pricingSaveMessage.text}</span>
          </div>
        )}

        {/* Live Admin Preview Badge */}
        <div className="mb-6 bg-gradient-to-r from-rose-950/60 via-purple-950/60 to-slate-900 border border-rose-500/30 rounded-xl p-4 text-white">
          <p className="text-xs font-bold text-rose-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 fill-rose-400" /> Live Customer Banner Preview
          </p>
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="font-bold text-amber-300 bg-amber-500/20 border border-amber-500/30 px-2.5 py-1 rounded-lg">
              🎁 Get ₹{cashbackAmount} cashback after payment
            </span>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 line-through">₹{originalPrice}</span>
              <span className="text-lg font-black text-rose-400">₹{specialPrice}</span>
              <span className="bg-rose-500 text-white font-black text-[10px] px-2 py-0.5 rounded-md uppercase">
                {originalPrice > 0 ? Math.round(((originalPrice - specialPrice) / originalPrice) * 100) : 60}% OFF
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSavePricingSettings} className="space-y-5 max-w-xl">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Original Price (₹)
              </label>
              <input
                type="number"
                min="0"
                step="10"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(Number(e.target.value))}
                placeholder="499"
                className="w-full px-4 py-2.5 bg-[#0a0f1e] border border-slate-700 rounded-xl text-white font-bold text-sm focus:outline-none focus:border-rose-400 transition"
              />
              <p className="text-[11px] text-slate-400 mt-1">Strike-through original price</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Special Price (₹)
              </label>
              <input
                type="number"
                min="0"
                step="10"
                value={specialPrice}
                onChange={(e) => setSpecialPrice(Number(e.target.value))}
                placeholder="199"
                className="w-full px-4 py-2.5 bg-[#0a0f1e] border border-slate-700 rounded-xl text-white font-bold text-sm focus:outline-none focus:border-rose-400 transition"
              />
              <p className="text-[11px] text-slate-400 mt-1">Actual customer purchase price</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Cashback Amount (₹)
              </label>
              <input
                type="number"
                min="0"
                step="5"
                value={cashbackAmount}
                onChange={(e) => setCashbackAmount(Number(e.target.value))}
                placeholder="50"
                className="w-full px-4 py-2.5 bg-[#0a0f1e] border border-slate-700 rounded-xl text-white font-bold text-sm focus:outline-none focus:border-rose-400 transition"
              />
              <p className="text-[11px] text-slate-400 mt-1">Post-payment cashback reward</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSavingPricing}
            className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl shadow-lg shadow-rose-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
          >
            {isSavingPricing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Pricing &amp; Offers</span>
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
