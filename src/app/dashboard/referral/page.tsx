"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gift, Copy, CheckCircle2, Share2, Wallet, Users, TrendingUp,
  Banknote, ExternalLink, Loader2, QrCode, X, Sparkles
} from "lucide-react";

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
};

function StatCard({ icon: Icon, label, value, color, sub }: {
  icon: any; label: string; value: string; color: string; sub?: string;
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

export default function ReferralPage() {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
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

  const copyLink = () => {
    if (stats?.referralUrl) {
      navigator.clipboard.writeText(stats.referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const shareWhatsApp = () => {
    if (!stats?.referralUrl) return;
    const msg = `💖 Try OurStory — create beautiful proposal & memory pages for your loved ones! Use my link to sign up: ${stats.referralUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-8 animate-in fade-in duration-500">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-rose-500 flex items-center justify-center shadow-lg shadow-amber-400/30">
            <Gift className="w-5 h-5 text-white" />
          </div>
          Earn & Referrals
        </h1>
        <p className="text-slate-500 mt-1.5 text-sm leading-relaxed">
          Share OurStory with friends → They sign up &amp; make their first purchase → You earn <span className="font-bold text-emerald-600">{rewardLabel}</span> per referral, credited to your wallet instantly!
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={Wallet} label="Wallet Balance" value={`₹${walletRupees.toFixed(0)}`}
          color="bg-emerald-50 text-emerald-600" sub="Available to spend or withdraw" />
        <StatCard icon={Users} label="Friends Referred" value={`${stats?.referralCount ?? 0}`}
          color="bg-sky-50 text-sky-600" sub="Total signups via your link" />
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

      {/* Referral Link Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-slate-900 via-slate-800 to-rose-950 rounded-3xl p-6 text-white shadow-xl"
      >
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-amber-400 fill-amber-400" />
          <h2 className="font-bold text-base">Your Referral Link</h2>
        </div>

        {stats?.referralUrl ? (
          <>
            {/* Link display */}
            <div className="flex items-center gap-3 bg-white/10 border border-white/15 rounded-2xl p-3 mb-4 backdrop-blur-sm">
              <p className="flex-1 text-sm font-mono text-white/90 truncate">{stats.referralUrl}</p>
              <button
                onClick={copyLink}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                  copied ? "bg-emerald-500 text-white" : "bg-white/15 hover:bg-white/25 text-white"
                }`}
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>

            {/* Share buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={shareWhatsApp}
                className="flex items-center gap-2 px-4 py-2 bg-[#25D366]/90 hover:bg-[#25D366] text-white rounded-xl font-bold text-sm transition-all shadow-sm"
              >
                <Share2 className="w-4 h-4" /> Share on WhatsApp
              </button>
              <button
                onClick={() => window.open(`https://www.instagram.com/`, "_blank")}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-bold text-sm transition-all shadow-sm"
              >
                <ExternalLink className="w-4 h-4" /> Post on Instagram
              </button>
            </div>

            {/* How it works */}
            <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-3 gap-3 text-center">
              {[
                { step: "1", text: "Share your link" },
                { step: "2", text: "Friend signs up & buys" },
                { step: "3", text: `You earn ${rewardLabel} instantly` },
              ].map(s => (
                <div key={s.step} className="text-xs text-white/70">
                  <div className="w-6 h-6 rounded-full bg-white/15 border border-white/20 flex items-center justify-center text-white font-bold text-xs mx-auto mb-1">{s.step}</div>
                  {s.text}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-white/70 mb-4">Generate your unique referral link to start earning!</p>
            <button
              onClick={generateCode}
              disabled={generating}
              className="flex items-center gap-2 mx-auto px-6 py-3 bg-rose-500 hover:bg-rose-400 text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-rose-900/30"
            >
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Gift className="w-4 h-4" />}
              {generating ? "Generating…" : "Generate My Referral Link"}
            </button>
          </div>
        )}
      </motion.div>

      {/* Referral List */}
      {(stats?.referrals?.length ?? 0) > 0 && (
        <div>
          <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-500" /> Your Referrals
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
      {(stats?.referrals?.length ?? 0) === 0 && stats?.referralUrl && (
        <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="text-4xl mb-3">👥</div>
          <p className="font-bold text-slate-700">No referrals yet</p>
          <p className="text-sm text-slate-400 mt-1">Share your link above to start earning!</p>
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
