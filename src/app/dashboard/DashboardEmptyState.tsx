"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Sparkles, ArrowRight, Heart } from "lucide-react";

export default function DashboardEmptyState() {
  const floatingHearts = ["💖", "✨", "💌", "🌸", "💕", "🎁", "🥺", "💝"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative flex flex-col items-center justify-center py-20 px-6 text-center overflow-hidden rounded-3xl border border-dashed border-rose-200/60 bg-gradient-to-b from-rose-50/50 via-white to-purple-50/30"
    >
      {/* Floating emoji particles */}
      {floatingHearts.map((emoji, i) => (
        <motion.span
          key={i}
          className="absolute text-lg select-none pointer-events-none"
          style={{
            left: `${10 + (i * 11) % 80}%`,
            top: `${8 + (i * 17) % 70}%`,
          }}
          animate={{
            y: [0, -10, 0],
            opacity: [0.4, 0.8, 0.4],
            rotate: [-5, 5, -5],
          }}
          transition={{
            duration: 3 + (i * 0.4),
            repeat: Infinity,
            delay: i * 0.3,
            ease: "easeInOut",
          }}
        >
          {emoji}
        </motion.span>
      ))}

      {/* Glow circle */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-rose-200/20 rounded-full blur-3xl" />
      </div>

      {/* Heart icon */}
      <motion.div
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        className="relative z-10 w-20 h-20 bg-gradient-to-br from-rose-400 to-pink-500 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-rose-300/40"
      >
        <Heart className="w-10 h-10 text-white fill-white" />
      </motion.div>

      {/* Text */}
      <div className="relative z-10 max-w-sm">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
          Your first memory awaits 💌
        </h2>
        <p className="text-slate-500 text-sm leading-relaxed mb-8">
          You haven&apos;t created anything yet — but imagine your partner&apos;s face when they open your first surprise. Let&apos;s make that moment happen!
        </p>
      </div>

      {/* CTA Buttons */}
      <div className="relative z-10 flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <Link
          href="/dashboard"
          className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold rounded-2xl shadow-lg shadow-rose-300/40 hover:shadow-rose-300/60 hover:scale-[1.02] transition-all text-sm"
        >
          <Sparkles className="w-4 h-4 fill-white" />
          Browse Templates
        </Link>
        <Link
          href="/dashboard/builder"
          className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-white text-slate-700 font-bold rounded-2xl border border-slate-200 hover:border-rose-300 hover:bg-rose-50/50 transition-all text-sm"
        >
          Build Custom
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Social proof */}
      <p className="relative z-10 mt-6 text-xs text-slate-400 font-medium">
        ✨ Thousands of couples have already created their magic moment
      </p>
    </motion.div>
  );
}
