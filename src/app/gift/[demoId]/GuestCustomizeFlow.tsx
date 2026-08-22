"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Script from "next/script";
import Link from "next/link";
import {
  X, Sparkles, ChevronRight, ChevronLeft, Loader2, Send,
  CheckCircle2, Copy, ExternalLink, Image as ImageIcon, Music,
  AlertCircle, Smartphone, Edit3, Tag, Heart, Compass, Gift, Zap, Eye, Bell, LucideIcon,
} from "lucide-react";
import type { DemoItem } from "@/app/dashboard/demoConfig";
import type { TemplateClass, TemplateField } from "@/app/dashboard/templateConfig";
import LivePhonePreview from "@/components/ui/LivePhonePreview";
import AutoClickSimulatedPreview from "@/components/ui/AutoClickSimulatedPreview";

// Map demoId → icon client-side (icons are functions, can't be serialized server→client)
const DEMO_ICONS: Record<string, LucideIcon> = {
  "surprise": Sparkles,
  "birthday-wish": Gift,
  "im-sorry": Sparkles,
  "she-cant-say-no": Heart,
  "nasamajh-lakri": Heart,
  "date-planner": Compass,
  "jalpaiguri-planner": Compass,
};

function getUtmParams() {
  if (typeof window === "undefined") return { source: "", campaign: "" };
  const p = new URLSearchParams(window.location.search);
  return {
    source: p.get("utm_source") || "",
    campaign: p.get("utm_campaign") || "",
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// FieldInput Component — renders fields with preset suggestion pills
// ─────────────────────────────────────────────────────────────────────────────

function FieldInput({
  field,
  value,
  onChange,
  onFileChange,
  fileStatus,
  isLoading,
}: {
  field: TemplateField;
  value?: string;
  onChange?: (val: string) => void;
  onFileChange?: (file: File, fieldKey: string) => void;
  fileStatus?: "idle" | "uploading" | "done";
  isLoading?: boolean;
}) {
  const baseInput =
    "w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition bg-white";

  if (field.type === "text") {
    return (
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          {field.label} {field.required && <span className="text-rose-500">*</span>}
        </label>
        <input
          type="text"
          required={field.required}
          value={value ?? ""}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={field.placeholder}
          className={baseInput}
        />
        {field.hint && <p className="text-[11px] text-slate-400 mt-1">{field.hint}</p>}
        {field.presetSuggestions && field.presetSuggestions.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5 items-center">
            {field.presetSuggestions.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onChange?.(preset)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200/60 text-rose-700 font-medium transition cursor-pointer"
              >
                {preset}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (field.type === "textarea") {
    return (
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          {field.label} {field.required && <span className="text-rose-500">*</span>}
        </label>
        <textarea
          required={field.required}
          value={value ?? ""}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={field.placeholder}
          rows={4}
          className={`${baseInput} resize-none`}
        />
        {field.hint && <p className="text-[11px] text-slate-400 mt-1">{field.hint}</p>}
        {field.presetSuggestions && field.presetSuggestions.length > 0 && (
          <div className="mt-2 space-y-1.5">
            {field.presetSuggestions.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onChange?.(preset)}
                className="w-full text-left text-[11px] p-2.5 rounded-xl bg-rose-50/70 hover:bg-rose-100 border border-rose-200/60 text-rose-800 font-medium transition line-clamp-2 cursor-pointer"
              >
                "{preset}"
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (field.type === "file-image" || field.type === "file-audio") {
    const isImage = field.type === "file-image";
    const Icon = isImage ? ImageIcon : Music;
    const statusText =
      fileStatus === "uploading"
        ? "Uploading…"
        : fileStatus === "done"
          ? "✓ Uploaded!"
          : isImage
            ? "Choose Photo"
            : "Choose Audio";
    const statusColor =
      fileStatus === "done"
        ? "text-emerald-600 font-bold"
        : fileStatus === "uploading"
          ? "text-amber-600"
          : isImage
            ? "text-rose-600"
            : "text-slate-600";

    return (
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          {field.label}
        </label>
        <label
          className={`relative flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed cursor-pointer transition ${fileStatus === "done"
            ? "border-emerald-300 bg-emerald-50"
            : isImage
              ? "border-rose-200 bg-rose-50/50 hover:border-rose-400 hover:bg-rose-50"
              : "border-slate-200 bg-slate-50 hover:border-slate-300"
            } ${isLoading ? "opacity-50 pointer-events-none" : ""}`}
        >
          {fileStatus === "uploading" ? (
            <Loader2 className="w-5 h-5 animate-spin text-amber-500 flex-shrink-0" />
          ) : (
            <Icon className={`w-5 h-5 flex-shrink-0 ${isImage ? "text-rose-500" : "text-slate-500"}`} />
          )}
          <span className={`text-sm ${statusColor}`}>{statusText}</span>
          <input
            type="file"
            accept={field.accept}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isLoading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onFileChange?.(file, field.key);
            }}
          />
        </label>
        {field.hint && <p className="text-[11px] text-slate-400 mt-1">{field.hint}</p>}
      </div>
    );
  }

  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// GuestCustomizeFlow Component
// ─────────────────────────────────────────────────────────────────────────────

export default function GuestCustomizeFlow({
  demo,
  tmpl,
}: {
  demo: Omit<DemoItem, "icon">;
  tmpl: TemplateClass;
}) {
  const [viewState, setViewState] = useState<"landing" | "customize" | "checkout" | "done">("landing");
  const [currentStep, setCurrentStep] = useState(0);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [fileStatuses, setFileStatuses] = useState<Record<string, "idle" | "uploading" | "done">>({});
  const [showCheckoutView, setShowCheckoutView] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showExitPushToast, setShowExitPushToast] = useState(false);
  const [showPaymentPushModal, setShowPaymentPushModal] = useState(false);
  const [showPaymentCancelledPushModal, setShowPaymentCancelledPushModal] = useState(false);

  // Coupon & Payment state
  const [couponCode, setCouponCode] = useState("LOVE2026");
  const [couponStatus, setCouponStatus] = useState<"idle" | "validating" | "valid" | "invalid">("idle");
  const [couponMessage, setCouponMessage] = useState("");
  const [finalPrice, setFinalPrice] = useState(demo.price ?? 0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);

  const Icon = DEMO_ICONS[demo.id] ?? Sparkles;
  const totalSteps = tmpl.steps.length;
  const step = tmpl.steps[currentStep];

  // Initialize form with template defaultData & check URL params
  useEffect(() => {
    const vals: Record<string, string> = {};
    for (const s of tmpl.steps) {
      for (const f of s.fields) {
        vals[f.key] = tmpl.defaultData[f.key] ?? "";
      }
    }
    setFormValues(vals);
    setFinalPrice(demo.price ?? 0);

    // Sync URL action parameter
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search);
      const action = p.get("action");
      if (action === "instant") {
        setShowCheckoutView(true);
        setViewState("checkout");
      } else if (action === "customize" || action === "builder") {
        setViewState("customize");
      }
    }
  }, [tmpl]);

  // Coupon auto-validation
  useEffect(() => {
    if (couponCode.length < 3) {
      setCouponStatus("idle");
      setFinalPrice(demo.price ?? 0);
      setCouponMessage("");
      return;
    }
    const timer = setTimeout(validateCoupon, 400);
    return () => clearTimeout(timer);
  }, [couponCode, demo.price]);

  async function validateCoupon() {
    setCouponStatus("validating");
    try {
      const res = await fetch("/api/coupon/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, demoId: demo.id }),
      });
      const data = await res.json();
      if (data.valid) {
        setCouponStatus("valid");
        setFinalPrice(data.finalPrice);
        setCouponMessage(data.message || "Coupon applied successfully!");
      } else {
        setCouponStatus("invalid");
        setFinalPrice(demo.price ?? 0);
        setCouponMessage(data.message || "Invalid coupon");
      }
    } catch {
      setCouponStatus("invalid");
      setFinalPrice(demo.price ?? 0);
      setCouponMessage("Failed to validate coupon");
    }
  }

  const handleFieldChange = (key: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleFileChange = async (file: File, fieldKey: string) => {
    setFileStatuses((prev) => ({ ...prev, [fieldKey]: "uploading" }));
    setError(null);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });
      const data = await res.json();

      if (data.success && data.url) {
        setFormValues((prev) => ({ ...prev, [fieldKey]: data.url }));
        setFileStatuses((prev) => ({ ...prev, [fieldKey]: "done" }));
        return;
      }

      // Client-side fallback
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
      });

      setFormValues((prev) => ({ ...prev, [fieldKey]: dataUrl }));
      setFileStatuses((prev) => ({ ...prev, [fieldKey]: "done" }));
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "File upload failed.");
      setFileStatuses((prev) => ({ ...prev, [fieldKey]: "idle" }));
    }
  };

  async function handlePayment() {
    setIsProcessing(true);
    setError(null);
    const { source, campaign } = getUtmParams();
    const activeCoupon = couponStatus === "valid" ? couponCode : undefined;

    try {
      const res = await fetch("/api/guest/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          demoId: demo.id,
          couponCode: activeCoupon,
          utmSource: source,
          utmCampaign: campaign,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed to create order");

      if (data.orderId === "FREE" || data.amount === 0) {
        await createGuestEvent("FREE", "", "", source, campaign);
        return;
      }

      if (data.isMock) {
        setTimeout(
          () => createGuestEvent(data.orderId, `mock_pay_${Date.now()}`, "mock_signature_for_development", source, campaign),
          1200
        );
        return;
      }

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "OurStory 💖",
        description: demo.title,
        order_id: data.orderId,
        handler: async (response: any) => {
          await createGuestEvent(
            response.razorpay_order_id,
            response.razorpay_payment_id,
            response.razorpay_signature,
            source,
            campaign
          );
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            setError(null);
            setShowPaymentCancelledPushModal(true);
          },
        },
        theme: { color: "#e11d48" },
      };

      new (window as any).Razorpay(options).open();
    } catch (err: any) {
      setError(err.message || "Payment failed");
      setIsProcessing(false);
    }
  }

  async function createGuestEvent(orderId: string, paymentId: string, sig: string, source: string, campaign: string) {
    try {
      const overrides: Record<string, any> = {};
      for (const stepItem of tmpl.steps) {
        for (const field of stepItem.fields) {
          const val = formValues[field.key];
          if (val !== undefined && val !== "") {
            overrides[field.key] = val;
            if (field.key === "_photo" || field.key === "_photo1") overrides["photoUrl"] = val;
            if (field.key === "_audio") overrides["audioUrl"] = val;
          }
        }
      }

      const res = await fetch("/api/guest/create-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          demoId: demo.id,
          customData: overrides,
          razorpayOrderId: orderId,
          razorpayPaymentId: paymentId,
          razorpaySignature: sig,
          utmSource: source,
          utmCampaign: campaign,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed to create event");

      setPublishedUrl(`${window.location.origin}${data.shareUrl}`);
    } catch (err: any) {
      setError(err.message || "Something went wrong creating your page");
    } finally {
      setIsProcessing(false);
    }
  }

  const origPriceINR = (demo.price ?? 0) / 100;
  const finalPriceINR = finalPrice / 100;

  // ───────────────────────────────────────────────────────────────────────────
  // Post-Payment Success Screen (with Auto-Click Simulated Preview)
  // ───────────────────────────────────────────────────────────────────────────
  if (publishedUrl) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-3 sm:p-6">
        <div className="bg-white rounded-3xl p-5 max-w-2xl w-full shadow-2xl border border-rose-100 relative">
          <AutoClickSimulatedPreview
            demoId={demo.id}
            formValues={formValues}
            defaultData={tmpl.defaultData}
            publishedUrl={publishedUrl}
            isPaid={true}
            onActivateOffer={() => { }}
            onShareFreeLink={() => {
              const text = `Hey! I made a special surprise link for you... Tap here to open 💖\n${publishedUrl}`;
              window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
            }}
          />

          {/* Save Page to Dashboard Account Banner */}
          <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-3 border border-rose-500/30">
            <div>
              <p className="text-xs font-black text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> Save Page &amp; Track Live Views
              </p>
              <p className="text-xs text-slate-300 font-medium mt-0.5">
                Create a free account to track when {formValues["recipientName"] || "they"} open your surprise &amp; answer YES! 💖
              </p>
            </div>
            <Link
              href="/register"
              className="whitespace-nowrap px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
            >
              Create Free Account ➔
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Public Landing Choice View (Hero Card with 3 Distinct Choice Buttons)
  // ───────────────────────────────────────────────────────────────────────────
  if (viewState === "landing") {
    return (
      <>
        {/* 🔔 Cute Push Notification Toast (Populates AFTER clicking "Yes, exit") */}
        <AnimatePresence>
          {showExitPushToast && (
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="fixed top-4 left-1/2 -translate-x-1/2 z-[10000] w-full max-w-sm px-3 pointer-events-auto"
            >
              <div className="bg-slate-900/95 backdrop-blur-xl border border-rose-500/40 text-white rounded-2xl p-4 shadow-2xl flex items-start gap-3.5 relative overflow-hidden ring-1 ring-white/10">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-pink-500 to-amber-400" />
                
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shrink-0 shadow-md shadow-rose-500/30 mt-0.5">
                  <Bell className="w-4 h-4 text-white animate-bounce" />
                </div>

                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400 fill-amber-400" /> OurStory Special Offer
                    </span>
                    <span className="text-[10px] text-slate-400">now</span>
                  </div>
                  <p className="text-xs font-black text-white leading-snug">
                    Aww, don&apos;t let {formValues["recipientName"] || "your special someone"} wait! 🥺🌸
                  </p>
                  <p className="text-[11px] text-slate-300 font-medium leading-relaxed mt-1">
                    Your surprise is almost ready! Finish now &amp; use code <span className="text-amber-300 font-black bg-amber-400/20 px-1.5 py-0.5 rounded">LOVE2026</span> for extra discount! 💖
                  </p>

                  <button
                    onClick={() => {
                      setShowExitPushToast(false);
                      setViewState("customize");
                    }}
                    className="mt-2.5 px-3 py-1.5 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-extrabold text-[11px] rounded-xl shadow-md shadow-rose-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Re-Open &amp; Finish Surprise</span> ✨
                  </button>
                </div>

                <button
                  onClick={() => setShowExitPushToast(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg transition shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-rose-950 to-slate-950 relative overflow-hidden flex items-center justify-center p-4">
        {/* Floating hearts background */}
        {Array.from({ length: 12 }, (_, i) => (
          <motion.div
            key={i}
            className="absolute text-rose-500/20 select-none pointer-events-none"
            style={{ left: `${(i * 8.3) % 100}%`, top: `${(i * 13.7) % 100}%`, fontSize: `${1.5 + (i % 3) * 0.8}rem` }}
            animate={{ y: [-20, 20, -20], opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 3 + i * 0.4, repeat: Infinity, delay: i * 0.3 }}
          >
            💖
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full relative z-10"
        >
          <div className="text-center mb-4">
            <span className="text-rose-400 text-xs font-bold tracking-widest uppercase">💖 Made with OurStory</span>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/10">
            {/* Thumbnail */}
            <div className="relative h-52 w-full overflow-hidden bg-slate-900">
              <img src={demo.image} alt={demo.title} className="w-full h-full object-cover object-[center_25%]" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
              <div className="absolute top-3 left-3 flex gap-1.5">
                <span className={`${demo.badgeColor} px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1`}>
                  <Icon className="w-3 h-3" /> {demo.badge}
                </span>
                {(demo.price ?? 0) > 0 && (
                  <span className="bg-amber-400 text-amber-950 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm border border-amber-300">
                    ₹{((demo.price ?? 0) / 100).toFixed(0)} / {demo.durationDays ?? 14}d
                  </span>
                )}
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div>
                <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <Icon className="w-5 h-5 text-rose-500 shrink-0" />
                  {demo.title}
                </h1>
                <p className="text-xs text-slate-600 leading-relaxed mt-1.5">{demo.description}</p>
              </div>

              {/* 3 Distinct Action Buttons */}
              <div className="space-y-2.5 pt-1">
                {/* 1. Preview Demo */}
                <a
                  href={demo.previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition flex items-center justify-between group"
                >
                  <span className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-slate-400 group-hover:text-rose-500" />
                    1. Preview Demo
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">Test Live</span>
                </a>

                {/* 2. Use As-Is (Instant Direct Link) — skips form editing completely */}
                {demo.hasInstantUse && (
                  <button
                    onClick={() => { setShowCheckoutView(true); setViewState("checkout"); }}
                    className="w-full py-3 px-4 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition shadow-md shadow-rose-200 flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Zap className="w-4 h-4 fill-white" /> 2. Use As-Is (Instant)
                    </span>
                    <span className="text-[10px] bg-rose-600 px-2 py-0.5 rounded font-medium">Direct Link (5s)</span>
                  </button>
                )}

                {/* 3. Edit & Customize (Add Your Text/Photos) — opens customizer form editor */}
                <button
                  onClick={() => setViewState("customize")}
                  className={`w-full py-3 px-4 rounded-xl text-white text-xs font-bold transition shadow-sm flex items-center justify-between cursor-pointer ${!demo.hasInstantUse ? "bg-rose-500 hover:bg-rose-600 shadow-rose-200" : "bg-slate-900 hover:bg-slate-800"}`}
                >
                  <span className="flex items-center gap-2">
                    <Edit3 className="w-4 h-4" />
                    {!demo.hasInstantUse ? "2. Edit & Customize" : "3. Edit & Customize"}
                  </span>
                  <span className="text-[10px] opacity-80 font-normal">Add Your Text/Photos</span>
                </button>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> Instant Share Link</span>
                <span>🔒 SSL Encrypted</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      </>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Checkout / Payment Modal View
  // ───────────────────────────────────────────────────────────────────────────
  if (showCheckoutView) {
    return (
      <div className="min-h-screen bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
        <Script src="https://checkout.razorpay.com/v1/checkout.js" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-2xl border border-rose-100 max-w-md w-full overflow-hidden relative"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-rose-50 to-pink-50 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-rose-500" /> Secure Checkout
              </h2>
              <p className="text-sm font-semibold text-rose-600 mt-0.5">{demo.title}</p>
            </div>
            <button
              onClick={() => setShowCheckoutView(false)}
              className="p-2 hover:bg-white rounded-full transition-colors text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Price line */}
            <div className="flex justify-between items-center text-slate-700 font-medium">
              <span>Original Price</span>
              <span className="font-bold">₹{origPriceINR.toFixed(2)}</span>
            </div>

            {/* Coupon input & chips */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-rose-500" /> Apply Coupon Code
                </span>
                <span className="text-[11px] text-rose-600 font-semibold">Suggested 👇</span>
              </label>

              <div className="relative">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Enter code (e.g. LOVE2026)"
                  className="w-full pl-4 pr-10 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all uppercase font-black text-slate-900 text-sm tracking-wide"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {couponStatus === "validating" && <Loader2 className="w-4 h-4 text-rose-500 animate-spin" />}
                  {couponStatus === "valid" && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                  {couponStatus === "invalid" && <AlertCircle className="w-5 h-5 text-rose-500" />}
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {["LOVE2026", "SPECIAL50", "OURSTORY"].map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setCouponCode(code)}
                    className={`text-[11px] px-3 py-1.5 rounded-xl border font-black transition flex items-center gap-1 cursor-pointer ${couponCode === code
                      ? "bg-amber-400 text-slate-950 border-amber-500 shadow-md ring-2 ring-amber-300"
                      : "bg-slate-100 text-slate-950 border-slate-300 hover:bg-slate-200"
                      }`}
                  >
                    🏷️ <span className="text-slate-950 font-black">{code}</span>
                  </button>
                ))}
              </div>

              {couponMessage && (
                <p className={`text-xs font-bold mt-1.5 ${couponStatus === "valid" ? "text-emerald-600" : "text-rose-500"}`}>
                  {couponStatus === "valid" ? `✓ ${couponMessage}` : couponMessage}
                </p>
              )}
            </div>

            {/* Total summary */}
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-900 font-bold">Total to Pay</span>
                <div className="text-right">
                  <span className="text-2xl font-black text-rose-600">₹{finalPriceINR.toFixed(2)}</span>
                  {finalPriceINR === 0 && (
                    <span className="block text-[10px] text-emerald-600 font-extrabold uppercase tracking-wide">
                      100% FREE PASS
                    </span>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-500 text-center bg-slate-50 py-2.5 rounded-xl border border-slate-100 font-medium">
                Includes full access for <strong>{demo.durationDays ?? 14} days</strong> + instant link publishing.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold text-center">
                {error}
              </div>
            )}

            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full py-4 px-4 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-rose-200 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Processing Payment...
                </>
              ) : finalPriceINR === 0 ? (
                "🚀 Activate 1-Day Free Pass (₹0)"
              ) : (
                `Pay ₹${finalPriceINR.toFixed(2)} & Activate Link`
              )}
            </button>

            <p className="text-[10px] text-slate-400 text-center">
              🔒 256-Bit SSL Encrypted Payment · No Account Required
            </p>
          </div>
        </motion.div>

        {/* 🌸 CUTE PAYMENT CANCELLED PUSH POPUP MODAL (Renders in Checkout view) */}
        <AnimatePresence>
          {showPaymentCancelledPushModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden relative border border-rose-100 text-center"
              >
                {/* Top gradient accent line */}
                <div className="h-1.5 bg-gradient-to-r from-rose-400 via-pink-500 to-amber-400" />

                <div className="p-6 space-y-4">
                  {/* Cute heart illustration */}
                  <motion.div
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    className="w-16 h-16 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto shadow-inner text-3xl"
                  >
                    💖
                  </motion.div>

                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-slate-900 leading-tight">
                      Aww, payment was paused! 🥺🌸
                    </h3>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                      Don&apos;t worry! Your special surprise for <span className="font-extrabold text-rose-600">{formValues["recipientName"] || "your special someone"}</span> is safely saved.
                    </p>
                  </div>

                  {/* Coupon Badge */}
                  <div className="bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-200 rounded-2xl p-3.5 space-y-1">
                    <div className="inline-flex items-center gap-1 bg-amber-400 text-amber-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      🏷️ LOVE2026 Applied (50% OFF)
                    </div>
                    <p className="text-xs font-black text-rose-600 pt-0.5">
                      Unlock for only ₹{finalPriceINR.toFixed(0)} right now! ✨
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-1">
                    <button
                      onClick={() => {
                        setShowPaymentCancelledPushModal(false);
                        handlePayment();
                      }}
                      className="w-full py-3.5 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-600 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg shadow-rose-200 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 fill-white" />
                      🚀 Retry Payment &amp; Activate Link
                    </button>

                    <button
                      onClick={() => {
                        setShowPaymentCancelledPushModal(false);
                        setShowCheckoutView(false);
                        setViewState("customize");
                      }}
                      className="w-full py-2.5 text-slate-400 hover:text-slate-600 font-bold text-xs transition cursor-pointer"
                    >
                      Edit My Surprise ✏️
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Main Dual-Column Customizer Interface (100% Matching CustomizeModal)
  // ───────────────────────────────────────────────────────────────────────────
  return (
    <>
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-3 sm:p-6">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-rose-100 relative"
      >
        {/* Header */}
        <div className="sticky top-0 z-40 bg-white rounded-t-3xl border-b border-slate-100 px-6 pt-5 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-100 rounded-2xl text-rose-600 flex-shrink-0">
              <Icon className="w-5 h-5 text-rose-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 leading-tight">
                Customize &amp; Save 💌
              </h3>
              <p className="text-xs text-slate-500">{demo.title}</p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* Left Column: Form Inputs */}
            <div className="lg:col-span-7 space-y-4">
              {/* Step Progress */}
              {totalSteps > 1 && (
                <div className="flex items-center gap-2 mb-2">
                  {tmpl.steps.map((s, i) => (
                    <div key={i} className="flex items-center gap-2 flex-1">
                      <div
                        className={`flex-1 h-1.5 rounded-full transition-all ${i <= currentStep ? "bg-rose-500" : "bg-slate-200"
                          }`}
                      />
                    </div>
                  ))}
                  <span className="text-xs font-bold text-slate-400 whitespace-nowrap">
                    {currentStep + 1} / {totalSteps}
                  </span>
                </div>
              )}

              {/* Form Steps Body */}
              <div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    {/* Step Header */}
                    <div className="mb-2">
                      <h4 className="font-bold text-slate-900">{step.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{step.description}</p>
                    </div>

                    {/* Fields */}
                    {step.fields.map((field) => (
                      <FieldInput
                        key={field.key}
                        field={field}
                        value={formValues[field.key]}
                        onChange={(val) => handleFieldChange(field.key, val)}
                        onFileChange={handleFileChange}
                        fileStatus={fileStatuses[field.key] as any}
                      />
                    ))}
                  </motion.div>
                </AnimatePresence>

                {error && (
                  <div className="mt-4 flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-2xl p-3.5 text-sm text-red-700">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Interactive Live Phone Preview (Always Visible On All Screen Sizes) */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center bg-slate-50 rounded-2xl p-4 border border-slate-100 w-full sticky top-20">
              <div className="w-full flex items-center justify-between mb-3 px-1">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-rose-500" /> Live Recipient View
                </p>
                <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                  Updates Live ✨
                </span>
              </div>
              <LivePhonePreview
                demoId={demo.id}
                formValues={formValues}
                defaultData={tmpl.defaultData}
                currentStep={currentStep}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 z-40 bg-white border-t border-slate-100 px-6 py-4 flex items-center gap-3 rounded-b-3xl">
          {currentStep > 0 ? (
            <button
              onClick={() => setCurrentStep((s) => s - 1)}
              className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          ) : (
            <button
              onClick={() => setShowExitModal(true)}
              className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition inline-block cursor-pointer"
            >
              Browse Templates
            </button>
          )}

          {currentStep < totalSteps - 1 ? (
            <button
              onClick={() => setCurrentStep((s) => s + 1)}
              className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              Next Step <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setShowCheckoutView(true)}
              className="flex-1 py-2.5 px-4 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs transition shadow-md shadow-rose-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" /> Continue to Payment →
            </button>
          )}
        </div>
      </motion.div>
    </div>

    {/* 💔 Exit Confirmation Modal */}
    <AnimatePresence>
      {showExitModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden text-center"
          >
            {/* Top gradient bar */}
            <div className="h-1.5 bg-gradient-to-r from-rose-400 via-pink-500 to-rose-600" />

            <div className="px-6 pt-6 pb-7 flex flex-col items-center gap-4">
              {/* Animated broken heart */}
              <motion.div
                animate={{ rotate: [0, -8, 8, -8, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 1.2, ease: "easeInOut", repeat: Infinity, repeatDelay: 2 }}
                className="text-5xl"
              >
                💔
              </motion.div>

              <div className="space-y-1.5">
                <h3 className="text-lg font-black text-slate-900">
                  Wait… don’t go yet! 🥺
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  <span className="font-bold text-rose-500">{formValues["recipientName"] || "Your special someone"}</span> is waiting for this surprise.
                  <br />
                  It only takes a moment to finish — and their smile will be worth it. ✨
                </p>
              </div>

              {/* Cute reassurance badge */}
              <div className="bg-rose-50 border border-rose-100 rounded-2xl px-4 py-2.5 w-full">
                <p className="text-xs font-semibold text-rose-700">
                  💖 You’re {Math.round(((currentStep + 1) / totalSteps) * 100)}% done… so close!
                </p>
              </div>

              <div className="flex flex-col gap-2.5 w-full pt-1">
                {/* Primary: stay */}
                <button
                  onClick={() => setShowExitModal(false)}
                  className="w-full py-3.5 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-rose-200 hover:from-rose-600 hover:to-pink-700 transition-all"
                >
                  No, keep going! 💪
                </button>

                {/* Secondary: confirm exit -> opens Cute Payment Push Modal */}
                <button
                  onClick={() => {
                    setShowExitModal(false);
                    setShowPaymentPushModal(true);
                  }}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-2xl transition-all cursor-pointer"
                >
                  Yes, exit
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* 🎁 CUTE PAYMENT PUSH RETENTION MODAL (Triggers when clicking "Yes, exit") */}
    <AnimatePresence>
      {showPaymentPushModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden relative border border-rose-100 text-center"
          >
            {/* Header banner */}
            <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white px-6 py-4 relative overflow-hidden">
              <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full border border-white/30 inline-block mb-1">
                🎁 Exclusive Exit Offer
              </span>
              <h3 className="text-lg font-black leading-tight">
                Don&apos;t leave {formValues["recipientName"] || "your special someone"} waiting! 🥺💖
              </h3>
            </div>

            <div className="p-6 space-y-5">
              {/* Cute heart illustration */}
              <div className="flex justify-center -mt-2">
                <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center shadow-inner text-3xl">
                  ✨
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Your surprise for <span className="font-extrabold text-rose-600">{formValues["recipientName"] || "someone special"}</span> is already created! Unlock instant link publishing right now with an extra exit discount!
              </p>

              {/* Discount Offer Card */}
              <div className="bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-200 rounded-2xl p-4 text-center space-y-2 relative">
                <div className="inline-flex items-center gap-1.5 bg-amber-400 text-amber-950 text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                  🏷️ Code: LOVE2026 Auto-Applied
                </div>

                <div className="flex items-center justify-center gap-3 pt-1">
                  <span className="text-sm font-bold text-slate-400 line-through">₹{origPriceINR.toFixed(0)}</span>
                  <span className="text-3xl font-black text-rose-600">₹{finalPriceINR.toFixed(0)}</span>
                  {finalPriceINR === 0 && (
                    <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded">FREE PASS</span>
                  )}
                </div>

                <p className="text-[11px] text-slate-500 font-semibold">
                  ⚡ Includes 14-day live page duration + real-time view tracker
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-1">
                <button
                  onClick={() => {
                    setShowPaymentPushModal(false);
                    setShowCheckoutView(true);
                  }}
                  className="w-full py-4 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-600 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-rose-200 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 fill-white" />
                  {finalPriceINR === 0 ? "🚀 Activate Free Link Now (₹0)" : `🚀 Claim Discount & Pay ₹${finalPriceINR.toFixed(0)}`}
                </button>

                <button
                  onClick={() => {
                    setShowPaymentPushModal(false);
                    setViewState("landing");
                    setCurrentStep(0);
                    setShowExitPushToast(true);
                    setTimeout(() => setShowExitPushToast(false), 6000);
                  }}
                  className="w-full py-2.5 text-slate-400 hover:text-slate-600 font-bold text-xs transition"
                >
                  No thanks, I&apos;ll pass for now ➔
                </button>
              </div>

              <p className="text-[10px] text-slate-400">🔒 256-Bit SSL Encrypted Payment via Razorpay</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* 🔔 Cute Push Notification Toast (Populates AFTER clicking "Yes, exit") */}
    <AnimatePresence>
      {showExitPushToast && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[10000] w-full max-w-sm px-3"
        >
          <div className="bg-slate-900/95 backdrop-blur-xl border border-rose-500/30 text-white rounded-2xl p-4 shadow-2xl flex items-start gap-3.5 relative overflow-hidden">
            {/* Top gradient glow line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-pink-500 to-amber-400" />
            
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shrink-0 shadow-md shadow-rose-500/30 mt-0.5">
              <Bell className="w-4 h-4 text-white animate-bounce" />
            </div>

            <div className="flex-1 min-w-0 pr-2">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400 fill-amber-400" /> OurStory Special Offer
                </span>
                <span className="text-[10px] text-slate-400">now</span>
              </div>
              <p className="text-xs font-black text-white leading-snug">
                Aww, don&apos;t let {formValues["recipientName"] || "your special someone"} wait! 🥺🌸
              </p>
              <p className="text-[11px] text-slate-300 font-medium leading-relaxed mt-1">
                Your surprise is almost ready! Finish now &amp; use code <span className="text-amber-300 font-black bg-amber-400/20 px-1.5 py-0.5 rounded">LOVE2026</span> for extra discount! 💖
              </p>

              <button
                onClick={() => {
                  setShowExitPushToast(false);
                  setViewState("customize");
                }}
                className="mt-2.5 px-3 py-1.5 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-extrabold text-[11px] rounded-xl shadow-md shadow-rose-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Re-Open &amp; Finish Surprise</span> ✨
              </button>
            </div>

            <button
              onClick={() => setShowExitPushToast(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* 🌸 CUTE PAYMENT CANCELLED PUSH POPUP MODAL (Pushes user to retry payment without ugly text) */}
    <AnimatePresence>
      {showPaymentCancelledPushModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden relative border border-rose-100 text-center"
          >
            {/* Top gradient accent line */}
            <div className="h-1.5 bg-gradient-to-r from-rose-400 via-pink-500 to-amber-400" />

            <div className="p-6 space-y-4">
              {/* Cute heart illustration */}
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="w-16 h-16 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto shadow-inner text-3xl"
              >
                💖
              </motion.div>

              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900 leading-tight">
                  Aww, payment was paused! 🥺🌸
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Don&apos;t worry! Your special surprise for <span className="font-extrabold text-rose-600">{formValues["recipientName"] || "your special someone"}</span> is safely saved.
                </p>
              </div>

              {/* Coupon Badge */}
              <div className="bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-200 rounded-2xl p-3.5 space-y-1">
                <div className="inline-flex items-center gap-1 bg-amber-400 text-amber-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  🏷️ LOVE2026 Applied (50% OFF)
                </div>
                <p className="text-xs font-black text-rose-600 pt-0.5">
                  Unlock for only ₹{finalPriceINR.toFixed(0)} right now! ✨
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={() => {
                    setShowPaymentCancelledPushModal(false);
                    handlePayment();
                  }}
                  className="w-full py-3.5 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-600 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg shadow-rose-200 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 fill-white" />
                  🚀 Retry Payment &amp; Activate Link
                </button>

                <button
                  onClick={() => {
                    setShowPaymentCancelledPushModal(false);
                    setShowCheckoutView(false);
                    setViewState("customize");
                  }}
                  className="w-full py-2.5 text-slate-400 hover:text-slate-600 font-bold text-xs transition"
                >
                  Edit My Surprise ✏️
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}
