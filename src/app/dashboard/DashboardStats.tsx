"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Eye, Heart, Flame, Link2, TrendingUp } from "lucide-react";

type EventItem = {
  id: string;
  status: string;
  responses: { action: string }[];
};

interface DashboardStatsProps {
  events: EventItem[];
}

function AnimatedCounter({ target, duration = 1500 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return <span>{count.toLocaleString()}</span>;
}

export default function DashboardStats({ events }: DashboardStatsProps) {
  const activeLinks = events.filter(e => e.status === "PUBLISHED").length;
  const totalViews = events.reduce((sum, e) => sum + e.responses.filter(r => r.action === "VIEWED").length, 0);
  const totalYes = events.reduce((sum, e) => sum + e.responses.filter(r => r.action === "ACCEPTED").length, 0);
  const totalLinks = events.length;

  const stats = [
    {
      icon: Link2,
      label: "Active Links",
      value: activeLinks,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
      glow: "shadow-emerald-500/20",
    },
    {
      icon: Eye,
      label: "Total Views",
      value: totalViews,
      color: "text-sky-400",
      bg: "bg-sky-500/10 border-sky-500/20",
      glow: "shadow-sky-500/20",
    },
    {
      icon: Heart,
      label: "Said YES! 💖",
      value: totalYes,
      color: "text-rose-400",
      bg: "bg-rose-500/10 border-rose-500/20",
      glow: "shadow-rose-500/20",
    },
    {
      icon: Flame,
      label: "Total Created",
      value: totalLinks,
      color: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20",
      glow: "shadow-amber-500/20",
    },
  ];

  if (events.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-4 h-4 text-rose-500" />
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Your Impact</h2>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08, ease: "easeOut" }}
              className={`relative flex items-center gap-3 px-4 py-3.5 rounded-2xl border ${stat.bg} shadow-sm ${stat.glow} overflow-hidden`}
            >
              {/* Glow orb */}
              <div className={`absolute -top-4 -right-4 w-16 h-16 rounded-full opacity-20 blur-xl ${stat.bg}`} />

              <div className={`p-2 rounded-xl ${stat.bg} border ${stat.bg}`}>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider truncate">
                  {stat.label}
                </p>
                <p className={`text-xl font-black ${stat.color} leading-tight`}>
                  <AnimatedCounter target={stat.value} />
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
