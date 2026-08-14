"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MousePointer2, ShieldCheck, Zap, Share2, Check, Lock, Sparkles } from "lucide-react";
import CanvasConfetti from "./CanvasConfetti";
import { useSession } from "next-auth/react";

interface AutoClickSimulatedPreviewProps {
  demoId: string;
  formValues: Record<string, string>;
  defaultData: Record<string, any>;
  onActivateOffer?: (pricing: { originalPrice: number; specialPrice: number; cashbackAmount: number }) => void;
  onShareFreeLink?: () => void;
  publishedUrl?: string | null;
  isPaid?: boolean;
  isPremiumUser?: boolean;
}

export default function AutoClickSimulatedPreview({
  demoId,
  formValues,
  defaultData,
  onActivateOffer,
  onShareFreeLink,
  publishedUrl,
  isPaid = false,
  isPremiumUser,
}: AutoClickSimulatedPreviewProps) {
  const { data: session } = useSession();
  const userObj = session?.user as any;
  const [isFetchedPremium, setIsFetchedPremium] = useState<boolean>(false);
  const isPremiumAccount = Boolean(isPremiumUser) || isFetchedPremium || userObj?.plan === "PREMIUM" || userObj?.role === "super_admin";

  const displayTitle = formValues["title"] || defaultData["title"] || "A Surprise For You... 😊";
  const displayRecipient = formValues["recipientName"] || defaultData["recipientName"] || "Someone Special ✨";
  const displayQuestion = formValues["question"] || defaultData["question"] || "Will you be mine? 💖";
  const displayMessage = formValues["loveMessage"] || defaultData["loveMessage"] || "A little surprise from someone who truly cares…";
  const patternText = formValues["patternText"] || defaultData["patternText"] || "love you";
  const photoUrl = formValues["_photo"] || formValues["_photo1"] || defaultData["_photo"] || defaultData["photo"];
  const acceptBtn = formValues["acceptBtn"] || defaultData["acceptBtn"] || "Yes! 😍";
  const rejectBtn = formValues["rejectBtn"] || defaultData["rejectBtn"] || "No 🙈";

  const isBirthday = demoId === "birthday-wish";
  const isPlanner = demoId.includes("planner");
  const isSurprise = demoId === "surprise";

  // Dynamic Admin Pricing State
  const [pricing, setPricing] = useState({
    originalPrice: 499,
    specialPrice: 199,
    cashbackAmount: 50,
    discountPercent: 60,
  });

  // Auto-click simulation state loop
  const [simStage, setSimStage] = useState<
    "landing" | "tap_heart" | "portrait" | "read_letter" | "continue_proposal" | "accept_clicked" | "accepted"
  >("landing");

  const [triggerConfetti, setTriggerConfetti] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fetch live admin settings on mount
  useEffect(() => {
    fetch("/api/system/pricing")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          if (data.isPremium) {
            setIsFetchedPremium(true);
          }
          setPricing({
            originalPrice: data.originalPrice,
            specialPrice: data.isPremium ? 0 : data.specialPrice,
            cashbackAmount: data.cashbackAmount,
            discountPercent: data.isPremium ? 100 : data.discountPercent,
          });
        }
      })
      .catch(() => {});
  }, []);

  // Continuous Multi-Stage Auto-click simulation cycle
  useEffect(() => {
    let timers: NodeJS.Timeout[] = [];

    const runSurpriseCycle = () => {
      setSimStage("landing");
      setTriggerConfetti(false);

      // 1. Move cursor to Heart & tap at 1.4s
      timers.push(setTimeout(() => setSimStage("tap_heart"), 1400));

      // 2. Transition to Text-Art Portrait Page at 1.8s
      timers.push(setTimeout(() => setSimStage("portrait"), 1800));

      // 3. Move cursor to "Read My Message" & click at 4.2s
      timers.push(setTimeout(() => setSimStage("read_letter"), 4200));

      // 4. Move cursor to "Continue" & click at 6.8s -> Proposal question
      timers.push(setTimeout(() => setSimStage("continue_proposal"), 6800));

      // 5. Cursor clicks "Yes!" at 9.0s
      timers.push(setTimeout(() => setSimStage("accept_clicked"), 9000));

      // 6. Acceptance & Confetti burst at 9.4s
      timers.push(setTimeout(() => {
        setSimStage("accepted");
        setTriggerConfetti(true);
      }, 9400));

      // 7. Restart full cycle at 14s
      timers.push(setTimeout(() => runSurpriseCycle(), 14000));
    };

    const runGenericCycle = () => {
      setSimStage("landing");
      setTriggerConfetti(false);

      timers.push(setTimeout(() => setSimStage("accept_clicked"), 1800));

      timers.push(setTimeout(() => {
        setSimStage("accepted");
        setTriggerConfetti(true);
      }, 2200));

      timers.push(setTimeout(() => runGenericCycle(), 6000));
    };

    if (isSurprise) {
      runSurpriseCycle();
    } else {
      runGenericCycle();
    }

    return () => {
      timers.forEach((t) => clearTimeout(t));
    };
  }, [isSurprise]);

  const handleCopy = () => {
    if (publishedUrl) {
      navigator.clipboard.writeText(publishedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Calculate cursor positioning & click animations dynamically based on simStage
  const getCursorTarget = () => {
    switch (simStage) {
      case "landing":
        return { top: "62%", left: "50%", opacity: 1, scale: 1 };
      case "tap_heart":
        return { top: "62%", left: "50%", opacity: 1, scale: 0.85 };
      case "portrait":
        return { top: "78%", left: "50%", opacity: 1, scale: 1 };
      case "read_letter":
        return { top: "78%", left: "50%", opacity: 1, scale: 0.85 };
      case "continue_proposal":
        return { top: "75%", left: "38%", opacity: 1, scale: 1 };
      case "accept_clicked":
        return { top: "75%", left: "38%", opacity: 1, scale: 0.85 };
      default:
        return { top: "75%", left: "38%", opacity: 0, scale: 1 };
    }
  };

  const isDarkCanvas = isSurprise && simStage !== "landing";

  return (
    <div className="w-full flex flex-col items-center select-none animate-in fade-in duration-300">
      {/* Confetti Trigger on Click Simulation */}
      {triggerConfetti && <CanvasConfetti />}

      {/* Top Recipient View Title Header */}
      <div className="text-center mb-2 sm:mb-3">
        <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
          Here's what <span className="text-rose-500 underline decoration-rose-300 decoration-wavy underline-offset-4">{displayRecipient}</span> will see ✨
        </h3>
        <p className="text-[10px] sm:text-xs text-slate-500 font-medium">Auto-simulating live recipient experience 👇</p>
      </div>

      {/* Main Grid: Left Phone Mockup, Right Offer & CTA on Desktop */}
      <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-center max-w-xl">
        
        {/* Left Column: Outer Phone Mockup Frame */}
        <div className="md:col-span-5 flex justify-center">
          <div className="w-full max-w-[185px] sm:max-w-[200px] bg-slate-950 p-2 rounded-[30px] shadow-2xl border-4 border-slate-800 relative">
            {/* Dynamic Island / Notch */}
            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-14 h-3 bg-black rounded-full z-20 flex items-center justify-center pointer-events-none">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-900/80 mr-1.5" />
              <div className="w-1 h-1 rounded-full bg-blue-900/80" />
            </div>

            {/* Screen Content Area */}
            <div className={`w-full h-[290px] sm:h-[310px] rounded-[22px] overflow-hidden relative flex flex-col justify-between p-2.5 pt-5 text-white text-center shadow-inner transition-colors duration-500 ${
              isDarkCanvas ? "bg-black" : "bg-gradient-to-br from-slate-950 via-rose-950 to-purple-950"
            }`}>
              
              {/* Animated Virtual Cursor */}
              <motion.div
                className="absolute z-30 pointer-events-none"
                animate={getCursorTarget()}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              >
                <div className="relative">
                  <MousePointer2 className="w-5 h-5 text-white fill-slate-900 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] filter" />
                  {(simStage === "tap_heart" || simStage === "read_letter" || simStage === "accept_clicked") && (
                    <motion.span
                      initial={{ scale: 0.5, opacity: 1 }}
                      animate={{ scale: 1.8, opacity: 0 }}
                      className="absolute -top-1 -left-1 w-7 h-7 rounded-full bg-rose-400/50 border border-white"
                    />
                  )}
                </div>
              </motion.div>

              {/* Ambient Glow (Only on gradient cover) */}
              {!isDarkCanvas && (
                <>
                  <div className="absolute -top-12 -left-12 w-24 h-24 bg-rose-500/20 rounded-full blur-2xl pointer-events-none" />
                  <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />
                </>
              )}

              {/* Content Body */}
              <div className="relative z-10 my-auto w-full">
                {isSurprise && simStage !== "landing" ? (
                  /* Romantic Surprise Multi-Stage Flow */
                  <AnimatePresence mode="wait">
                    {simStage === "portrait" || simStage === "read_letter" ? (
                      <motion.div
                        key="portrait_stage"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center space-y-2"
                      >
                        {/* TextArtPortrait Mockup with Overlay Popup */}
                        <div className="relative inline-flex items-center justify-center overflow-hidden max-w-full shadow-2xl">
                          <div
                            className="absolute inset-0 w-[300%] h-[300%] bg-black text-white text-[7px] font-black leading-[7px] tracking-tighter overflow-hidden select-none pointer-events-none break-all text-justify p-0 origin-top-left z-0"
                            style={{ fontFamily: "monospace", transform: "scale(0.33333)" }}
                          >
                            {((patternText || "love you").trim() + "  ").repeat(1500)}
                          </div>
                          <img
                            src={photoUrl || "/demos/surprise/cute_woman.png"}
                            alt="Portrait Preview"
                            className="relative z-10 w-full h-auto max-h-[170px] object-contain block"
                            style={{ filter: "grayscale(100%) contrast(160%) brightness(1.2)", mixBlendMode: "multiply" }}
                          />

                          {/* Love Letter Popup overlay directly on top of photo */}
                          {simStage === "read_letter" && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              className="absolute inset-2 z-30 m-auto bg-white/95 backdrop-blur-md rounded-xl p-2.5 text-slate-900 flex flex-col items-center justify-center text-center shadow-2xl border border-white/60"
                            >
                              <span className="text-[8px] font-extrabold text-rose-500 uppercase tracking-wider mb-0.5">💌 Message for you</span>
                              <p className="text-[9px] font-medium italic leading-tight line-clamp-4">"{displayMessage}"</p>
                              <span className="text-[7.5px] text-slate-400 mt-1 font-bold">(Tap note to close)</span>
                            </motion.div>
                          )}
                        </div>

                        {simStage !== "read_letter" && (
                          <motion.span
                            animate={{ scale: 1 }}
                            className="px-3 py-1 bg-white/95 text-rose-600 rounded-full text-[9px] font-bold shadow-md tracking-tight"
                          >
                            💌 Read My Message
                          </motion.span>
                        )}
                      </motion.div>
                    ) : simStage === "continue_proposal" || simStage === "accept_clicked" ? (
                      <motion.div
                        key="proposal_stage"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-3"
                      >
                        <h4 className="text-xs font-black text-rose-300 leading-tight px-1">
                          {displayQuestion}
                        </h4>
                        <div className="flex gap-1.5 justify-center pt-1">
                          <motion.span
                            animate={simStage === "accept_clicked" ? { scale: 0.92 } : { scale: 1 }}
                            className={`px-3 py-1 text-[9px] rounded-full font-bold shadow-md transition-all ${
                              simStage === "accept_clicked"
                                ? "bg-emerald-500 text-white ring-2 ring-emerald-300"
                                : "bg-rose-500 text-white"
                            }`}
                          >
                            {acceptBtn}
                          </motion.span>
                          <span className="px-3 py-1 text-[9px] bg-white/20 text-white rounded-full font-medium border border-white/20">
                            {rejectBtn}
                          </span>
                        </div>
                      </motion.div>
                    ) : simStage === "accepted" ? (
                      <motion.div
                        key="accepted_stage"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-gradient-to-r from-rose-500/40 to-pink-500/40 backdrop-blur-md border border-rose-400/50 p-2.5 rounded-xl text-center space-y-1"
                      >
                        <div className="text-xs font-black text-rose-200 flex items-center justify-center gap-1">
                          💖 She Said Yes! 💖
                        </div>
                        <p className="text-[9px] text-pink-100 font-semibold line-clamp-2 leading-tight">
                          "{displayMessage}"
                        </p>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                ) : isBirthday ? (
                  /* Birthday Cover / Landing simulation (Matches BirthdayTemplate Stage 0) */
                  <div className="space-y-2 px-1 text-center">
                    <h4 className="text-xs sm:text-sm font-bold text-white font-serif tracking-tight drop-shadow-md">
                      {displayTitle} ❤️
                    </h4>

                    <p className="text-[9px] sm:text-[10px] text-rose-100/90 font-medium leading-relaxed px-1">
                      {displayQuestion}
                    </p>

                    {simStage === "accepted" ? (
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-gradient-to-r from-rose-500/30 to-pink-500/30 backdrop-blur-md border border-rose-400/40 p-1.5 rounded-lg text-center space-y-0.5"
                      >
                        <div className="text-[10px] font-black text-rose-200 flex items-center justify-center gap-1">
                          🎉 Birthday Celebration! 🎉
                        </div>
                        <p className="text-[9px] text-pink-100 font-semibold line-clamp-2 leading-tight">
                          "{displayMessage}"
                        </p>
                      </motion.div>
                    ) : (
                      <div className="flex gap-1.5 justify-center pt-1">
                        <motion.span
                          animate={simStage === "accept_clicked" ? { scale: 0.92 } : { scale: 1 }}
                          className={`px-2.5 py-1 text-[8px] sm:text-[9px] rounded-lg font-bold shadow-sm transition-all ${
                            simStage === "accept_clicked"
                              ? "bg-emerald-500 text-white ring-2 ring-emerald-300"
                              : "bg-gradient-to-r from-pink-500 to-rose-500 text-white"
                          }`}
                        >
                          {acceptBtn && acceptBtn !== "Yes! 😍" ? acceptBtn : "Love ❤️"}
                        </motion.span>
                        <span className="px-2.5 py-1 text-[8px] sm:text-[9px] bg-white/10 text-white rounded-lg font-semibold border border-white/20">
                          {rejectBtn && rejectBtn !== "No 🙈" ? rejectBtn : "Hate 💔"}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Standard Cover / Landing simulation for other templates */
                  <div className="space-y-1 px-1">
                    <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-400/40 text-rose-400 flex items-center justify-center mx-auto shadow-md">
                      {isPlanner ? (
                        <span className="text-base">🌸</span>
                      ) : (
                        <Heart className="w-4 h-4 fill-rose-500 animate-pulse" />
                      )}
                    </div>

                    <h4 className="text-xs font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-200 via-pink-200 to-purple-200 leading-tight line-clamp-1">
                      {displayTitle}
                    </h4>

                    <p className="text-[10px] font-medium text-rose-300/90 truncate">
                      For: <span className="font-bold text-white">{displayRecipient}</span>
                    </p>

                    {simStage === "accepted" ? (
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-gradient-to-r from-rose-500/30 to-pink-500/30 backdrop-blur-md border border-rose-400/40 p-1.5 rounded-lg text-center space-y-0.5"
                      >
                        <div className="text-[10px] font-black text-rose-200 flex items-center justify-center gap-1">
                          💖 She Said Yes! 💖
                        </div>
                        <p className="text-[9px] text-pink-100 font-semibold line-clamp-2 leading-tight">
                          "{displayMessage}"
                        </p>
                      </motion.div>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-[9px] font-semibold text-rose-200 leading-tight line-clamp-1">
                          "{displayQuestion}"
                        </p>
                        <div className="flex gap-1 justify-center pt-0.5">
                          <motion.span
                            animate={simStage === "accept_clicked" ? { scale: 0.92 } : { scale: 1 }}
                            className={`px-2 py-0.5 text-[8px] rounded-full font-bold shadow-sm transition-all ${
                              simStage === "accept_clicked"
                                ? "bg-emerald-500 text-white ring-2 ring-emerald-300"
                                : "bg-rose-500 text-white"
                            }`}
                          >
                            {acceptBtn}
                          </motion.span>
                          <span className="px-2 py-0.5 text-[8px] bg-white/20 text-white rounded-full font-medium border border-white/20">
                            {rejectBtn}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* iPhone Home Bar */}
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-16 h-1 bg-white/40 rounded-full" />
            </div>
          </div>
        </div>

        {/* Right Column: 🎁 High-Converting Offer Banner (Admin Managed) */}
        <div className="md:col-span-7 flex flex-col">
          <div className="w-full bg-gradient-to-br from-slate-900 via-rose-950 to-slate-950 border border-rose-500/30 rounded-2xl p-3 sm:p-4 text-white shadow-xl space-y-2.5">
            {/* Pricing display */}
            <div className="flex items-center justify-between px-1">
              <div>
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 flex items-center gap-1">
                  {isPremiumAccount ? "Premium Member Price 👑" : "Special Price 🎨"}
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-xs font-semibold text-slate-400 line-through">
                    ₹{pricing.originalPrice}
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-rose-400 tracking-tight">
                    ₹{isPremiumAccount ? 0 : pricing.specialPrice}
                  </span>
                </div>
              </div>

              <span className={`text-white font-black text-[10px] sm:text-xs px-2.5 py-1 rounded-xl uppercase tracking-wider shadow-md ${
                isPremiumAccount 
                  ? "bg-gradient-to-r from-amber-400 to-amber-600 shadow-amber-900/50 text-slate-950" 
                  : "bg-gradient-to-r from-rose-500 to-pink-500 shadow-rose-900/50"
              }`}>
                {isPremiumAccount ? "100% OFF" : `${pricing.discountPercent}% OFF`}
              </span>
            </div>

            {/* Action Button */}
            <div className="flex flex-col gap-2">
              {!isPaid ? (
                <>
                  <button
                    onClick={() => onActivateOffer && onActivateOffer({ ...pricing, specialPrice: isPremiumAccount ? 0 : pricing.specialPrice })}
                    className="w-full py-3 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-600 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-rose-500/30 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <Zap className="w-4 h-4 fill-white animate-pulse" /> {isPremiumAccount ? "Pay & Activate Link at ₹0" : `Pay & Activate Link at ₹${pricing.specialPrice}`}
                  </button>
                  <p className="text-[10px] text-slate-400 text-center font-medium flex items-center justify-center gap-1">
                    {isPremiumAccount ? (
                      <>
                        <Sparkles className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="text-amber-300 font-bold">👑 100% Free for Premium Members</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3 h-3 text-rose-400" /> Payment required to unlock &amp; share link
                      </>
                    )}
                  </p>
                </>
              ) : (
                <>
                  <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-extrabold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 text-center">
                    <Check className="w-4 h-4 text-emerald-400" /> 🎉 Payment Successful! Link Unlocked &amp; Ready!
                  </div>

                  {publishedUrl && (
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={handleCopy}
                        className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition flex items-center justify-center gap-1.5"
                      >
                        {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-slate-400" />}
                        {copied ? "Copied!" : "Copy Link"}
                      </button>
                      {onShareFreeLink && (
                        <button
                          onClick={onShareFreeLink}
                          className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-900/40"
                        >
                          WhatsApp 🚀
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Trust row */}
            <div className="pt-1 border-t border-white/10 flex items-center justify-between text-[9px] sm:text-[9.5px] text-slate-400 font-medium">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" /> {isPremiumAccount ? "Instant Premium Activation" : "Secure via Razorpay"}
              </span>
              <span className="text-slate-300 font-semibold">
                ⚡ Instant delivery
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
