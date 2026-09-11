"use client";

import { useEffect, useState } from "react";
import {
  Activity, CheckCircle, Loader2, ShieldAlert, Gift, Save,
  CheckCircle2, AlertCircle, Tag, Crown, Zap, Database,
  HardDrive, Cpu, Server, RefreshCw, Copy, Check, Code, ExternalLink,
  Mail, Send,
} from "lucide-react";
import {
  getAdminSystemHealth, getAdminReferralSettings, updateAdminReferralSettings,
  getAdminPricingSettings, updateAdminPricingSettings, updateAdminPremiumUpgradePrice,
  getAdminEmailDeliverySetting, updateAdminEmailDeliverySetting,
} from "@/app/admin/actions";

export default function SystemHealthPage() {
  const [health, setHealth] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isRefreshingHealth, setIsRefreshingHealth] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);
  const [rawJsonData, setRawJsonData] = useState<any>(null);
  const [copiedApiUrl, setCopiedApiUrl] = useState(false);

  // Email Delivery on Payment State
  const [emailDeliveryEnabled, setEmailDeliveryEnabled] = useState<boolean>(true);
  const [isUpdatingEmailDelivery, setIsUpdatingEmailDelivery] = useState<boolean>(false);
  const [emailDeliveryMessage, setEmailDeliveryMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Referral Settings State
  const [rewardType, setRewardType] = useState<"FIXED" | "PERCENTAGE">("FIXED");
  const [rewardAmount, setRewardAmount] = useState<number>(20);
  const [rewardPercent, setRewardPercent] = useState<number>(20);
  const [minWithdrawal, setMinWithdrawal] = useState<number>(500);
  const [referralEnabled, setReferralEnabled] = useState<boolean>(true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Template Pricing & Cashback Settings State (Defaults: 500, 200, 50)
  const [originalPrice, setOriginalPrice] = useState<number>(500);
  const [specialPrice, setSpecialPrice] = useState<number>(200);
  const [cashbackAmount, setCashbackAmount] = useState<number>(50);
  const [pricingEnabled, setPricingEnabled] = useState<boolean>(true);
  const [isSavingPricing, setIsSavingPricing] = useState(false);
  const [pricingSaveMessage, setPricingSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Upgrade to Premium Price State (Default: 5000)
  const [premiumUpgradePrice, setPremiumUpgradePrice] = useState<number>(5000);
  const [isSavingUpgradePrice, setIsSavingUpgradePrice] = useState(false);
  const [upgradePriceSaveMessage, setUpgradePriceSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    Promise.all([
      getAdminSystemHealth(),
      getAdminReferralSettings(),
      getAdminPricingSettings(),
      getAdminEmailDeliverySetting(),
    ])
      .then(([healthData, settingsData, pricingData, emailData]) => {
        setHealth(healthData);
        if (settingsData.success && settingsData.settings) {
          setRewardType((settingsData.settings.rewardType as "FIXED" | "PERCENTAGE") || "FIXED");
          setRewardAmount(settingsData.settings.rewardAmount ?? 20);
          setRewardPercent(settingsData.settings.rewardPercent ?? 20);
          setMinWithdrawal(settingsData.settings.minWithdrawal ?? 50);
          setReferralEnabled(settingsData.settings.enabled ?? true);
        }
        if (pricingData.success && pricingData.settings) {
          setOriginalPrice(pricingData.settings.originalPrice ?? 500);
          setSpecialPrice(pricingData.settings.specialPrice ?? 200);
          setCashbackAmount(pricingData.settings.cashbackAmount ?? 50);
          setPremiumUpgradePrice(pricingData.settings.premiumUpgradePrice ?? 5000);
          if (pricingData.settings.enabled !== undefined) {
            setPricingEnabled(pricingData.settings.enabled);
          }
        }
        if (emailData && emailData.success) {
          setEmailDeliveryEnabled(emailData.enabled);
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, []);

  const handleRefreshHealth = async () => {
    setIsRefreshingHealth(true);
    try {
      const [data, apiRes] = await Promise.all([
        getAdminSystemHealth(),
        fetch("/api/admin/system"),
      ]);
      setHealth(data);
      if (apiRes.ok) {
        const json = await apiRes.json();
        setRawJsonData(json);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsRefreshingHealth(false);
    }
  };

  const handleCopyApiUrl = () => {
    const fullUrl = `${window.location.origin}/api/admin/system`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedApiUrl(true);
    setTimeout(() => setCopiedApiUrl(false), 2000);
  };

  const handleSavePricingSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPricing(true);
    setPricingSaveMessage(null);

    try {
      const res = await updateAdminPricingSettings({
        originalPrice: Number(originalPrice),
        specialPrice: Number(specialPrice),
        cashbackAmount: Number(cashbackAmount),
        enabled: pricingEnabled,
      });

      if (res.success) {
        const discount = originalPrice > 0 ? Math.round(((originalPrice - specialPrice) / originalPrice) * 100) : 60;
        setPricingSaveMessage({
          type: "success",
          text: `Template pricing updated live! Status: ${pricingEnabled ? "ACTIVE (ON)" : "DISABLED (OFF)"}, Strike: ₹${originalPrice}, Special: ₹${specialPrice} (${discount}% OFF), Cashback: ₹${cashbackAmount}.`,
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

  const handleSaveUpgradePrice = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingUpgradePrice(true);
    setUpgradePriceSaveMessage(null);

    try {
      const res = await updateAdminPremiumUpgradePrice({
        premiumUpgradePrice: Number(premiumUpgradePrice),
      });

      if (res.success) {
        setUpgradePriceSaveMessage({
          type: "success",
          text: `Upgrade to Premium price updated to ₹${Number(premiumUpgradePrice).toLocaleString("en-IN")} live across User Settings & Builder!`,
        });
      } else {
        setUpgradePriceSaveMessage({ type: "error", text: res.error || "Failed to save upgrade price." });
      }
    } catch (err: any) {
      setUpgradePriceSaveMessage({ type: "error", text: err.message || "An error occurred." });
    } finally {
      setIsSavingUpgradePrice(false);
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

  const handleToggleEmailDelivery = async (newVal: boolean) => {
    setIsUpdatingEmailDelivery(true);
    setEmailDeliveryMessage(null);
    try {
      const res = await updateAdminEmailDeliverySetting(newVal);
      if (res.success) {
        setEmailDeliveryEnabled(newVal);
        setEmailDeliveryMessage({
          type: "success",
          text: newVal
            ? "Link email delivery ENABLED! Customers will automatically receive their gift link via email upon successful payment."
            : "Link email delivery STOPPED! Automated gift link emails are disabled. (You can turn it back on with 1 click anytime).",
        });
      } else {
        setEmailDeliveryMessage({ type: "error", text: res.error || "Failed to update email setting." });
      }
    } catch (err: any) {
      setEmailDeliveryMessage({ type: "error", text: err.message || "An error occurred." });
    } finally {
      setIsUpdatingEmailDelivery(false);
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
      {/* Header & Live API Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Activity className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              System Health &amp; Live Telemetry
            </h2>
          </div>
          <p className="text-slate-400 text-sm mt-1.5">
            Real-time server telemetry, Neon PostgreSQL latency, cloud media storage status, and platform controls.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleRefreshHealth}
            disabled={isRefreshingHealth}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-700 transition flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingHealth ? "animate-spin text-emerald-400" : ""}`} />
            <span>{isRefreshingHealth ? "Pinging..." : "Refresh Live"}</span>
          </button>

          <button
            type="button"
            onClick={handleCopyApiUrl}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 transition flex items-center gap-2 shadow-sm cursor-pointer"
            title="Copy API Route URL"
          >
            {copiedApiUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copiedApiUrl ? "Copied /api/admin/system!" : "API: /api/admin/system"}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowRawJson(!showRawJson)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition flex items-center gap-2 shadow-sm cursor-pointer ${
              showRawJson
                ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-300"
                : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>{showRawJson ? "Hide JSON" : "Raw JSON API"}</span>
          </button>
        </div>
      </div>

      {/* Live Infrastructure Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Database Condition */}
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Database Engine</span>
            <div className={`px-2 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1.5 ${
              health?.dbStatus === "healthy"
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                : "bg-rose-500/15 text-rose-400 border border-rose-500/20"
            }`}>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{health?.dbStatus === "healthy" ? "ONLINE" : "DEGRADED"}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-extrabold text-white truncate">{health?.dbProvider || "PostgreSQL"}</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Latency: <span className="text-emerald-400 font-bold">{health?.dbLatencyMs ?? 0} ms</span>
              </p>
            </div>
          </div>
        </div>

        {/* Cloud Media Storage Condition */}
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Media Storage</span>
            <div className={`px-2 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1.5 ${
              health?.storageStatus === "healthy"
                ? "bg-sky-500/15 text-sky-400 border border-sky-500/20"
                : "bg-amber-500/15 text-amber-400 border border-amber-500/20"
            }`}>
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
              <span>{health?.storageStatus === "healthy" ? "CONNECTED" : "ATTENTION"}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 shrink-0">
              <HardDrive className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-extrabold text-white truncate">{health?.activeStorage || "Storage Active"}</p>
              <p className="text-xs text-slate-400 mt-0.5">Custom Photos &amp; Songs</p>
            </div>
          </div>
        </div>

        {/* Server Memory Usage */}
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Server Compute RAM</span>
            <div className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/15 text-purple-400 border border-purple-500/20">
              <span>ACTIVE</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 shrink-0">
              <Cpu className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-extrabold text-white truncate">{health?.memoryUsageMb || 0} MB RSS</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Heap Used: <span className="text-purple-300 font-bold">{health?.heapUsedMb || 0} MB</span>
              </p>
            </div>
          </div>
        </div>

        {/* Server Uptime & Platform */}
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Platform &amp; Runtime</span>
            <div className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
              <span>{health?.nodeVersion || "Node.js"}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
              <Server className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-extrabold text-white truncate">{health?.hostingPlatform || "Node.js Server"}</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Uptime: <span className="text-white font-bold">{health?.uptimeSeconds ? `${Math.floor(health.uptimeSeconds / 60)}m ${health.uptimeSeconds % 60}s` : "Active"}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Collapsible Live JSON Telemetry Viewer */}
      {showRawJson && (
        <div className="bg-[#0a0f1e] border border-indigo-500/30 rounded-2xl p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <Code className="w-4 h-4" />
              <span>Live API Response Payload: GET /api/admin/system</span>
            </div>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(rawJsonData || health, null, 2));
                alert("JSON copied to clipboard!");
              }}
              className="text-xs text-slate-400 hover:text-white px-2.5 py-1 bg-slate-800/80 rounded-lg transition"
            >
              Copy JSON
            </button>
          </div>
          <pre className="text-xs text-emerald-400 font-mono overflow-x-auto max-h-96 p-3 bg-slate-950/80 rounded-xl border border-slate-800">
            {JSON.stringify(rawJsonData || health, null, 2)}
          </pre>
        </div>
      )}

      {/* ── Post-Payment Link Email Delivery Settings (1-Click Stop/Enable) ── */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              emailDeliveryEnabled ? "bg-rose-500/10 border border-rose-500/20 text-rose-400" : "bg-slate-800 border border-slate-700 text-slate-400"
            }`}>
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">Customer Post-Payment Link Email Delivery 📧</h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1.5 ${
                  emailDeliveryEnabled
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                    : "bg-rose-500/15 text-rose-400 border border-rose-500/20"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${emailDeliveryEnabled ? "bg-emerald-400 animate-pulse" : "bg-rose-400"}`} />
                  <span>{emailDeliveryEnabled ? "ACTIVE (EMAILS SENDING)" : "STOPPED (NO EMAILS)"}</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Automatically sends an email with the live gift link to the buyer's Gmail / registered email address immediately after payment is confirmed.
              </p>
            </div>
          </div>

          {/* 1-Click Master Toggle Button */}
          <div className="flex items-center gap-2">
            {emailDeliveryEnabled ? (
              <button
                type="button"
                onClick={() => handleToggleEmailDelivery(false)}
                disabled={isUpdatingEmailDelivery}
                className="px-4 py-2.5 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isUpdatingEmailDelivery ? (
                  <Loader2 className="w-4 h-4 animate-spin text-rose-400" />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                )}
                <span>Stop Sending Emails (1-Click)</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleToggleEmailDelivery(true)}
                disabled={isUpdatingEmailDelivery}
                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
              >
                {isUpdatingEmailDelivery ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-white" />
                )}
                <span>Enable Email Delivery (1-Click)</span>
              </button>
            )}
          </div>
        </div>

        {/* Feedback Alert */}
        {emailDeliveryMessage && (
          <div className={`mb-5 p-4 rounded-xl border flex items-center gap-3 text-xs font-semibold ${
            emailDeliveryMessage.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-rose-500/10 border-rose-500/20 text-rose-400"
          }`}>
            {emailDeliveryMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{emailDeliveryMessage.text}</span>
          </div>
        )}

        {/* Explanation & Customer Experience Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#0a0f1e] border border-slate-800 rounded-xl p-4 space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> How It Works
            </h4>
            <ul className="text-xs text-slate-400 space-y-1.5 list-disc pl-4">
              <li>Works for <strong>both guest buyers</strong> (who type their email at checkout) and <strong>registered logged-in users</strong>.</li>
              <li>Delivered instantly via SMTP to the user's Gmail address upon payment capture.</li>
              <li>Contains the full, clickable surprise link (e.g. <code>https://connected-serpice-app.vercel.app/p/birthday-xyz</code>).</li>
              <li>If you click <strong>"Stop Sending Emails"</strong>, the backend immediately halts all post-payment email dispatch.</li>
            </ul>
          </div>

          <div className="bg-[#0a0f1e] border border-slate-800 rounded-xl p-4 space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-rose-400" /> Customer Email Receipt Preview
            </h4>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1">
              <p><span className="text-slate-500">From:</span> OurStory &lt;vibepass1233@gmail.com&gt;</p>
              <p><span className="text-slate-500">Subject:</span> Payment Successful! Your Surprise is live 🎉</p>
              <p className="text-rose-400 font-bold mt-1">Button: [ 🌸 Open My Gift Link ]</p>
              <p className="text-[10px] text-slate-400">Status: {emailDeliveryEnabled ? "🟢 Automatically sent after payment" : "🔴 Paused by admin"}</p>
            </div>
          </div>
        </div>
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
              <Gift className="w-4 h-4 text-amber-400 shrink-0" />
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

      {/* 1. Promotional Template Pricing & Cashback Controls Card */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Promotional Template Pricing &amp; Cashback 🏷️</h3>
            <p className="text-xs text-slate-400">Manage live strike-through pricing, special purchase offer price, and post-payment cashback for template purchases.</p>
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

        {/* Enable / Disable Status Bar */}
        <div className="mb-6 p-4 bg-[#0a0f1e] border border-slate-700/80 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="font-bold text-sm text-white">Promotional Pricing &amp; Cashback Status</span>
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider ${
                pricingEnabled 
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                  : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
              }`}>
                {pricingEnabled ? "🟢 Active (Enabled)" : "🔴 Paused (Disabled)"}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {pricingEnabled 
                ? "Special discount banner and ₹" + cashbackAmount + " cashback reward are visible to customers." 
                : "Promotional discount is disabled. Customers will pay standard template prices without cashback claims."}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setPricingEnabled(true)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                pricingEnabled ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20" : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Enable
            </button>
            <button
              type="button"
              onClick={() => setPricingEnabled(false)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                !pricingEnabled ? "bg-rose-500 text-white shadow-md shadow-rose-500/20" : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" /> Disable
            </button>
          </div>
        </div>

        {/* Live Admin Preview Badge */}
        {pricingEnabled ? (
          <div className="mb-6 bg-gradient-to-r from-rose-950/60 via-purple-950/60 to-slate-900 border border-rose-500/30 rounded-xl p-4 text-white space-y-3">
            <p className="text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-rose-400" /> Live Template Purchase Banner Preview (Active)
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
        ) : (
          <div className="mb-6 bg-slate-900/90 border border-slate-700/80 rounded-xl p-4 text-slate-300 flex items-center gap-3 text-xs">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold text-white block">Promotional Offer Banner is Currently Disabled</span>
              <span className="text-slate-400">Customers will not see strike-through pricing or cashback rewards on the purchase modal.</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSavePricingSettings} className="space-y-5 max-w-2xl">
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
                placeholder="500"
                className="w-full px-4 py-2.5 bg-[#0a0f1e] border border-slate-700 rounded-xl text-white font-bold text-sm focus:outline-none focus:border-rose-400 transition"
              />
              <p className="text-[11px] text-slate-400 mt-1">Strike-through price</p>
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
                placeholder="200"
                className="w-full px-4 py-2.5 bg-[#0a0f1e] border border-slate-700 rounded-xl text-white font-bold text-sm focus:outline-none focus:border-rose-400 transition"
              />
              <p className="text-[11px] text-slate-400 mt-1">Offer purchase price</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Cashback (₹)
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
              <p className="text-[11px] text-slate-400 mt-1">Post-payment reward</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSavingPricing}
            className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl shadow-lg shadow-rose-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
          >
            {isSavingPricing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Template Pricing</span>
          </button>
        </form>
      </div>

      {/* 2. Upgrade to Premium Membership Pricing Card */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Upgrade to Premium Membership Pricing 👑</h3>
            <p className="text-xs text-slate-400">Configure the upgrade fee for users to unlock all premium templates, custom domains, and remove watermarks.</p>
          </div>
        </div>

        {upgradePriceSaveMessage && (
          <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 text-sm font-semibold ${
            upgradePriceSaveMessage.type === "success" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-rose-500/10 border-rose-500/20 text-rose-400"
          }`}>
            {upgradePriceSaveMessage.type === "success" ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
            <span>{upgradePriceSaveMessage.text}</span>
          </div>
        )}

        {/* Live Admin Preview of User Dashboard Banner */}
        <div className="mb-6 bg-gradient-to-r from-amber-950/50 via-rose-950/40 to-slate-900 border border-amber-500/30 rounded-xl p-4 text-white">
          <p className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5 mb-3">
            <Crown className="w-3.5 h-3.5 text-amber-400" /> Live Customer Banner Preview (User Settings &amp; Builder)
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
            <div>
              <h4 className="font-bold text-white flex items-center gap-2 text-sm">
                Upgrade to Premium <Zap className="w-4 h-4 text-rose-500 fill-rose-500" />
              </h4>
              <p className="text-xs text-slate-300 mt-1">Unlock custom domains, premium themes, and remove watermarks.</p>
            </div>
            <span className="whitespace-nowrap px-6 py-2.5 bg-rose-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-rose-500/30">
              Upgrade (₹{Number(premiumUpgradePrice).toLocaleString("en-IN")})
            </span>
          </div>
        </div>

        <form onSubmit={handleSaveUpgradePrice} className="space-y-5 max-w-xl">
          <div>
            <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              Upgrade Price (₹)
            </label>
            <input
              type="number"
              min="0"
              step="50"
              value={premiumUpgradePrice}
              onChange={(e) => setPremiumUpgradePrice(Number(e.target.value))}
              placeholder="5000"
              className="w-full px-4 py-2.5 bg-[#0a0f1e] border border-amber-500/40 rounded-xl text-white font-bold text-sm focus:outline-none focus:border-amber-400 transition max-w-sm"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Controls the price on <code>Upgrade (₹{Number(premiumUpgradePrice).toLocaleString("en-IN")})</code> buttons across user dashboard.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSavingUpgradePrice}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
          >
            {isSavingUpgradePrice ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Premium Upgrade Price</span>
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
