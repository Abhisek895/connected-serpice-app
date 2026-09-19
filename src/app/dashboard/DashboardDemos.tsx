"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Zap, Loader2, CheckCircle2, Copy, Edit3, Eye, X, ExternalLink, Palette } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createInstantEventFromTemplate } from "./builder/actions";
import { TEMPLATE_CLASSES } from "./templateConfig";
import { demos } from "./demoConfig";
import CheckoutModal from "./CheckoutModal";
import CustomizeModal from "./CustomizeModal";
import AutoClickSimulatedPreview from "@/components/ui/AutoClickSimulatedPreview";
import MiniTextArtPreviewShared from "@/components/MiniTextArtPreview";

type ThemePricingItem = {
  name: string;
  price: number;
  durationDays: number;
  isActive: boolean;
  title?: string | null;
  description?: string | null;
  thumbnailUrl?: string | null;
};

export default function DashboardDemos({
  themePricing,
  isPremiumUser
}: {
  themePricing?: ThemePricingItem[];
  isPremiumUser?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
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
  const [previewModalData, setPreviewModalData] = useState<{
    demoId: string;
    url: string;
    title: string;
    recipientName: string;
    isPaid: boolean;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [customizeModalDemoId, setCustomizeModalDemoId] = useState<string | null>(null);
  const [instantModalTitle, setInstantModalTitle] = useState("");

  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Sync URL search params to modal state on mount or change
  useEffect(() => {
    const demoParam = searchParams.get("demo");
    const actionParam = searchParams.get("action");

    if (demoParam) {
      if (actionParam === "customize" || actionParam === "builder") {
        setCustomizeModalDemoId(demoParam);
      } else if (actionParam === "instant") {
        setSelectedDemo(demoParam);
      }
    }
  }, [searchParams]);

  const updateUrlParam = (demoId: string | null, action: "instant" | "customize" | null) => {
    if (demoId && action) {
      router.push(`/dashboard?demo=${encodeURIComponent(demoId)}&action=${action}`, { scroll: false });
    } else {
      router.push("/dashboard", { scroll: false });
    }
  };

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
  }).filter(d => d.isActive).filter(d => {
    if (selectedCategory === "romantic") return d.id === "surprise" || d.id === "nasamajh-lakri" || d.id === "she-cant-say-no" || d.id === "im-sorry";
    if (selectedCategory === "birthday") return d.id === "birthday-wish";
    if (selectedCategory === "planner") return d.id.includes("planner");
    return true;
  });

  const [pendingTitle, setPendingTitle] = useState<string>("");
  const [appliedCouponCode, setAppliedCouponCode] = useState<string>("");

  useEffect(() => {
    if (selectedDemo || previewModalData) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedDemo, previewModalData]);

  const handleActionClick = (demoId: string, action: "instant" | "builder") => {
    const actionType = action === "instant" ? "instant" : "customize";
    updateUrlParam(demoId, actionType);
    if (action === "instant") {
      // Step 1 FIRST: Open Title Modal to ask for title BEFORE payment!
      setSelectedDemo(demoId);
      setInstantModalTitle("");
    } else {
      // Try-Before-You-Buy: Always allow free customization first!
      setCustomizeModalDemoId(demoId);
    }
  };

  const handleCloseCustomize = () => {
    setCustomizeModalDemoId(null);
    updateUrlParam(null, null);
  };

  const handleCloseInstantTitleModal = () => {
    setSelectedDemo(null);
    updateUrlParam(null, null);
  };

  const handleTitleSubmit = (demoId: string, customTitle: string) => {
    const demo = activeDemos.find((d) => d.id === demoId);
    setSelectedDemo(null);
    const finalTitle = customTitle.trim() || demo?.title || "Special Proposal ✨";
    setPendingTitle(finalTitle);

    if (demo && demo.price && demo.price > 0 && !isPremiumUser) {
      // Step 2 SECOND: Open Secure Checkout Modal with title already captured!
      setCheckoutModal({
        demoId: demo.id,
        title: demo.title,
        price: demo.price,
        durationDays: demo.durationDays,
        action: "instant"
      });
    } else {
      // If free template or premium user, create immediately
      handleInstantUse(demoId, finalTitle, "");
    }
  };

  const handlePaymentSuccess = async (usedCouponCode?: string) => {
    if (!checkoutModal) return;
    const { demoId } = checkoutModal;
    const activeCoupon = usedCouponCode || "";
    setCheckoutModal(null);

    // Create the event using the captured title and coupon
    await handleInstantUse(demoId, pendingTitle, activeCoupon);
    setPendingTitle("");
  };

  const handleInstantUse = async (demoId: string, customTitle: string, couponCodeOverride?: string) => {
    const demo = activeDemos.find(d => d.id === demoId);
    if (!demo) return;
    setLoadingId(demo.id);
    try {
      const tmplClass = TEMPLATE_CLASSES.find((t) => t.id === demo.id);
      const activeCoupon = couponCodeOverride !== undefined ? couponCodeOverride : appliedCouponCode;
      const derivedRecipient = customTitle
        ? customTitle.replace(/^(For|Surprise for)\s+/i, "").trim() || "Someone Special ✨"
        : "Someone Special ✨";

      const res = await createInstantEventFromTemplate(
        "Romantic",
        customTitle || tmplClass?.defaultData.title,
        derivedRecipient,
        demo.id,
        {
          internalTitle: customTitle,
          couponCode: activeCoupon,
          isFreePass: ["FREE100%", "FREE100", "FREE1"].includes(activeCoupon),
        }
      );
      setAppliedCouponCode("");
      if (res.success && res.customUrl) {
        const finalUrl = `${window.location.origin}${res.customUrl}`;
        const finalTitle = customTitle || demo.title;
        setPublishedUrl(finalUrl);
        setPublishedTitle(finalTitle);
        setPreviewModalData({
          demoId: demo.id,
          url: finalUrl,
          title: finalTitle,
          recipientName: derivedRecipient,
          isPaid: true,
        });
        router.refresh();
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
      <div className="bg-gradient-to-r from-rose-50/60 via-purple-50/40 to-slate-50 border border-rose-100/80 -mx-4 sm:mx-0 w-[calc(100%+2rem)] sm:w-full rounded-none sm:rounded-3xl border-x-0 sm:border p-4 sm:p-6 md:p-8 shadow-sm relative overflow-hidden mb-8">

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
                <Palette className="w-3.5 h-3.5 text-rose-500" /> Pre-Configured Templates
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              Explore Demos &amp; Template Actions 💖
            </h2>
            <p className="text-slate-500 text-sm md:text-base mt-1">
              Preview demo pages live, or customize them with your own photos &amp; questions to save permanently!
            </p>

            {/* Category Filter Tabs */}
            <div className="flex flex-wrap gap-2 mt-4">
              {[
                { id: "all", label: "🎨 All Templates" },
                { id: "romantic", label: "❤️ Romantic Proposals" },
                { id: "birthday", label: "🎂 Birthday Cards" },
                { id: "planner", label: "🌸 Date Planners" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition shadow-xs ${selectedCategory === cat.id
                    ? "bg-slate-900 text-white shadow-md"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                    }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Published Link Banner */}
        <AnimatePresence>
          {publishedUrl && !previewModalData && (
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
                    {demo.id === "surprise" ? (
                      <MiniTextArtPreviewShared src={demo.image} phrase="LOVE YOU" />
                    ) : (
                      <img
                        src={demo.image}
                        alt={demo.title}
                        className="w-full h-full object-cover object-[center_25%] group-hover:scale-105 transition-transform duration-500"
                      />
                    )}
                    {/* Light gradient just for text readability at the bottom, no dark overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent" />

                    {/* OurStory brand watermark on card thumbnail */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-sm border border-white/15 text-white text-[9px] font-bold tracking-wide whitespace-nowrap shadow-sm pointer-events-none">
                      💖 Made with OurStory
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
                    data-tour="preview-demo"
                    className="w-full py-1.5 px-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition flex items-center justify-between group"
                  >
                    <span className="flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-slate-500 group-hover:text-rose-500" /> Preview Demo
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">Test Live</span>
                  </a>

                  {/* Use As-Is (Instant) — only for instant templates */}
                  {demo.hasInstantUse && (
                    <button
                      onClick={() => handleActionClick(demo.id, "instant")}
                      disabled={isLoadingThis}
                      data-tour="use-as-is"
                      className="w-full py-2 px-3 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-70 text-white text-xs font-bold transition shadow-sm shadow-rose-200 flex items-center justify-between"
                    >
                      <span className="flex items-center gap-1.5">
                        {isLoadingThis ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Zap className="w-3.5 h-3.5 fill-white" />
                        )}
                        Use As-Is (Instant)
                      </span>
                      <span className="text-[10px] bg-rose-600 px-1.5 py-0.5 rounded font-normal">Direct Link</span>
                    </button>
                  )}

                  {/* Edit & Customize */}
                  <button
                    onClick={() => handleActionClick(demo.id, "builder")}
                    data-tour="customize-demo"
                    className={`w-full py-2 px-3 rounded-xl text-white text-xs font-bold transition shadow-sm flex items-center justify-between ${!demo.hasInstantUse
                      ? "bg-rose-500 hover:bg-rose-600 shadow-rose-200"
                      : "bg-slate-900 hover:bg-slate-800"
                      }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Edit3 className="w-3.5 h-3.5" />
                      Edit & Customize
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
          <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Full-screen backdrop covering top to bottom seamlessly */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 w-full h-full min-h-screen min-h-[100dvh] bg-slate-950/80 backdrop-blur-md"
              onClick={handleCloseInstantTitleModal}
            />

            {/* Modal positioning container */}
            <div className="relative min-h-[100dvh] w-full flex items-start sm:items-center justify-center p-4 pt-6 pb-12 sm:p-4 pointer-events-none">
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: -10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: -10 }}
                className="relative bg-white rounded-3xl p-5 sm:p-6 shadow-2xl max-w-sm w-full border border-slate-100 pointer-events-auto sm:my-auto"
              >
              {/* Close Button */}
              <button
                type="button"
                onClick={handleCloseInstantTitleModal}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-bold text-slate-900 mb-1.5 pr-8">Give it a Title 🎀</h3>
              <p className="text-sm text-slate-500 mb-3.5">What would you like to call this event?</p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (instantModalTitle.trim().length > 0) {
                    handleTitleSubmit(selectedDemo, instantModalTitle);
                  }
                }}
              >
                <div className="relative">
                  <input
                    type="text"
                    value={instantModalTitle}
                    onChange={(e) => setInstantModalTitle(e.target.value.slice(0, 60))}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-rose-400 focus:ring-4 focus:ring-rose-100 transition outline-none text-slate-800 mb-1"
                    placeholder="e.g. For Sarah ❤️"
                    autoFocus
                  />
                  <span className={`text-[10px] font-semibold absolute right-3 bottom-3.5 ${instantModalTitle.length >= 55 ? 'text-amber-500' : 'text-slate-400'}`}>
                    {instantModalTitle.length}/60
                  </span>
                </div>

                <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                  Try:{" "}
                  <button
                    type="button"
                    onClick={() => setInstantModalTitle("For Priya 💖")}
                    className="text-rose-500 hover:text-rose-600 hover:underline cursor-pointer font-medium"
                  >
                    &quot;For Priya 💖&quot;
                  </button>
                  {", "}
                  <button
                    type="button"
                    onClick={() => setInstantModalTitle("Surprise for Ananya ✨")}
                    className="text-rose-500 hover:text-rose-600 hover:underline cursor-pointer font-medium"
                  >
                    &quot;Surprise for Ananya ✨&quot;
                  </button>
                  {", "}
                  <button
                    type="button"
                    onClick={() => setInstantModalTitle("For My Best Girl 🌸")}
                    className="text-rose-500 hover:text-rose-600 hover:underline cursor-pointer font-medium"
                  >
                    &quot;For My Best Girl 🌸&quot;
                  </button>
                </p>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleCloseInstantTitleModal}
                    className="flex-1 px-4 py-3 rounded-xl text-slate-600 font-bold bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={instantModalTitle.trim().length === 0}
                    className="flex-1 px-4 py-3 rounded-xl text-white font-bold bg-rose-500 hover:bg-rose-600 transition shadow-sm shadow-rose-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Continue ➔
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
        )}
      </AnimatePresence>

      {/* Customize Modal */}
      <AnimatePresence>
        {customizeModalDemoId && (
          <CustomizeModal
            demoId={customizeModalDemoId}
            themePricing={themePricing}
            isPremiumUser={isPremiumUser}
            onClose={handleCloseCustomize}
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
            isPremiumUser={isPremiumUser}
            onClose={() => setCheckoutModal(null)}
            onSuccess={handlePaymentSuccess}
          />
        )}
      </AnimatePresence>

      {/* 🌸 Instant Use Live Recipient Experience Simulated Preview Modal */}
      <AnimatePresence>
        {previewModalData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto w-screen h-screen">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl p-4 sm:p-5 max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-rose-100 relative my-auto"
            >
              <button
                onClick={() => setPreviewModalData(null)}
                className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition z-30 cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <AutoClickSimulatedPreview
                demoId={previewModalData.demoId}
                formValues={{
                  ...(TEMPLATE_CLASSES.find((t) => t.id === previewModalData.demoId)?.defaultData || {}),
                  title: previewModalData.title,
                  recipientName: previewModalData.recipientName,
                }}
                defaultData={TEMPLATE_CLASSES.find((t) => t.id === previewModalData.demoId)?.defaultData || {}}
                publishedUrl={previewModalData.url}
                isPaid={previewModalData.isPaid}
                isPremiumUser={isPremiumUser}
                onShareFreeLink={() => {
                  const text = `Hey! I made a special surprise link for you... Tap here to open 💖\n${previewModalData.url}`;
                  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
                }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
