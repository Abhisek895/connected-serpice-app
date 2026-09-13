"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Loader2, CheckCircle2, AlertCircle, Link2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ClaimGuestPageModal({ onClose }: { onClose: () => void }) {
  const [inputVal, setInputVal] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!inputVal.trim()) return;

    // Extract slug from URL or clean input
    let cleanSlug = inputVal.trim();
    if (cleanSlug.includes("/p/")) {
      cleanSlug = cleanSlug.split("/p/")[1]?.split("?")[0]?.trim() || cleanSlug;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/guest/claim-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: cleanSlug }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Failed to find or claim page.");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        router.refresh();
      }, 1500);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 pt-10 sm:pt-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-rose-100 relative my-2 sm:my-auto"
      >
        <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-rose-50 to-pink-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-rose-500" />
            <h3 className="font-extrabold text-slate-900 text-sm">Link Page Created as Guest</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleClaim} className="p-6 space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Created &amp; paid for a page before logging in? Paste your page URL or code (e.g. <span className="font-mono text-rose-600 font-bold">sorry-a8b2c1</span>) to link it to your account permanently.
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Page URL or Slug
            </label>
            <input
              type="text"
              required
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="e.g. https://ourstory.love/p/sorry-a8b2c1"
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition"
            />
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>🎉 Page successfully linked to your account! Loading...</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || success}
            className="w-full py-3.5 px-4 bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-sm rounded-2xl shadow-md shadow-rose-200 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Linking Page...
              </>
            ) : success ? (
              "Linked! ✓"
            ) : (
              <>
                <Link2 className="w-4 h-4" /> Link to My Account
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
