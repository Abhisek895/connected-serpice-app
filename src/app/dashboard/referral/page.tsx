"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gift, Copy, CheckCircle2, Share2, Wallet, Users, TrendingUp,
  Banknote, ExternalLink, Loader2, X, Sparkles, Link2,
  Zap, Clock, Star, MessageCircle
} from "lucide-react";

type Theme = {
  id: string;
  name: string;
  title: string | null;
  description: string | null;
  price: number;
  durationDays: number;
  isPremium: boolean;
  thumbnailUrl?: string | null;
};

type ReferralStats = {
  referralCode: string | null;
  referralUrl: string | null;
  walletBalance: number;
  totalEarned: number;
  referralCount: number;
  referrals: {
    id: string; name: string; email: string; joinedAt: string;
    hasPaid: boolean; rewardStatus: "EARNED" | "PENDING";
  }[];
  recentTxns: {
    id: string; type: string; amount: number; description: string;
    createdAt: string; status: string;
  }[];
  rewardType?: "FIXED" | "PERCENTAGE";
  rewardAmount?: number;
  rewardPercent?: number;
  minWithdrawal?: number;
  referralEnabled?: boolean;
  themes?: Theme[];
};

// Template emojis by name keyword matching
const TEMPLATE_EMOJI: Record<string, string> = {
  "surprise": "💖",
  "birthday": "🎂",
  "apology": "💌",
  "sorry": "💌",
  "proposal": "💍",
  "nasamajh": "❤️",
  "date": "🌸",
  "kolkata": "🌸",
  "jalpaiguri": "🌿",
  "galaxy": "🌌",
  "love": "💖",
};

function getTemplateEmoji(name: string): string {
  const lower = name.toLowerCase();
  for (const [key, emoji] of Object.entries(TEMPLATE_EMOJI)) {
    if (lower.includes(key)) return emoji;
  }
  return "✨";
}

function getWhatsAppMessage(templateTitle: string, url: string): string {
  return `💖 Create a beautiful *${templateTitle}* for someone special!\n\nUse my link to sign up on OurStory and get started:\n👉 ${url}\n\n✨ Made with love on OurStory`;
}

function StatCard({ icon: Icon, label, value, color, sub }: {
  icon: React.ElementType; label: string; value: string; color: string; sub?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4"
    >
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-black text-slate-900 leading-tight">{value}</p>
        {sub && <p className="text-[10px] text-slate-400 font-medium mt-0.5">{sub}</p>}
      </div>
    </motion.div>
  );
}

function TemplateReferralCard({
  theme,
  referralCode,
  baseUrl,
  rewardLabel,
  index,
}: {
  theme: Theme;
  referralCode: string;
  baseUrl: string;
  rewardLabel: string;
  index: number;
}) {
  const [copied, setCopied] = useState(false);

  const displayTitle = theme.title || theme.name;
  const emoji = getTemplateEmoji(theme.name);
  const referralUrl = `${baseUrl}/?ref=${referralCode}&demo=${theme.name}`;
  const isInstant = theme.price === 0;

  const copyLink = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareWhatsApp = () => {
    const waUrl = `${referralUrl}&utm_source=whatsapp`;
    const msg = getWhatsAppMessage(displayTitle, waUrl);
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
  };

  const shareInstagram = () => {
    const instaUrl = `${referralUrl}&utm_source=instagram`;
    navigator.clipboard.writeText(instaUrl);
    window.open(`https://www.instagram.com/`, "_blank", "noopener");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-rose-200/60 transition-all duration-300 overflow-hidden"
    >
      {/* Card Header */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform duration-300 overflow-hidden">
              {theme.thumbnailUrl ? (
                <img src={theme.thumbnailUrl} alt={displayTitle} className="w-full h-full object-cover" />
              ) : (
                emoji
              )}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm leading-tight">{displayTitle}</h3>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full">
                  <Zap className="w-2.5 h-2.5 fill-rose-500" />
                  ₹{theme.price > 0 ? (theme.price >= 500 ? Math.round(theme.price / 100) : theme.price) : "0"}
                </span>
                <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">
                  <Clock className="w-2.5 h-2.5" />
                  {theme.durationDays}d access
                </span>
                {isInstant && (
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                    Instant
                  </span>
                )}
              </div>
            </div>
          </div>
          {/* Earn badge */}
          <div className="shrink-0 text-right">
            <div className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-xl px-2.5 py-1 flex items-center gap-1">
              <Star className="w-2.5 h-2.5 fill-emerald-500" />
              Earn {rewardLabel}
            </div>
          </div>
        </div>

        {/* Link display */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 group-hover:border-rose-200/60 transition-colors">
          <Link2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <p className="flex-1 text-[11px] font-mono text-slate-500 truncate">{referralUrl}</p>
          <button
            onClick={copyLink}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all shrink-0 ${
              copied
                ? "bg-emerald-500 text-white"
                : "bg-slate-200 hover:bg-slate-300 text-slate-700"
            }`}
          >
            {copied ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      {/* Share buttons */}
      <div className="px-5 pb-5 pt-2 flex gap-2">
        <button
          onClick={shareWhatsApp}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C4F] border border-[#25D366]/30 rounded-xl font-bold text-xs transition-all"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          WhatsApp
        </button>
        <button
          onClick={shareInstagram}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 text-purple-700 border border-purple-200/60 rounded-xl font-bold text-xs transition-all"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Instagram
        </button>
      </div>
    </motion.div>
  );
}

export default function ReferralPage() {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [upiId, setUpiId] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawMsg, setWithdrawMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/referral/stats");
      if (res.ok) setStats(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const generateCode = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/referral/generate", { method: "POST" });
      if (res.ok) await fetchStats();
    } finally {
      setGenerating(false);
    }
  };

  const handleWithdraw = async () => {
    setWithdrawMsg(null);
    setWithdrawing(true);
    try {
      const amountPaise = Math.round(parseFloat(withdrawAmount) * 100);
      const res = await fetch("/api/referral/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ upiId, amount: amountPaise }),
      });
      const data = await res.json();
      if (res.ok) {
        setWithdrawMsg({ type: "success", text: data.message });
        await fetchStats();
        setTimeout(() => setShowWithdrawModal(false), 3000);
      } else {
        setWithdrawMsg({ type: "error", text: data.error });
      }
    } finally {
      setWithdrawing(false);
    }
  };

  const walletRupees = (stats?.walletBalance ?? 0) / 100;
  const earnedRupees = (stats?.totalEarned ?? 0) / 100;
  const rewardLabel = stats?.rewardType === "PERCENTAGE"
    ? `${stats.rewardPercent ?? 20}%`
    : `₹${stats?.rewardAmount ?? 20}`;

  // Derive base URL from the server-returned referralUrl (uses NEXTAUTH_URL internally)
  // e.g. "http://localhost:3000/?ref=VBMC5A" → "http://localhost:3000"
  const baseUrl = stats?.referralUrl
    ? stats.referralUrl.split("/?ref=")[0].replace(/\/$/, "")
    : (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
      </div>
    );
  }

  const themes = stats?.themes ?? [];
  const hasCode = !!stats?.referralCode;

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-rose-500 flex items-center justify-center shadow-lg shadow-amber-400/30">
            <Gift className="w-5 h-5 text-white" />
          </div>
          Earn & Referrals
        </h1>
        <p className="text-slate-500 mt-1.5 text-sm leading-relaxed">
          Share any template link with your unique code → Friends sign up & buy → You earn{" "}
          <span className="font-bold text-emerald-600">{rewardLabel}</span> per referral, credited instantly!
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={Wallet} label="Wallet Balance" value={`₹${walletRupees.toFixed(0)}`}
          color="bg-emerald-50 text-emerald-600" sub="Available to spend or withdraw" />
        <StatCard icon={Users} label="Friends Referred" value={`${stats?.referralCount ?? 0}`}
          color="bg-sky-50 text-sky-600" sub="Total signups via your links" />
        <StatCard icon={TrendingUp} label="Total Earned" value={`₹${earnedRupees.toFixed(0)}`}
          color="bg-amber-50 text-amber-600" sub="All-time referral earnings" />
      </div>

      {/* Wallet Actions Banner */}
      {walletRupees >= 0 && (
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200/80 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div>
            <p className="font-bold text-emerald-900 flex items-center gap-2 text-base">
              <span>💰 Ready to cash out?</span>
            </p>
            <p className="text-xs sm:text-sm text-emerald-700 mt-1 leading-relaxed">
              Minimum withdrawal: <span className="font-bold text-emerald-800">₹{stats?.minWithdrawal ?? 50}</span> via UPI. Processed within 24-48 hours.
            </p>
          </div>
          <button
            onClick={() => setShowWithdrawModal(true)}
            disabled={walletRupees < (stats?.minWithdrawal ?? 50)}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-emerald-300/40 shrink-0 cursor-pointer"
          >
            <Banknote className="w-4 h-4" />
            Withdraw ₹{walletRupees.toFixed(0)}
          </button>
        </div>
      )}

      {/* ── How It Works steps ── */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-rose-950 rounded-3xl p-6 text-white shadow-xl">
        <div className="flex items-center gap-2 mb-5">
          <Sparkles className="w-5 h-5 text-amber-400 fill-amber-400" />
          <h2 className="font-bold text-base">How to Earn with Your Referral Links</h2>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center mb-6">
          {[
            { step: "1", text: "Share any template link below" },
            { step: "2", text: "Friend signs up & buys" },
            { step: "3", text: `You earn ${rewardLabel} instantly` },
          ].map(s => (
            <div key={s.step} className="text-xs text-white/70">
              <div className="w-8 h-8 rounded-full bg-white/15 border border-white/20 flex items-center justify-center text-white font-bold text-sm mx-auto mb-2">
                {s.step}
              </div>
              {s.text}
            </div>
          ))}
        </div>

        {!hasCode ? (
          <div className="text-center py-2">
            <p className="text-sm text-white/70 mb-4">Generate your unique referral code to unlock all template links!</p>
            <button
              onClick={generateCode}
              disabled={generating}
              className="flex items-center gap-2 mx-auto px-6 py-3 bg-rose-500 hover:bg-rose-400 text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-rose-900/30"
            >
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Gift className="w-4 h-4" />}
              {generating ? "Generating…" : "Generate My Referral Code"}
            </button>
          </div>
        ) : (
          <div className="bg-white/10 border border-white/15 rounded-2xl px-4 py-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] text-white/50 uppercase tracking-wider font-semibold mb-0.5">Your Referral Code</p>
              <p className="text-xl font-black tracking-widest text-amber-400">{stats?.referralCode}</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-white/50 uppercase tracking-wider font-semibold mb-0.5">Links Available</p>
              <p className="text-xl font-black text-white">{themes.length}</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Per-Template Referral Links Grid ── */}
      {hasCode && themes.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Share2 className="w-5 h-5 text-rose-500" />
              Your Referral Links
            </h2>
            <span className="bg-rose-100 text-rose-600 px-3 py-1 rounded-full text-xs font-bold">
              {themes.length} Templates
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {themes.map((theme, i) => (
              <TemplateReferralCard
                key={theme.id}
                theme={theme}
                referralCode={stats!.referralCode!}
                baseUrl={baseUrl}
                rewardLabel={rewardLabel}
                index={i}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── No templates yet fallback ── */}
      {hasCode && themes.length === 0 && (
        <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="text-4xl mb-3">🎨</div>
          <p className="font-bold text-slate-700">No templates available yet</p>
          <p className="text-sm text-slate-400 mt-1">Templates will appear here once the admin adds them.</p>
        </div>
      )}

      {/* ── Referral List ── */}
      {(stats?.referrals?.length ?? 0) > 0 && (
        <div>
          <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-500" /> Your Referred Friends
          </h3>
          <div className="space-y-2">
            {stats!.referrals.map((ref, i) => (
              <motion.div
                key={ref.id}
                initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between bg-white border border-slate-100 rounded-2xl px-4 py-3 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-sm shrink-0">
                    {ref.name[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{ref.name}</p>
                    <p className="text-xs text-slate-400">{ref.email}</p>
                  </div>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  ref.rewardStatus === "EARNED"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700"
                }`}>
                  {ref.rewardStatus === "EARNED" ? `✅ ${rewardLabel} Earned` : "⏳ Pending"}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state for no referrals */}
      {(stats?.referrals?.length ?? 0) === 0 && hasCode && (
        <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="text-4xl mb-3">👥</div>
          <p className="font-bold text-slate-700">No referrals yet</p>
          <p className="text-sm text-slate-400 mt-1">Share your template links above to start earning!</p>
        </div>
      )}

      {/* Withdraw Modal */}
      <AnimatePresence>
        {showWithdrawModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                  <Banknote className="w-5 h-5 text-emerald-500" /> Withdraw Funds
                </h3>
                <button onClick={() => setShowWithdrawModal(false)} className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 transition">
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>

              <div className="space-y-3 mb-5">
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1.5">UPI ID</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={e => setUpiId(e.target.value)}
                    placeholder="yourname@upi"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
                    Amount (₹) — Available: ₹{walletRupees.toFixed(0)}
                  </label>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={e => setWithdrawAmount(e.target.value)}
                    placeholder={`${stats?.minWithdrawal ?? 50}`}
                    min={stats?.minWithdrawal ?? 50}
                    max={walletRupees}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20"
                  />
                </div>
              </div>

              {withdrawMsg && (
                <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium ${
                  withdrawMsg.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                }`}>
                  {withdrawMsg.text}
                </div>
              )}

              <button
                onClick={handleWithdraw}
                disabled={withdrawing || !upiId || !withdrawAmount}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                {withdrawing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Banknote className="w-4 h-4" />}
                {withdrawing ? "Processing…" : "Request Withdrawal"}
              </button>
              <p className="text-center text-xs text-slate-400 mt-3">Processed within 24-48 hours via UPI</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
