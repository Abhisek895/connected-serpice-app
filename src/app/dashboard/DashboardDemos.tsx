"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ExternalLink, Compass, Zap, Loader2, CheckCircle2, Copy, Edit3, Eye, Gift, Heart, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createInstantEventFromTemplate } from "./builder/actions";
import { TEMPLATE_CLASSES } from "./templateConfig";
import CustomizeModal from "./CustomizeModal";

export default function DashboardDemos() {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [publishedTitle, setPublishedTitle] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // CustomizeModal state
  const [customizeModalDemoId, setCustomizeModalDemoId] = useState<string | null>(null);

  const demos = [
    {
      id: "surprise",
      title: "Romantic Love Surprise 💖",
      badge: "Requires Customization",
      badgeColor: "bg-purple-600 text-white",
      description: "Interactive romantic surprise with floating heart animations, love song (loveSong.mp3), photo showcase, & love letter reveal.",
      previewUrl: "/demos/surprise/index.html",
      image: "/demos/surprise/cute_woman.png",
      icon: Heart,
      borderColor: "border-purple-200",
      hasInstantUse: false,
    },
    {
      id: "birthday-wish",
      title: "Happy Birthday Surprise 🎂",
      badge: "Requires Customization",
      badgeColor: "bg-amber-500 text-white",
      description: "Interactive birthday card with photo slideshow gallery, birthday music (hbd.mp3), confetti, & custom love message reveal.",
      previewUrl: "/demos/birthday-wish/index.html",
      image: "/demos/birthday-wish/s0.jpeg",
      icon: Gift,
      borderColor: "border-amber-200",
      hasInstantUse: false,
    },
    {
      id: "nasamajh-lakri",
      title: "Nasamajh Lakri Proposal ❤️",
      badge: "Instant Available",
      badgeColor: "bg-pink-600 text-white",
      description: "Interactive Valentine proposal with romantic audio tracks (Start.mp3, yess.mp3, no.mp3), playful buttons, & gradient aesthetic.",
      previewUrl: "/demos/nasamajh-lakri/index.html",
      image: "/demos/birthday-wish/s0.jpeg",
      icon: Heart,
      borderColor: "border-pink-200",
      hasInstantUse: true,
    },
    {
      id: "date-planner",
      title: "Kolkata Date Night Planner 🌸",
      badge: "Instant Available",
      badgeColor: "bg-rose-500 text-white",
      description: "Pre-configured with default background music (Tum Se Hi), food menu (Biryani, Momo, Fuchka), date picker & summary card.",
      previewUrl: "/demos/date-planner/index.html",
      image: "/demos/date-planner/victoria_memorial_1785673658927.png",
      icon: Compass,
      borderColor: "border-rose-200",
      hasInstantUse: true,
    },
    {
      id: "jalpaiguri-planner",
      title: "Jalpaiguri Date Night Planner 🌿",
      badge: "Instant Available",
      badgeColor: "bg-rose-500 text-white",
      description: "Pre-configured with default background music (Tum Se Hi), food menu (Biryani, Momo, Fuchka), date picker & summary card.",
      previewUrl: "/demos/jalpaiguri-planner/index.html",
      image: "/demos/jalpaiguri-planner/jalpaiguri_rajbari.png",
      icon: Compass,
      borderColor: "border-rose-200",
      hasInstantUse: true,
    },
  ];

  const handleInstantUse = async (demo: (typeof demos)[0]) => {
    setLoadingId(demo.id);
    try {
      // Use As-Is → object === class (100% default data)
      const tmplClass = TEMPLATE_CLASSES.find((t) => t.id === demo.id);
      const res = await createInstantEventFromTemplate(
        "Romantic",
        tmplClass?.defaultData.title,
        "My Love 💕",
        demo.id,
        {}
      );

      if (res.success && res.customUrl) {
        const finalUrl = `${window.location.origin}${res.customUrl}`;
        setPublishedUrl(finalUrl);
        setPublishedTitle(demo.title);
        router.refresh();
        setTimeout(() => {
          setPublishedUrl(null);
          setPublishedTitle(null);
        }, 8000);
      }
    } catch (err: any) {
      console.error("Instant use failed:", err);
      setToastMessage(err.message || "Something went wrong.");
      setTimeout(() => setToastMessage(null), 4000);
    }
    setLoadingId(null);
  };

  const copyToClipboard = () => {
    if (publishedUrl) {
      navigator.clipboard.writeText(publishedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-gradient-to-r from-rose-50/60 via-purple-50/40 to-slate-50 border border-rose-100/80 rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden mb-8">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="fixed top-4 right-4 z-[100] bg-rose-500 text-white px-6 py-3 rounded-xl shadow-2xl font-bold flex items-center gap-2"
          >
            <X className="w-5 h-5 cursor-pointer" onClick={() => setToastMessage(null)} />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative Blur */}
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-64 h-64 bg-rose-200/30 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-rose-100 text-rose-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 fill-rose-500" /> Pre-Configured Templates
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            Explore Demos & Template Actions 💖
          </h2>
          <p className="text-slate-500 text-sm md:text-base mt-1">
            Preview demo pages live, or customize them with your own photos & questions to save permanently!
          </p>
        </div>
      </div>

      {/* Published Link Banner */}
      <AnimatePresence>
        {publishedUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mb-6 p-5 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md"
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-emerald-900">Event Saved & Link Generated! 💖</h4>
                <p className="text-xs font-medium text-emerald-800">{publishedTitle}</p>
                <p className="text-xs text-emerald-700 mt-0.5 break-all font-mono">{publishedUrl}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={copyToClipboard}
                className="flex-1 sm:flex-initial px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" /> {copied ? "Copied!" : "Copy Link"}
              </button>
              <a
                href={publishedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-initial px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5"
              >
                Open Page <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid of Demo Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 relative z-10">
        {demos.map((demo) => {
          const Icon = demo.icon;
          const isLoadingThis = loadingId === demo.id;
          const buttonNum = demo.hasInstantUse ? 3 : 2;

          return (
            <motion.div
              key={demo.id}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className={`bg-white rounded-2xl border ${demo.borderColor} shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow`}
            >
              <div>
                {/* Image Header */}
                <div className="relative h-38 w-full bg-slate-100 overflow-hidden group">
                  <img
                    src={demo.image}
                    alt={demo.title}
                    className="w-full h-full object-cover object-[center_25%] group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                  <span
                    className={`absolute top-0 left-0 px-2.5 py-1 rounded-br-lg uppercase font-bold tracking-wider shadow-sm ${demo.badgeColor}`}
                    style={{ fontSize: "9px", lineHeight: "12px" }}
                  >
                    {demo.badge}
                  </span>
                </div>

                {/* Body */}
                <div className="p-4 pb-1">
                  <h3 className="font-bold text-base md:text-lg text-slate-900 flex items-center gap-2 mb-1.5">
                    <Icon className="w-5 h-5 text-rose-500 flex-shrink-0" />
                    {demo.title}
                  </h3>
                  <p className="text-slate-600 text-xs leading-relaxed">{demo.description}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 pt-2.5 space-y-1.5 border-t border-slate-100">
                {/* 1. Live Demo */}
                <a
                  href={demo.previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-1.5 px-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition flex items-center justify-between"
                >
                  <span className="flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-slate-500" /> 1. Preview Demo
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">Test Live</span>
                </a>

                {/* 2. Use As-Is (Instant) — only for instant templates */}
                {demo.hasInstantUse && (
                  <button
                    onClick={() => handleInstantUse(demo)}
                    disabled={isLoadingThis}
                    className="w-full py-2 px-3 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-70 text-white text-xs font-bold transition shadow-sm shadow-rose-200 flex items-center justify-between"
                  >
                    <span className="flex items-center gap-1.5">
                      {isLoadingThis ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Zap className="w-3.5 h-3.5 fill-white" />
                      )}
                      2. Use As-Is (Instant)
                    </span>
                    <span className="text-[10px] bg-rose-600 px-1.5 py-0.5 rounded font-normal">
                      Direct Link
                    </span>
                  </button>
                )}

                {/* Edit & Customize — all templates */}
                <button
                  onClick={() => setCustomizeModalDemoId(demo.id)}
                  className={`w-full py-2 px-3 rounded-xl text-white text-xs font-bold transition shadow-sm flex items-center justify-between ${
                    !demo.hasInstantUse
                      ? "bg-rose-500 hover:bg-rose-600 shadow-rose-200"
                      : "bg-slate-900 hover:bg-slate-800"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Edit3 className="w-3.5 h-3.5" />
                    {!demo.hasInstantUse ? "2. Edit & Customize" : "3. Edit & Customize"}
                  </span>
                  <span className="text-[10px] opacity-80 font-normal">Add Your Text/Photos</span>
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Customize Modal */}
      <AnimatePresence>
        {customizeModalDemoId && (
          <CustomizeModal
            demoId={customizeModalDemoId}
            onClose={() => setCustomizeModalDemoId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
