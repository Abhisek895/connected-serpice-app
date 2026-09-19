"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
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
  MapPin,
  Calendar,
  Clock,
  Edit3,
  Loader2,
  Eye,
  Tag,
  Zap,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Gift,
} from "lucide-react";
import {
  DEFAULT_PUJA_VIBE_OPTIONS,
  DEFAULT_ACTIVITIES,
  DEFAULT_FOOD_OPTIONS,
} from "@/lib/templates/durga-puja";
import { loadRazorpayScript } from "@/hooks/useRazorpay";

function DurgaPujaBuilderContent() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState<number>(1);

  // Referral and UTM tracking
  const [refCode, setRefCode] = useState<string>("");
  const [utmSource, setUtmSource] = useState<string>("");
  const [utmCampaign, setUtmCampaign] = useState<string>("");

  // Form State
  const [recipientName, setRecipientName] = useState<string>("");
  const [creatorName, setCreatorName] = useState<string>("");
  const [nickname, setNickname] = useState<string>("");

  const [vibe, setVibe] = useState<string>("Romantic");
  const [personalMessage, setPersonalMessage] = useState<string>(
    "Puja has always been special to me, but this year I couldn't imagine walking through the pandals with anyone else."
  );

  const [pujaVibe, setPujaVibe] = useState<string>("evening");
  const [activities, setActivities] = useState<string[]>([
    "Pandal",
    "Food",
    "Walk",
    "Adda",
  ]);
  const [customActivity, setCustomActivity] = useState<string>("");

  const [foods, setFoods] = useState<string[]>([
    "Phuchka",
    "Momos",
    "Roll",
    "Biryani",
    "Something sweet",
    "You choose",
  ]);
  const [customFood, setCustomFood] = useState<string>("");

  const [venueName, setVenueName] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [googleMapsUrl, setGoogleMapsUrl] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("");

  // Pricing & Coupon State
  const [basePriceINR, setBasePriceINR] = useState<number>(80);
  const [finalPriceINR, setFinalPriceINR] = useState<number>(80);
  const [activeCoupons, setActiveCoupons] = useState<string[]>(["FREE100%"]);
  const [couponInput, setCouponInput] = useState<string>("");
  const [appliedCoupon, setAppliedCoupon] = useState<string>("");
  const [couponStatus, setCouponStatus] = useState<"idle" | "valid" | "invalid">("idle");
  const [couponMessage, setCouponMessage] = useState<string>("");
  const [isValidatingCoupon, setIsValidatingCoupon] = useState<boolean>(false);

  // Buyer Email & Payment State
  const [buyerEmail, setBuyerEmail] = useState<string>("");
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [paymentError, setPaymentError] = useState<string>("");
  const isPaymentHandledRef = useRef<boolean>(false);

  // Publish / Share State
  const [publishedData, setPublishedData] = useState<{
    id: string;
    url: string;
    statusUrl: string;
  } | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [customWhatsAppMsg, setCustomWhatsAppMsg] = useState<string>("");

  // Initialize Referral & Pricing
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlRef = searchParams.get("ref");
      const storedRef = localStorage.getItem("ourstory_ref_code");
      const match = document.cookie.match(/(?:^|; )ourstory_ref_code=([^;]*)/);
      const cookieRef = match ? decodeURIComponent(match[1]) : "";
      const effectiveRef = (urlRef || storedRef || cookieRef || "").trim();

      if (urlRef && urlRef.trim()) {
        const clean = urlRef.trim();
        localStorage.setItem("ourstory_ref_code", clean);
        document.cookie = `ourstory_ref_code=${clean}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
      }
      if (effectiveRef) {
        setRefCode(effectiveRef);
      }

      const src = searchParams.get("utm_source") || "";
      const cmp = searchParams.get("utm_campaign") || "";
      if (src) setUtmSource(src);
      if (cmp) setUtmCampaign(cmp);
    }
  }, [searchParams]);

  useEffect(() => {
    fetch("/api/theme/pricing?demoId=durga-puja")
      .then((res) => res.json())
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

  const handleNext = () => {
    if (step === 1 && (!recipientName.trim() || !creatorName.trim())) {
      alert("Please provide both Recipient and Creator names");
      return;
    }
    setStep((prev) => Math.min(prev + 1, 8));
  };

  const handlePrev = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const toggleActivity = (act: string) => {
    setActivities((prev) =>
      prev.includes(act) ? prev.filter((a) => a !== act) : [...prev, act]
    );
  };

  const addCustomActivity = () => {
    if (customActivity.trim() && !activities.includes(customActivity.trim())) {
      setActivities((prev) => [...prev, customActivity.trim()]);
      setCustomActivity("");
    }
  };

  const toggleFood = (fName: string) => {
    setFoods((prev) =>
      prev.includes(fName)
        ? prev.length > 1
          ? prev.filter((item) => item !== fName)
          : prev
        : [...prev, fName]
    );
  };

  const addCustomFood = () => {
    if (customFood.trim() && !foods.includes(customFood.trim())) {
      setFoods((prev) => [...prev, customFood.trim()]);
      setCustomFood("");
    }
  };

  const handleApplyCoupon = async (codeOverride?: string) => {
    const code = (codeOverride || couponInput).trim().toUpperCase();
    if (!code) return;
    setIsValidatingCoupon(true);
    setPaymentError("");
    try {
      const res = await fetch("/api/coupon/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, demoId: "durga-puja" }),
      });
      const data = await res.json();
      if (data.valid) {
        setCouponStatus("valid");
        setAppliedCoupon(code);
        setCouponInput(code);
        setCouponMessage(data.message || `Coupon "${code}" applied successfully!`);
        if (typeof data.finalPrice === "number") {
          setFinalPriceINR(data.finalPrice / 100);
        } else if (
          data.discountValue === 100 &&
          (data.discountType === "PERCENT" || data.discountType === "PERCENTAGE")
        ) {
          setFinalPriceINR(0);
        }
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

  const handlePayment = async () => {
    if (!recipientName.trim() || !creatorName.trim()) {
      setStep(1);
      alert("Please provide both Recipient and Creator names");
      return;
    }

    setIsProcessingPayment(true);
    setPaymentError("");
    isPaymentHandledRef.current = false;

    const payload = {
      demoId: "durga-puja",
      recipientName: recipientName.trim(),
      creatorName: creatorName.trim(),
      nickname: nickname.trim(),
      vibe,
      personalMessage: personalMessage.trim(),
      pujaVibe,
      activities,
      foodOptions: foods,
      venueName: venueName.trim(),
      address: address.trim(),
      googleMapsUrl: googleMapsUrl.trim(),
      date: date.trim(),
      time: time.trim(),
      audioUrl:
        "https://k4q9rpuc4cgssyjq.public.blob.vercel-storage.com/audio/mayabono_biharini_horini.mp3",
    };

    try {
      const res = await fetch("/api/guest/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          demoId: "durga-puja",
          couponCode: appliedCoupon || undefined,
          utmSource: utmSource || undefined,
          utmCampaign: utmCampaign || undefined,
          referredByCode: refCode || undefined,
          buyerEmail: buyerEmail.trim() || undefined,
          customData: payload,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || "Failed to create order");
      }

      // Handle free or 100% coupon orders
      if (data.amount === 0) {
        await finishEventCreation(data.orderId, "", "", payload);
        return;
      }

      // Handle mock payments
      if (data.isMock) {
        setTimeout(async () => {
          await finishEventCreation(
            data.orderId,
            `mock_pay_${Date.now()}`,
            "mock_signature",
            payload
          );
        }, 1200);
        return;
      }

      // Real Razorpay gateway
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error("Unable to load payment gateway. Please check your network connection.");
      }

      const options = {
        key: data.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency || "INR",
        name: "OurStory • Durga Puja 🌺",
        description: `Puja invitation for ${recipientName}`,
        order_id: data.orderId,
        prefill: {
          email: buyerEmail.trim() || undefined,
        },
        handler: async (response: any) => {
          isPaymentHandledRef.current = true;
          await finishEventCreation(
            response.razorpay_order_id,
            response.razorpay_payment_id,
            response.razorpay_signature,
            payload
          );
        },
        modal: {
          ondismiss: async () => {
            if (isPaymentHandledRef.current) return;
            try {
              const statRes = await fetch(
                `/api/payment/status?orderId=${encodeURIComponent(data.orderId)}`
              );
              const stat = await statRes.json();
              if (stat.fulfilled && stat.shareUrl) {
                isPaymentHandledRef.current = true;
                const slug = stat.shareUrl.replace(/^\/p\//, "");
                setPublishedData({
                  id: slug,
                  url: `${window.location.origin}/i/${slug}`,
                  statusUrl: `${window.location.origin}/i/${slug}/status`,
                });
                setCustomWhatsAppMsg(
                  `I made something for you. 🌺\n\nOpen this when you have a minute ❤️\n\n${window.location.origin}/i/${slug}`
                );
                setIsProcessingPayment(false);
                return;
              }
            } catch {}
            setIsProcessingPayment(false);
          },
        },
        theme: { color: "#631726" },
      };

      new (window as any).Razorpay(options).open();
    } catch (err: any) {
      setPaymentError(err.message || "Payment initiation failed. Please try again.");
      setIsProcessingPayment(false);
    }
  };

  const finishEventCreation = async (
    orderId: string,
    paymentId: string,
    sig: string,
    customDataObj: Record<string, any>
  ) => {
    try {
      const res = await fetch("/api/guest/create-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          demoId: "durga-puja",
          customData: customDataObj,
          razorpayOrderId: orderId,
          razorpayPaymentId: paymentId,
          razorpaySignature: sig,
          utmSource: utmSource || undefined,
          utmCampaign: utmCampaign || undefined,
          buyerEmail: buyerEmail.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!data.success || !data.slug) {
        throw new Error(data.message || "Failed to finalize invitation");
      }

      const slug = data.slug;
      if (typeof document !== "undefined") {
        document.cookie = `ourstory_guest_claim_slug=${slug}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
        localStorage.setItem("ourstory_guest_claim_slug", slug);
      }

      const shareLink = `${window.location.origin}/i/${slug}`;
      setPublishedData({
        id: slug,
        url: shareLink,
        statusUrl: `${window.location.origin}/i/${slug}/status`,
      });

      setCustomWhatsAppMsg(
        `I made something for you. 🌺\n\nOpen this when you have a minute ❤️\n\n${shareLink}`
      );
    } catch (err: any) {
      setPaymentError(err.message || "Could not publish invitation. Please try again.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleCopyLink = () => {
    if (publishedData?.url) {
      navigator.clipboard.writeText(publishedData.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleWhatsAppSend = () => {
    if (publishedData?.url) {
      const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(
        customWhatsAppMsg
      )}`;
      window.open(url, "_blank");
    }
  };

  return (
    <div className="min-h-screen bg-[#161413] text-[#FDFBF7] font-sans flex flex-col">
      {/* Top Navigation */}
      <header className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-4 flex items-center justify-between border-b border-[#FDFBF7]/10">
        <Link href="/puja" className="font-editorial text-xl font-bold tracking-wide">
          OurStory <span className="text-[#D4AF37] text-xs font-normal">| Builder</span>
        </Link>
        {!publishedData && (
          <span className="text-xs text-[#D4AF37] font-medium tracking-wider">
            Step {step} of 8
          </span>
        )}
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 max-w-lg mx-auto w-full">
        {publishedData ? (
          /* =============================================================== */
          /* POST PUBLISH / SHARE EXPERIENCE SCREEN                           */
          /* =============================================================== */
          <div className="w-full bg-[#211E1C] rounded-3xl p-6 sm:p-8 border border-[#D4AF37]/40 shadow-2xl space-y-6 text-center">
            <div className="w-16 h-16 rounded-full bg-[#631726]/40 border border-[#D4AF37] mx-auto flex items-center justify-center text-[#D4AF37] shadow-lg">
              <span className="text-3xl">🌺</span>
            </div>

            <div className="space-y-2">
              <h2 className="font-editorial text-3xl font-bold text-[#FDFBF7]">
                Your invitation is ready 🌺
              </h2>
              <p className="text-xs text-[#FDFBF7]/70 font-editorial text-base sm:text-lg">
                Created for <strong className="text-[#D4AF37]">{recipientName}</strong>
              </p>
            </div>

            {/* Generated Short URL */}
            <div className="p-3.5 rounded-2xl bg-[#161413] border border-[#D4AF37]/30 flex items-center justify-between gap-2">
              <span className="text-xs text-[#FDFBF7] font-mono truncate">
                {publishedData.url}
              </span>
              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 rounded-xl bg-[#631726] hover:bg-[#7D1D31] text-xs font-semibold text-[#FDFBF7] flex items-center gap-1 transition-all shrink-0 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>

            {/* WhatsApp Sharing Card */}
            <div className="p-4 rounded-2xl bg-[#282421] border border-[#FDFBF7]/10 text-left space-y-2">
              <label className="text-[11px] font-semibold text-[#D4AF37] uppercase tracking-wider block">
                WhatsApp Message Preview (Editable)
              </label>
              <textarea
                rows={3}
                value={customWhatsAppMsg}
                onChange={(e) => setCustomWhatsAppMsg(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#161413] border border-[#FDFBF7]/15 text-xs text-[#FDFBF7] focus:outline-none focus:border-[#D4AF37]"
              />
              <button
                onClick={handleWhatsAppSend}
                className="w-full py-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-[#161413] font-bold text-xs tracking-wider flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>Share on WhatsApp</span>
              </button>
            </div>

            {/* Actions: Preview & Dashboard */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Link
                href={publishedData.url}
                target="_blank"
                className="py-2.5 px-4 rounded-xl bg-[#2E2926] hover:bg-[#3B3430] border border-[#FDFBF7]/20 text-xs text-[#FDFBF7] font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                <Eye className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Open Preview</span>
              </Link>
              <Link
                href={publishedData.statusUrl}
                className="py-2.5 px-4 rounded-xl bg-[#631726] hover:bg-[#7D1D31] text-xs text-[#FDFBF7] font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>View Dashboard</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          /* =============================================================== */
          /* 8-STEP BUILDER FLOW                                              */
          /* =============================================================== */
          <div className="w-full bg-[#211E1C] rounded-3xl p-6 sm:p-8 border border-[#D4AF37]/30 shadow-2xl flex flex-col space-y-6">
            {/* STEP 1: Who is this for? */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-semibold">
                    Step 1 • Names
                  </span>
                  <h2 className="font-editorial text-2xl font-bold text-[#FDFBF7]">
                    Who is this for?
                  </h2>
                  <p className="text-xs text-[#FDFBF7]/60">
                    Tell us who this invitation is being made for.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="text-xs text-[#FDFBF7]/80 font-medium block mb-1">
                      Recipient name *
                    </label>
                    <input
                      type="text"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="e.g. Riya"
                      className="w-full px-4 py-3 rounded-xl bg-[#161413] border border-[#FDFBF7]/15 text-sm text-[#FDFBF7] focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-[#FDFBF7]/80 font-medium block mb-1">
                      Your name (Creator) *
                    </label>
                    <input
                      type="text"
                      value={creatorName}
                      onChange={(e) => setCreatorName(e.target.value)}
                      placeholder="e.g. Ayan"
                      className="w-full px-4 py-3 rounded-xl bg-[#161413] border border-[#FDFBF7]/15 text-sm text-[#FDFBF7] focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-[#FDFBF7]/80 font-medium block mb-1">
                      Optional nickname
                    </label>
                    <input
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      placeholder="e.g. Cutie / Mishti"
                      className="w-full px-4 py-3 rounded-xl bg-[#161413] border border-[#FDFBF7]/15 text-sm text-[#FDFBF7] focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: What's the vibe? */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-semibold">
                    Step 2 • The Vibe
                  </span>
                  <h2 className="font-editorial text-2xl font-bold text-[#FDFBF7]">
                    What&apos;s the vibe?
                  </h2>
                  <p className="text-xs text-[#FDFBF7]/60">Select one general mood</p>
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-2">
                  {[
                    { id: "Romantic", icon: "❤️", desc: "Warm & intimate" },
                    { id: "Cute", icon: "🌸", desc: "Sweet & joyful" },
                    { id: "Elegant", icon: "✨", desc: "Sophisticated" },
                    { id: "Playful", icon: "😌", desc: "Light & fun" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setVibe(item.id)}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        vibe === item.id
                          ? "bg-[#631726]/40 border-[#D4AF37] ring-1 ring-[#D4AF37]"
                          : "bg-[#161413] border-[#FDFBF7]/15 hover:border-[#D4AF37]/30"
                      }`}
                    >
                      <span className="text-2xl block mb-1">{item.icon}</span>
                      <h4 className="text-sm font-semibold text-[#FDFBF7]">{item.id}</h4>
                      <p className="text-[10px] text-[#FDFBF7]/60">{item.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 3: Personal message */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-semibold">
                    Step 3 • Message
                  </span>
                  <h2 className="font-editorial text-2xl font-bold text-[#FDFBF7]">
                    Personal message
                  </h2>
                  <p className="text-xs text-[#FDFBF7]/60">
                    Write something only they would understand...
                  </p>
                </div>

                <textarea
                  rows={5}
                  value={personalMessage}
                  onChange={(e) => setPersonalMessage(e.target.value)}
                  placeholder="Write something only they would understand..."
                  className="w-full p-4 rounded-xl bg-[#161413] border border-[#FDFBF7]/15 text-xs sm:text-sm text-[#FDFBF7] focus:outline-none focus:border-[#D4AF37] leading-relaxed"
                />

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[
                    "Puja has always been special to me, but this year I couldn't imagine celebrating it with anyone else.",
                    "I've been thinking about asking you this for a while... Let's wander under the lights together.",
                  ].map((suggestion, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPersonalMessage(suggestion)}
                      className="text-[10px] px-2.5 py-1 rounded-full bg-[#161413] border border-[#FDFBF7]/15 hover:border-[#D4AF37] text-[#FDFBF7]/70 hover:text-[#FDFBF7] text-left truncate max-w-full cursor-pointer"
                    >
                      &ldquo;{suggestion.slice(0, 45)}...&rdquo;
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 4: Puja experience */}
            {step === 4 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-semibold">
                    Step 4 • The Experience
                  </span>
                  <h2 className="font-editorial text-2xl font-bold text-[#FDFBF7]">
                    Puja experience
                  </h2>
                  <p className="text-xs text-[#FDFBF7]/60">
                    Select your vision for the day
                  </p>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {DEFAULT_PUJA_VIBE_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setPujaVibe(opt.id)}
                      className={`w-full p-3 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                        pujaVibe === opt.id
                          ? "bg-[#631726]/40 border-[#D4AF37] ring-1 ring-[#D4AF37]"
                          : "bg-[#161413] border-[#FDFBF7]/15 hover:border-[#D4AF37]/30"
                      }`}
                    >
                      <span className="text-xl">{opt.icon}</span>
                      <div>
                        <h4 className="text-xs font-bold text-[#FDFBF7]">{opt.title}</h4>
                        <p className="text-[10px] text-[#FDFBF7]/60">{opt.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 5: Activities */}
            {step === 5 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-semibold">
                    Step 5 • Activities
                  </span>
                  <h2 className="font-editorial text-2xl font-bold text-[#FDFBF7]">
                    Select Activities
                  </h2>
                  <p className="text-xs text-[#FDFBF7]/60">Pick what you want to do</p>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {DEFAULT_ACTIVITIES.map((act) => {
                    const isSelected = activities.includes(act);
                    return (
                      <button
                        key={act}
                        type="button"
                        onClick={() => toggleActivity(act)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#631726] border-[#D4AF37] text-[#FDFBF7]"
                            : "bg-[#161413] border-[#FDFBF7]/20 text-[#FDFBF7]/70"
                        }`}
                      >
                        {isSelected ? "✓ " : "+ "}
                        {act}
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-2 pt-2">
                  <input
                    type="text"
                    value={customActivity}
                    onChange={(e) => setCustomActivity(e.target.value)}
                    placeholder="Add custom activity..."
                    className="flex-1 px-3 py-2 rounded-xl bg-[#161413] border border-[#FDFBF7]/15 text-xs text-[#FDFBF7] focus:outline-none focus:border-[#D4AF37]"
                  />
                  <button
                    type="button"
                    onClick={addCustomActivity}
                    className="px-3 py-2 rounded-xl bg-[#2E2926] hover:bg-[#3E3733] border border-[#FDFBF7]/20 text-xs font-medium text-[#FDFBF7] cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}

            {/* STEP 6: Food */}
            {step === 6 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-semibold">
                    Step 6 • Food Choices
                  </span>
                  <h2 className="font-editorial text-2xl font-bold text-[#FDFBF7]">
                    Food options
                  </h2>
                  <p className="text-xs text-[#FDFBF7]/60">
                    Configure which food options appear for the recipient
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  {DEFAULT_FOOD_OPTIONS.map((f) => {
                    const isSelected = foods.includes(f.name);
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => toggleFood(f.name)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#631726]/40 border-[#D4AF37] text-[#FDFBF7]"
                            : "bg-[#161413] border-[#FDFBF7]/15 text-[#FDFBF7]/60"
                        }`}
                      >
                        <span className="text-lg block mb-0.5">{f.icon}</span>
                        <span className="text-xs font-semibold block">{f.name}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-2 pt-2">
                  <input
                    type="text"
                    value={customFood}
                    onChange={(e) => setCustomFood(e.target.value)}
                    placeholder="Add custom food item..."
                    className="flex-1 px-3 py-2 rounded-xl bg-[#161413] border border-[#FDFBF7]/15 text-xs text-[#FDFBF7] focus:outline-none focus:border-[#D4AF37]"
                  />
                  <button
                    type="button"
                    onClick={addCustomFood}
                    className="px-3 py-2 rounded-xl bg-[#2E2926] hover:bg-[#3E3733] border border-[#FDFBF7]/20 text-xs font-medium text-[#FDFBF7] cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}

            {/* STEP 7: Optional location */}
            {step === 7 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-semibold">
                    Step 7 • Location (Optional)
                  </span>
                  <h2 className="font-editorial text-2xl font-bold text-[#FDFBF7]">
                    Optional Meeting Point
                  </h2>
                  <p className="text-xs text-[#FDFBF7]/60">
                    Leave blank if you want to decide later or keep it a surprise.
                  </p>
                </div>

                <div className="space-y-3 pt-1">
                  <div>
                    <label className="text-[11px] text-[#FDFBF7]/70 block mb-1">
                      Venue / Pandal Name
                    </label>
                    <input
                      type="text"
                      value={venueName}
                      onChange={(e) => setVenueName(e.target.value)}
                      placeholder="e.g. Maddox Square / College Square"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#161413] border border-[#FDFBF7]/15 text-xs text-[#FDFBF7] focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-[#FDFBF7]/70 block mb-1">Address / Landmark</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. Near the main pandal gate"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#161413] border border-[#FDFBF7]/15 text-xs text-[#FDFBF7] focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-[#FDFBF7]/70 block mb-1">Date</label>
                      <input
                        type="text"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        placeholder="e.g. Maha Saptami"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#161413] border border-[#FDFBF7]/15 text-xs text-[#FDFBF7] focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-[#FDFBF7]/70 block mb-1">Time</label>
                      <input
                        type="text"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        placeholder="e.g. 6:30 PM"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#161413] border border-[#FDFBF7]/15 text-xs text-[#FDFBF7] focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-[#FDFBF7]/70 block mb-1">
                      Google Maps Link
                    </label>
                    <input
                      type="url"
                      value={googleMapsUrl}
                      onChange={(e) => setGoogleMapsUrl(e.target.value)}
                      placeholder="https://maps.google.com/..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#161413] border border-[#FDFBF7]/15 text-xs text-[#FDFBF7] focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 8: Review & Complete Payment */}
            {step === 8 && (
              <div className="space-y-4">
                <div className="space-y-1 text-center">
                  <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-semibold">
                    Step 8 • Review & Checkout
                  </span>
                  <h2 className="font-editorial text-2xl font-bold text-[#FDFBF7]">
                    Complete Your Invitation
                  </h2>
                  <p className="text-xs text-[#FDFBF7]/60">
                    Review your details and finalize access to get your shareable link
                  </p>
                </div>

                {/* Referral Attribution Pill */}
                {refCode && (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#28201D] border border-[#D4AF37]/40 text-xs text-[#D4AF37]">
                    <Zap className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                    <span>
                      Referral active: <strong className="font-mono text-[#FDFBF7]">{refCode}</strong>
                    </span>
                  </div>
                )}

                {/* Form Summary Card */}
                <div className="p-4 rounded-2xl bg-[#161413] border border-[#D4AF37]/30 space-y-2 text-xs">
                  <div className="flex justify-between border-b border-[#FDFBF7]/10 pb-1.5">
                    <span className="text-[#FDFBF7]/60">Recipient:</span>
                    <span className="font-bold text-[#D4AF37]">{recipientName}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#FDFBF7]/10 pb-1.5">
                    <span className="text-[#FDFBF7]/60">Creator:</span>
                    <span className="font-bold text-[#FDFBF7]">{creatorName}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#FDFBF7]/10 pb-1.5">
                    <span className="text-[#FDFBF7]/60">Vibe:</span>
                    <span className="font-medium text-[#FDFBF7]">{vibe}</span>
                  </div>
                  <div className="border-b border-[#FDFBF7]/10 pb-1.5">
                    <span className="text-[#FDFBF7]/60 block mb-0.5">Personal Message:</span>
                    <p className="italic text-[#FDFBF7]/80 line-clamp-2">&ldquo;{personalMessage}&rdquo;</p>
                  </div>
                  <div>
                    <span className="text-[#FDFBF7]/60 block mb-0.5">Configured Foods:</span>
                    <span className="text-[11px] text-[#FDFBF7]/80">{foods.join(", ")}</span>
                  </div>
                </div>

                {/* Coupon Code Section */}
                <div className="p-3.5 rounded-2xl bg-[#1A1715] border border-[#FDFBF7]/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[#D4AF37] flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" />
                      <span>Have a Coupon or Referral Code?</span>
                    </label>
                    {appliedCoupon && (
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="text-[11px] text-rose-400 hover:text-rose-300 underline cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="e.g. FREE100%"
                      disabled={couponStatus === "valid" || isValidatingCoupon}
                      className="flex-1 px-3 py-2 rounded-xl bg-[#161413] border border-[#FDFBF7]/15 text-xs text-[#FDFBF7] uppercase tracking-wider focus:outline-none focus:border-[#D4AF37] disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => handleApplyCoupon()}
                      disabled={!couponInput.trim() || isValidatingCoupon || couponStatus === "valid"}
                      className="px-4 py-2 rounded-xl bg-[#631726] hover:bg-[#7D1D31] text-xs font-semibold text-[#FDFBF7] transition-all disabled:opacity-40 cursor-pointer flex items-center gap-1"
                    >
                      {isValidatingCoupon ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <span>Apply</span>
                      )}
                    </button>
                  </div>

                  {couponMessage && (
                    <p
                      className={`text-[11px] font-medium flex items-center gap-1 mt-1 ${
                        couponStatus === "valid" ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {couponStatus === "valid" ? (
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      )}
                      <span>{couponMessage}</span>
                    </p>
                  )}

                  {/* Preset quick coupon pills */}
                  {activeCoupons.length > 0 && couponStatus !== "valid" && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {activeCoupons.map((code) => (
                        <button
                          key={code}
                          type="button"
                          onClick={() => {
                            setCouponInput(code);
                            handleApplyCoupon(code);
                          }}
                          className="text-[10px] px-2.5 py-1 rounded-full bg-[#24201D] border border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#631726]/40 transition-colors cursor-pointer"
                        >
                          🏷️ {code}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Email Delivery Input */}
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-semibold text-[#FDFBF7]/90 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Email your invitation link (Recommended)</span>
                  </label>
                  <input
                    type="email"
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#161413] border border-[#FDFBF7]/15 text-xs text-[#FDFBF7] placeholder:text-[#FDFBF7]/30 focus:outline-none focus:border-[#D4AF37]"
                  />
                  <p className="text-[10px] text-[#FDFBF7]/50">
                    Your invitation link & response notifications will be sent here 🔒
                  </p>
                </div>

                {/* Pricing Breakdown Card */}
                <div className="p-3.5 rounded-2xl bg-[#161413] border border-[#D4AF37]/30 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-[#FDFBF7]/70">
                    <span>Invitation Experience</span>
                    <span className={appliedCoupon ? "line-through text-[#FDFBF7]/40" : "font-semibold text-[#FDFBF7]"}>
                      ₹{basePriceINR.toFixed(2)}
                    </span>
                  </div>

                  {appliedCoupon && (
                    <div className="flex justify-between items-center text-emerald-400">
                      <span>Discount ({appliedCoupon})</span>
                      <span>-₹{(basePriceINR - finalPriceINR).toFixed(2)}</span>
                    </div>
                  )}

                  <div className="border-t border-[#FDFBF7]/10 pt-2 flex justify-between items-baseline">
                    <span className="font-bold text-[#FDFBF7]">Total to Pay</span>
                    <div className="text-right">
                      <span className="text-xl font-bold text-[#D4AF37]">
                        ₹{finalPriceINR.toFixed(2)}
                      </span>
                      {finalPriceINR === 0 && (
                        <span className="block text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                          100% Free Pass Applied
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-[10px] text-[#FDFBF7]/50 text-center pt-1">
                    Includes 30 days active hosting, audio, and live response tracking.
                  </p>
                </div>

                {paymentError && (
                  <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/50 text-rose-300 text-xs text-center flex items-center justify-center gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{paymentError}</span>
                  </div>
                )}

                {/* Checkout CTA Button */}
                <div className="pt-2">
                  <button
                    onClick={handlePayment}
                    disabled={isProcessingPayment}
                    className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#631726] via-[#7D1D31] to-[#C0422B] text-sm font-bold text-[#FDFBF7] border border-[#D4AF37]/50 shadow-xl shadow-[#631726]/40 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isProcessingPayment ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
                        <span>Securing your invitation...</span>
                      </>
                    ) : finalPriceINR === 0 ? (
                      <>
                        <Heart className="w-4 h-4 fill-[#D4AF37] text-[#D4AF37]" />
                        <span>Claim Free Invitation 🌺</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                        <span>Pay ₹{finalPriceINR.toFixed(0)} & Create Invitation 🌺</span>
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-[#FDFBF7]/40 text-center pt-2 flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-[#D4AF37]" />
                    <span>256-Bit SSL Encrypted Razorpay Checkout · No Account Required</span>
                  </p>
                </div>
              </div>
            )}

            {/* Stepper Navigation Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-[#FDFBF7]/10">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-4 py-2 rounded-xl text-xs text-[#FDFBF7]/70 hover:text-[#FDFBF7] flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
              ) : (
                <div />
              )}

              {step < 8 && (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-5 py-2.5 rounded-xl bg-[#631726] hover:bg-[#7D1D31] text-xs font-semibold text-[#FDFBF7] flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function DurgaPujaBuilderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#161413] text-[#D4AF37] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      }
    >
      <DurgaPujaBuilderContent />
    </Suspense>
  );
}
