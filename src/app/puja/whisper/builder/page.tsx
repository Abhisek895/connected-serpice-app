"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Heart,
  ChevronRight,
  ChevronLeft,
  Check,
  Copy,
  Share2,
  ExternalLink,
  Edit3,
  Loader2,
  Eye,
  Zap,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Gift,
} from "lucide-react";
import { DEFAULT_FOOD_OPTIONS } from "@/lib/templates/durga-puja";
import { loadRazorpayScript } from "@/hooks/useRazorpay";
import SharodyaWhisperTemplate from "@/app/p/[slug]/templates/SharodyaWhisperTemplate";

// ─────────────────────────────────────────────────────────────────────────────

function WhisperBuilderContent() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState<number>(1);
  const [showPreview, setShowPreview] = useState(false);

  // Tracking
  const [refCode, setRefCode] = useState("");
  const [utmSource, setUtmSource] = useState("");
  const [utmCampaign, setUtmCampaign] = useState("");

  // ── Form State ──
  const [recipientName, setRecipientName] = useState("");
  const [creatorName, setCreatorName] = useState("");
  const [memoryMessage, setMemoryMessage] = useState(
    "Last Ashtami, you were laughing at something the dhaki played wrong. I remember thinking — I want to be standing next to you every time you laugh like that."
  );
  const [vibeHint, setVibeHint] = useState("I was thinking The Evening — but it's completely up to you.");
  const [creatorFavFood, setCreatorFavFood] = useState("phuchka");
  const [secretMessage, setSecretMessage] = useState(
    "I already know which phuchka stall I want to take you to. I've been saving it. 🧆 And I want the first photo we take together this Puja to be the one we both keep."
  );

  // ── Pricing & Coupon ──
  const [basePriceINR, setBasePriceINR] = useState(80);
  const [finalPriceINR, setFinalPriceINR] = useState(80);
  const [activeCoupons, setActiveCoupons] = useState<string[]>(["FREE100%"]);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [couponStatus, setCouponStatus] = useState<"idle" | "valid" | "invalid">("idle");
  const [couponMessage, setCouponMessage] = useState("");
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  // ── Payment ──
  const [buyerEmail, setBuyerEmail] = useState("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const isPaymentHandledRef = useRef(false);

  // ── Published ──
  const [publishedData, setPublishedData] = useState<{
    id: string;
    url: string;
    statusUrl: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // ── Init refs + tracking ──
  useEffect(() => {
    if (typeof window === "undefined") return;
    const urlRef = searchParams.get("ref");
    const storedRef = localStorage.getItem("ourstory_ref_code");
    const match = document.cookie.match(/(?:^|; )ourstory_ref_code=([^;]*)/);
    const cookieRef = match ? decodeURIComponent(match[1]) : "";
    const effectiveRef = (urlRef || storedRef || cookieRef || "").trim();
    if (urlRef?.trim()) {
      localStorage.setItem("ourstory_ref_code", urlRef.trim());
      document.cookie = `ourstory_ref_code=${urlRef.trim()}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
    }
    if (effectiveRef) setRefCode(effectiveRef);
    const src = searchParams.get("utm_source") || "";
    const cmp = searchParams.get("utm_campaign") || "";
    if (src) setUtmSource(src);
    if (cmp) setUtmCampaign(cmp);
  }, [searchParams]);

  useEffect(() => {
    fetch("/api/theme/pricing?demoId=puja-whisper")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && typeof data.priceINR === "number") {
          setBasePriceINR(data.priceINR);
          setFinalPriceINR(data.priceINR);
          if (Array.isArray(data.activeCoupons) && data.activeCoupons.length > 0) {
            const codes = data.activeCoupons.map((c: any) => c.code);
            if (!codes.includes("FREE100%")) codes.unshift("FREE100%");
            setActiveCoupons(codes);
          }
        }
      })
      .catch(() => {});
  }, []);

  // ── Coupon ──
  const handleApplyCoupon = async (codeOverride?: string) => {
    const code = (codeOverride || couponInput).trim().toUpperCase();
    if (!code) return;
    setIsValidatingCoupon(true);
    setPaymentError("");
    try {
      const res = await fetch("/api/coupon/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, demoId: "puja-whisper" }),
      });
      const data = await res.json();
      if (data.valid) {
        setCouponStatus("valid");
        setAppliedCoupon(code);
        setCouponInput(code);
        setCouponMessage(data.message || `Coupon "${code}" applied!`);
        if (typeof data.finalPrice === "number") setFinalPriceINR(data.finalPrice / 100);
        else if (data.discountValue === 100) setFinalPriceINR(0);
      } else {
        setCouponStatus("invalid");
        setAppliedCoupon("");
        setFinalPriceINR(basePriceINR);
        setCouponMessage(data.message || "Invalid or expired coupon");
      }
    } catch {
      setCouponStatus("invalid");
      setCouponMessage("Failed to validate coupon");
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponInput("");
    setAppliedCoupon("");
    setCouponStatus("idle");
    setCouponMessage("");
    setFinalPriceINR(basePriceINR);
  };

  const buildPayload = () => ({
    demoId: "puja-whisper",
    recipientName: recipientName.trim(),
    creatorName: creatorName.trim(),
    memoryMessage: memoryMessage.trim(),
    vibeHint: vibeHint.trim(),
    creatorFavFood,
    secretMessage: secretMessage.trim(),
    foodOptions: DEFAULT_FOOD_OPTIONS.map((f) => f.id),
    audioUrl:
      "https://k4q9rpuc4cgssyjq.public.blob.vercel-storage.com/audio/mayabono_biharini_horini.mp3",
  });

  const finishEventCreation = async (
    orderId: string,
    paymentId: string,
    signature: string,
    payload: any
  ) => {
    if (isPaymentHandledRef.current) return;
    isPaymentHandledRef.current = true;
    try {
      const res = await fetch("/api/guest/create-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          paymentId,
          razorpaySignature: signature,
          customData: payload,
        }),
      });
      const data = await res.json();
      if (data.success && data.event) {
        const envUrl = process.env.NEXT_PUBLIC_APP_URL || "";
        const base = envUrl || window.location.origin;
        const slug = data.event.slug || data.event.id;
        setPublishedData({
          id: slug,
          url: `${base}/p/${slug}`,
          statusUrl: `${base}/status/${slug}`,
        });
        setStep(6);
      } else {
        throw new Error(data.message || "Event creation failed");
      }
    } catch (e: any) {
      setPaymentError(e.message || "Something went wrong. Please try again.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handlePayment = async () => {
    if (!recipientName.trim() || !creatorName.trim()) {
      setStep(1);
      alert("Please provide both Recipient and Creator names");
      return;
    }
    setIsProcessingPayment(true);
    setPaymentError("");
    isPaymentHandledRef.current = false;
    const payload = buildPayload();
    try {
      const res = await fetch("/api/guest/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          demoId: "puja-whisper",
          couponCode: appliedCoupon || undefined,
          utmSource: utmSource || undefined,
          utmCampaign: utmCampaign || undefined,
          referredByCode: refCode || undefined,
          buyerEmail: buyerEmail.trim() || undefined,
          customData: payload,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed to create order");

      if (data.amount === 0) {
        await finishEventCreation(data.orderId, "", "", payload);
        return;
      }
      if (data.isMock) {
        setTimeout(async () => {
          await finishEventCreation(data.orderId, `mock_pay_${Date.now()}`, "mock_signature", payload);
        }, 1200);
        return;
      }

      // Razorpay
      const loaded = await loadRazorpayScript();
      if (!loaded) { setPaymentError("Payment gateway failed to load."); setIsProcessingPayment(false); return; }
      const rzp = new (window as any).Razorpay({
        key: data.razorpayKeyId,
        amount: data.amount,
        currency: data.currency || "INR",
        name: "OurStory",
        description: "Sharodiya Whisper — Puja Invitation",
        order_id: data.razorpayOrderId,
        prefill: { email: buyerEmail.trim() || undefined },
        theme: { color: "#E8791A" },
        handler: async (resp: any) => {
          await finishEventCreation(data.orderId, resp.razorpay_payment_id, resp.razorpay_signature, payload);
        },
        modal: { ondismiss: () => { if (!isPaymentHandledRef.current) { setIsProcessingPayment(false); setPaymentError("Payment was cancelled."); } } },
      });
      rzp.open();
    } catch (e: any) {
      setPaymentError(e.message || "Something went wrong");
      setIsProcessingPayment(false);
    }
  };

  const handleCopyLink = () => {
    if (!publishedData?.url) return;
    navigator.clipboard.writeText(publishedData.url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const TOTAL_STEPS = 5;

  // ── Shared UI ──
  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-white/70 border border-[#E8791A]/20 text-sm text-[#2C1A0E] placeholder-[#5C3D2E]/40 focus:outline-none focus:border-[#E8791A]/60 transition-colors";
  const labelClass = "block text-xs font-semibold uppercase tracking-widest text-[#E8791A] mb-1.5";
  const btnNext =
    "w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#E8791A] to-[#C05B4A] text-white font-semibold text-sm tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-[#E8791A]/25 hover:shadow-[#E8791A]/40 transition-all hover:scale-[1.02] active:scale-[0.98]";
  const btnBack =
    "py-3 px-4 rounded-xl border border-[#2C1A0E]/15 text-xs text-[#5C3D2E]/70 hover:text-[#5C3D2E] transition-colors";

  const previewData = {
    demoId: "puja-whisper",
    recipientName: recipientName || "Riya",
    creatorName: creatorName || "Ayan",
    memoryMessage,
    vibeHint,
    creatorFavFood,
    secretMessage,
  };

  if (showPreview) {
    return (
      <div className="fixed inset-0 z-50">
        <button
          onClick={() => setShowPreview(false)}
          className="absolute top-4 left-4 z-50 px-3 py-2 rounded-full bg-black/60 text-white text-xs font-medium backdrop-blur-sm"
        >
          ← Close preview
        </button>
        <SharodyaWhisperTemplate
          slug="preview"
          recipientName={previewData.recipientName}
          loveMessage={previewData.memoryMessage}
          customData={previewData}
        />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen text-[#2C1A0E]"
      style={{ background: "linear-gradient(155deg,#FFF1DC 0%,#FFE8C8 50%,#FFD9AD 100%)" }}
    >
      {/* Header */}
      <header className="max-w-lg mx-auto px-4 py-5 flex items-center justify-between">
        <Link href="/puja/whisper" className="text-sm font-semibold text-[#5C3D2E] hover:text-[#E8791A] transition-colors">
          ← Sharodiya Whisper
        </Link>
        <button
          onClick={() => setShowPreview(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white/60 border border-[#E8791A]/25 text-[#E8791A] hover:bg-white/80 transition-all"
        >
          <Eye className="w-3.5 h-3.5" />
          Preview
        </button>
      </header>

      <main className="max-w-lg mx-auto px-4 pb-16 space-y-6">
        {/* Page heading */}
        <div className="text-center space-y-1">
          <h1
            className="text-2xl sm:text-3xl font-bold text-[#2C1A0E]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Create a Sharodiya Whisper
          </h1>
          <p className="text-sm text-[#5C3D2E]/70 italic" style={{ fontFamily: "Lora, serif" }}>
            A letter, not a form. A memory, not a card.
          </p>
        </div>

        {/* Progress bar */}
        {step < 6 && (
          <div className="flex items-center gap-1.5 justify-center">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i < step ? "bg-[#E8791A] w-8" : i === step - 1 ? "bg-[#E8791A] w-6" : "bg-[#E8791A]/25 w-4"
                }`}
              />
            ))}
          </div>
        )}

        {/* ── STEP 1: Names ── */}
        {step === 1 && (
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-lg border border-[#F4B942]/30 p-6 space-y-5">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-[#E8791A] font-semibold">Step 1 of {TOTAL_STEPS}</span>
              <h2 className="text-xl font-bold text-[#2C1A0E] mt-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                The two of you
              </h2>
              <p className="text-xs text-[#5C3D2E]/60 mt-0.5">Who is sending this? Who is receiving it?</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Her name (recipient) *</label>
                <input
                  id="recipient-name"
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="e.g. Riya, Priya, Ananya..."
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Your name (creator) *</label>
                <input
                  id="creator-name"
                  type="text"
                  value={creatorName}
                  onChange={(e) => setCreatorName(e.target.value)}
                  placeholder="e.g. Ayan, Rahul, Dev..."
                  className={inputClass}
                />
              </div>
            </div>
            <button
              onClick={() => {
                if (!recipientName.trim() || !creatorName.trim()) { alert("Both names are required"); return; }
                setStep(2);
              }}
              className={btnNext}
            >
              <span>Continue</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── STEP 2: Memory Message ── */}
        {step === 2 && (
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-lg border border-[#F4B942]/30 p-6 space-y-5">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-[#E8791A] font-semibold">Step 2 of {TOTAL_STEPS}</span>
              <h2 className="text-xl font-bold text-[#2C1A0E] mt-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                A memory only you two share
              </h2>
              <p className="text-xs text-[#5C3D2E]/70 mt-1 leading-relaxed" style={{ fontFamily: "Lora, serif" }}>
                This appears in her letter before you ask the question. It&apos;s the personal memory you share <em>first</em> — before asking anything. Make it real and specific.
              </p>
            </div>
            <div>
              <label className={labelClass}>Your memory paragraph</label>
              <textarea
                id="memory-message"
                value={memoryMessage}
                onChange={(e) => setMemoryMessage(e.target.value)}
                rows={4}
                maxLength={280}
                placeholder="e.g. Last Ashtami, you were laughing at something the dhaki played wrong..."
                className={`${inputClass} resize-none`}
              />
              <p className="text-right text-[10px] text-[#5C3D2E]/50 mt-1">
                {memoryMessage.length}/280
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className={btnBack}><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={() => setStep(3)} className={`${btnNext} flex-1`}>
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Vibe Hint + Creator Fav Food ── */}
        {step === 3 && (
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-lg border border-[#F4B942]/30 p-6 space-y-5">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-[#E8791A] font-semibold">Step 3 of {TOTAL_STEPS}</span>
              <h2 className="text-xl font-bold text-[#2C1A0E] mt-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                Your little hints
              </h2>
              <p className="text-xs text-[#5C3D2E]/70 mt-1 leading-relaxed">
                These make the experience feel like a real conversation — not a template.
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Your vibe preference (optional)</label>
                <input
                  id="vibe-hint"
                  type="text"
                  value={vibeHint}
                  onChange={(e) => setVibeHint(e.target.value)}
                  placeholder="e.g. I was thinking The Evening — but it's up to you."
                  maxLength={120}
                  className={inputClass}
                />
                <p className="text-[10px] text-[#5C3D2E]/50 mt-1">Shown below the vibe choices. Makes it feel personal.</p>
              </div>
              <div>
                <label className={labelClass}>Your favorite food 💛</label>
                <select
                  id="creator-fav-food"
                  value={creatorFavFood}
                  onChange={(e) => setCreatorFavFood(e.target.value)}
                  className={inputClass}
                >
                  {DEFAULT_FOOD_OPTIONS.map((f) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
                <p className="text-[10px] text-[#5C3D2E]/50 mt-1">
                  This food card gets a &ldquo;{creatorName || "your"}&apos;s fav 💛&rdquo; badge.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className={btnBack}><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={() => setStep(4)} className={`${btnNext} flex-1`}>
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4: Secret Message ── */}
        {step === 4 && (
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-lg border border-[#F4B942]/30 p-6 space-y-5">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-[#E8791A] font-semibold">Step 4 of {TOTAL_STEPS}</span>
              <h2 className="text-xl font-bold text-[#2C1A0E] mt-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                Your secret 🤫
              </h2>
              <p className="text-xs text-[#5C3D2E]/70 mt-1 leading-relaxed" style={{ fontFamily: "Lora, serif" }}>
                This is the moment she&apos;ll remember most. A tiny preview of a plan you have. A food stall. A spot for a photo. A song. Make it <em>specific</em> — that&apos;s what makes it magical.
              </p>
            </div>
            <div>
              <label className={labelClass}>The secret</label>
              <textarea
                id="secret-message"
                value={secretMessage}
                onChange={(e) => setSecretMessage(e.target.value)}
                rows={4}
                maxLength={220}
                placeholder="e.g. I already know which phuchka stall I want to take you to..."
                className={`${inputClass} resize-none`}
              />
              <p className="text-right text-[10px] text-[#5C3D2E]/50 mt-1">
                {secretMessage.length}/220
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(3)} className={btnBack}><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={() => setStep(5)} className={`${btnNext} flex-1`}>
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 5: Review + Payment ── */}
        {step === 5 && (
          <div className="space-y-4">
            {/* Summary card */}
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-lg border border-[#F4B942]/30 p-6 space-y-4">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#E8791A] font-semibold">Step 5 of {TOTAL_STEPS}</span>
                <h2 className="text-xl font-bold text-[#2C1A0E] mt-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Review & send
                </h2>
              </div>

              <div className="space-y-2.5 text-xs">
                {[
                  { label: "For", value: recipientName },
                  { label: "From", value: creatorName },
                  { label: "Memory", value: memoryMessage.slice(0, 70) + (memoryMessage.length > 70 ? "…" : "") },
                  { label: "Secret", value: secretMessage.slice(0, 70) + (secretMessage.length > 70 ? "…" : "") },
                  { label: "Fav food", value: DEFAULT_FOOD_OPTIONS.find((f) => f.id === creatorFavFood)?.name || creatorFavFood },
                ].map(({ label, value }) => (
                  <div key={label} className="flex gap-2">
                    <span className="text-[#E8791A] font-semibold w-16 shrink-0">{label}:</span>
                    <span className="text-[#5C3D2E]">{value}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowPreview(true)}
                className="w-full py-2.5 px-4 rounded-xl border border-[#E8791A]/30 text-xs text-[#E8791A] font-medium flex items-center justify-center gap-1.5 hover:bg-[#E8791A]/5 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                Preview full experience
              </button>
            </div>

            {/* Coupon */}
            <div className="bg-white/60 rounded-2xl border border-[#F4B942]/30 p-4 space-y-3">
              <label className="text-xs font-semibold text-[#5C3D2E] flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#E8791A]" />
                Coupon code
              </label>
              {couponStatus !== "valid" ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponStatus("idle"); }}
                    placeholder="Enter code"
                    className={`${inputClass} flex-1 text-xs`}
                  />
                  <button
                    onClick={() => handleApplyCoupon()}
                    disabled={isValidatingCoupon}
                    className="px-4 py-2.5 rounded-xl bg-[#E8791A] text-white text-xs font-semibold disabled:opacity-60 transition-all"
                  >
                    {isValidatingCoupon ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Apply"}
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {couponMessage}
                  </div>
                  <button onClick={handleRemoveCoupon} className="text-[10px] text-red-500 underline">Remove</button>
                </div>
              )}
              {couponStatus === "invalid" && (
                <p className="text-[11px] text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />{couponMessage}
                </p>
              )}
              <div className="flex flex-wrap gap-1.5">
                {activeCoupons.slice(0, 3).map((c) => (
                  <button
                    key={c}
                    onClick={() => handleApplyCoupon(c)}
                    className="text-[10px] px-2 py-1 rounded-full border border-[#E8791A]/30 text-[#E8791A] hover:bg-[#E8791A]/10 transition-colors"
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Price + Email + Pay */}
            <div className="bg-white/70 rounded-2xl border border-[#F4B942]/30 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#5C3D2E]">Total</span>
                <div className="text-right">
                  {finalPriceINR < basePriceINR && (
                    <span className="text-xs line-through text-[#5C3D2E]/40 mr-2">₹{basePriceINR}</span>
                  )}
                  <span className="text-xl font-bold text-[#E8791A]">
                    {finalPriceINR === 0 ? "FREE" : `₹${finalPriceINR}`}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-xs text-[#5C3D2E]/70 block mb-1.5">Your email (for receipt)</label>
                <input
                  type="email"
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                  placeholder="you@email.com"
                  className={`${inputClass} text-xs`}
                />
              </div>
              {paymentError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 flex items-start gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  {paymentError}
                </div>
              )}
              <button
                onClick={handlePayment}
                disabled={isProcessingPayment}
                className={`${btnNext} ${isProcessingPayment ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                {isProcessingPayment ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Heart className="w-4 h-4 fill-white text-white" />
                    <span>{finalPriceINR === 0 ? "Create Free Letter" : `Pay ₹${finalPriceINR} & Create`}</span>
                  </>
                )}
              </button>
              <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#5C3D2E]/50">
                <ShieldCheck className="w-3 h-3" />
                Secure payment • Link never expires
              </div>
            </div>

            <div className="flex justify-center">
              <button onClick={() => setStep(4)} className={btnBack}>← Back</button>
            </div>
          </div>
        )}

        {/* ── STEP 6: Published ── */}
        {step === 6 && publishedData && (
          <div className="space-y-4">
            <div
              className="p-7 rounded-3xl text-center space-y-4 border border-[#F4B942]/50 shadow-xl"
              style={{ background: "linear-gradient(135deg,#FFF8EE,#FFEFD0)" }}
            >
              <div className="w-14 h-14 rounded-full bg-[#E8791A]/15 border-2 border-[#E8791A]/40 mx-auto flex items-center justify-center">
                <Heart className="w-7 h-7 fill-rose-500 text-rose-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#2C1A0E]" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Her letter is ready 🌺
                </h2>
                <p className="text-sm text-[#5C3D2E] mt-1 italic" style={{ fontFamily: "Lora, serif" }}>
                  Share this link with {recipientName}
                </p>
              </div>

              <div className="bg-white/80 rounded-2xl p-3 border border-[#E8791A]/20 font-mono text-xs text-[#2C1A0E] break-all">
                {publishedData.url}
              </div>

              <div className="flex flex-col gap-2.5">
                <button
                  onClick={handleCopyLink}
                  className="w-full py-3 px-5 rounded-xl bg-[#E8791A] text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#D06A10] transition-all"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied!" : "Copy link"}
                </button>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`${recipientName}, someone made something for you 🌺\n\n${publishedData.url}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-5 rounded-xl bg-[#25D366] text-white text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all"
                >
                  <Share2 className="w-4 h-4" />
                  Share via WhatsApp
                </a>
                <a
                  href={publishedData.statusUrl}
                  target="_blank"
                  className="w-full py-3 px-5 rounded-xl border border-[#2C1A0E]/15 text-sm text-[#5C3D2E] font-medium flex items-center justify-center gap-2 hover:bg-white/40 transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  Check her response
                </a>
              </div>
            </div>

            <div className="text-center">
              <Link
                href="/puja/whisper"
                className="text-xs text-[#5C3D2E]/60 hover:text-[#E8791A] transition-colors underline underline-offset-2"
              >
                ← Back to Sharodiya Whisper
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function SharodyaWhisperBuilderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(155deg,#FFF1DC,#FFD9AD)" }}>
        <div className="w-8 h-8 border-2 border-[#E8791A]/30 border-t-[#E8791A] rounded-full animate-spin" />
      </div>
    }>
      <WhisperBuilderContent />
    </Suspense>
  );
}
