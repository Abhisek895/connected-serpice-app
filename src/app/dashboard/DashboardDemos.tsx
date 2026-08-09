"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Zap, Loader2, CheckCircle2, Copy, Edit3, Eye, X, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createInstantEventFromTemplate } from "./builder/actions";
import { TEMPLATE_CLASSES } from "./templateConfig";
import { demos } from "./demoConfig";
import CheckoutModal from "./CheckoutModal";
import CustomizeModal from "./CustomizeModal";

type ThemePricingItem = {
  name: string;
  price: number;
  durationDays: number;
  isActive: boolean;
  title?: string | null;
  description?: string | null;
  thumbnailUrl?: string | null;
};

export default function DashboardDemos({ themePricing }: { themePricing?: ThemePricingItem[] }) {
  const router = useRouter();
  const [selectedDemo, setSelectedDemo] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Checkout Modal State
  const [checkoutModal, setCheckoutModal] = useState<{
    demoId: string;
    title: string;
    price: number;
    durationDays: number;
    action: "instant" | "builder";
  } | null>(null);

  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [publishedTitle, setPublishedTitle] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [customizeModalDemoId, setCustomizeModalDemoId] = useState<string | null>(null);
  const [instantModalTitle, setInstantModalTitle] = useState("");

  const activeDemos = demos.map(demo => {
    const dbPricing = themePricing?.find(t => t.name === demo.id);
    return {
      ...demo,
      price: Number(dbPricing?.price ?? demo.price ?? 0),
      durationDays: Number(dbPricing?.durationDays ?? demo.durationDays ?? 7),
      isActive: dbPricing?.isActive ?? true,
      title: dbPricing?.title || demo.title,
      description: dbPricing?.description || demo.description,
      image: dbPricing?.thumbnailUrl || demo.image,
    };
  }).filter(d => d.isActive);

  const handleActionClick = (demoId: string, action: "instant" | "builder") => {
    const demo = activeDemos.find(d => d.id === demoId);
    if (demo && demo.price && demo.price > 0) {
      setCheckoutModal({
        demoId: demo.id,
        title: demo.title,
        price: demo.price,
        durationDays: demo.durationDays,
        action
      });
    } else {
      if (action === "instant") {
        setSelectedDemo(demoId);
        setInstantModalTitle("");
      } else {
        setCustomizeModalDemoId(demoId);
      }
    }
  };

  const handlePaymentSuccess = () => {
    if (!checkoutModal) return;
    const { action, demoId } = checkoutModal;
    setCheckoutModal(null);
    if (action === "instant") {
      setSelectedDemo(demoId);
      setInstantModalTitle("");
    } else {
      setCustomizeModalDemoId(demoId);
    }
  };

  const handleInstantUse = async (demoId: string, customTitle: string) => {
    const demo = activeDemos.find(d => d.id === demoId);
    if (!demo) return;
    setLoadingId(demo.id);
    setSelectedDemo(null);
    try {
      const tmplClass = TEMPLATE_CLASSES.find((t) => t.id === demo.id);
      const res = await createInstantEventFromTemplate(
        "Romantic",
        tmplClass?.defaultData.title,
        "Someone Special ✨",
        demo.id,
        { internalTitle: customTitle }
      );
      if (res.success && res.customUrl) {
        const finalUrl = `${window.location.origin}${res.customUrl}`;
        setPublishedUrl(finalUrl);
        setPublishedTitle(demo.title);
        router.refresh();
        setTimeout(() => { setPublishedUrl(null); setPublishedTitle(null); }, 8000);
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
    <>
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

        {/* Decorative blur */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-64 h-64 bg-rose-200/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-rose-100 text-rose-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 fill-rose-500" /> Pre-Configured Templates
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              Explore Demos &amp; Template Actions 💖
            </h2>
            <p className="text-slate-500 text-sm md:text-base mt-1">
              Preview demo pages live, or customize them with your own photos &amp; questions to save permanently!
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
                  <h4 className="font-bold text-emerald-900">Event Saved &amp; Link Generated! 💖</h4>
                  <p className="text-xs font-medium text-emerald-800">{publishedTitle}</p>
                  <p className="text-xs text-emerald-700 mt-0.5 break-all font-mono">{publishedUrl}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button onClick={copyToClipboard} className="flex-1 sm:flex-initial px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5">
                  <Copy className="w-3.5 h-3.5" /> {copied ? "Copied!" : "Copy Link"}
                </button>
                <a href={publishedUrl} target="_blank" rel="noopener noreferrer" className="flex-1 sm:flex-initial px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5">
                  Open Page <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grid of Demo Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 relative z-10">
          {activeDemos.map((demo) => {
            const Icon = demo.icon;
            const isLoadingThis = loadingId === demo.id;
            const isPaid = (demo.price ?? 0) > 0;

            return (
              <motion.div
                key={demo.id}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className={`bg-white rounded-2xl border ${demo.borderColor} shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow`}
              >
                <div>
                  {/* Image Header */}
                  <div className="relative h-48 w-full bg-slate-100 overflow-hidden group">
                    <img
                      src={demo.image}
                      alt={demo.title}
                      className="w-full h-full object-cover object-[center_25%] group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Light gradient just for text readability at the bottom, no dark overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent" />

                    {/* Badges container */}
                    <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-1.5 items-center pr-3">
                      <span className={`text-[9px] leading-[12px] px-2 py-1 rounded-full uppercase font-bold tracking-wider shadow-sm flex items-center gap-1 ${demo.badgeColor}`}>
                        <Icon className="w-2.5 h-2.5" /> {demo.badge}
                      </span>
                      {isPaid ? (
                        <span className="text-[9px] leading-[12px] px-2 py-1 rounded-full uppercase font-bold tracking-wider shadow-sm bg-amber-400 text-amber-900 border border-amber-300">
                          ₹{((demo.price ?? 0) / 100).toFixed(0)} / {demo.durationDays}d
                        </span>
                      ) : (
                        <span className="text-[9px] leading-[12px] px-2 py-1 rounded-full uppercase font-bold tracking-wider shadow-sm bg-emerald-500/90 text-white border border-emerald-400/50">
                          Free
                        </span>
                      )}
                    </div>
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
                  {/* 1. Preview Demo */}
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
                      onClick={() => handleActionClick(demo.id, "instant")}
                      disabled={isLoadingThis}
                      className="w-full py-2 px-3 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-70 text-white text-xs font-bold transition shadow-sm shadow-rose-200 flex items-center justify-between"
                    >
                      <span className="flex items-center gap-1.5">
                        {isLoadingThis ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Zap className="w-3.5 h-3.5 fill-white" />
                        )}
                        {demo.hasInstantUse && !isPaid ? "2. Use As-Is (Instant)" : "Use As-Is (Instant)"}
                      </span>
                      <span className="text-[10px] bg-rose-600 px-1.5 py-0.5 rounded font-normal">Direct Link</span>
                    </button>
                  )}

                  {/* Edit & Customize */}
                  <button
                    onClick={() => handleActionClick(demo.id, "builder")}
                    className={`w-full py-2 px-3 rounded-xl text-white text-xs font-bold transition shadow-sm flex items-center justify-between ${!demo.hasInstantUse
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
      </div>

      {/* Instant Use Title Modal */}
      <AnimatePresence>
        {selectedDemo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 shadow-2xl max-w-sm w-full border border-slate-100"
            >
              <h3 className="text-xl font-bold text-slate-900 mb-2">Give it a Title 🎀</h3>
              <p className="text-sm text-slate-500 mb-4">What would you like to call this event?</p>
              <input
                type="text"
                value={instantModalTitle}
                onChange={(e) => setInstantModalTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-rose-400 focus:ring-4 focus:ring-rose-100 transition outline-none text-slate-800 mb-5"
                placeholder="e.g. For Sarah ❤️"
                autoFocus
              />
              <div className="flex items-center gap-3">
                <button onClick={() => setSelectedDemo(null)} className="flex-1 px-4 py-3 rounded-xl text-slate-600 font-bold bg-slate-100 hover:bg-slate-200 transition">Cancel</button>
                <button
                  onClick={() => handleInstantUse(selectedDemo, instantModalTitle)}
                  className="flex-1 px-4 py-3 rounded-xl text-white font-bold bg-rose-500 hover:bg-rose-600 transition shadow-sm shadow-rose-200 flex items-center justify-center gap-2"
                >
                  Create Now
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Customize Modal */}
      <AnimatePresence>
        {customizeModalDemoId && (
          <CustomizeModal
            demoId={customizeModalDemoId}
            onClose={() => setCustomizeModalDemoId(null)}
          />
        )}
      </AnimatePresence>

      {/* Checkout Modal */}
      <AnimatePresence>
        {checkoutModal && (
          <CheckoutModal
            demoId={checkoutModal.demoId}
            templateName={checkoutModal.title}
            originalPrice={checkoutModal.price}
            durationDays={checkoutModal.durationDays}
            onClose={() => setCheckoutModal(null)}
            onSuccess={handlePaymentSuccess}
          />
        )}
      </AnimatePresence>
    </>
  );
}
