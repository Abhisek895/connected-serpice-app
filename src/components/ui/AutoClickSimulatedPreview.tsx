"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MousePointer2, ShieldCheck, Zap, Share2, Check, Lock, X, Gift } from "lucide-react";
import CanvasConfetti from "./CanvasConfetti";
import { RecipientActionBar } from "@/components/ui/RecipientActionBar";
import { useSession } from "next-auth/react";
import { useRef, useCallback } from "react";

function TextArtPortraitMock({
  src,
  phrase = "LOVE YOU",
}: {
  src: string;
  phrase?: string;
}) {
  const textRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const generateArt = useCallback(() => {
    const img = imgRef.current;
    const wall = textRef.current;
    if (!img || !wall || !img.complete || img.naturalWidth === 0) return;
    const w = img.clientWidth;
    const h = img.clientHeight;
    const multiplier = 3;
    const charsPerLine = Math.ceil((w * multiplier) / 5);
    const totalLines = Math.ceil((h * multiplier) / 8);
    const totalChars = charsPerLine * totalLines * 1.5;
    const repeatPhrase = phrase.trim() + "  ";
    const repeatCount = Math.ceil(totalChars / repeatPhrase.length);
    wall.innerText = repeatPhrase.repeat(repeatCount);
  }, [phrase]);

  useEffect(() => {
    window.addEventListener("resize", generateArt);
    return () => window.removeEventListener("resize", generateArt);
  }, [generateArt]);

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        width: "100%",
        height: "auto",
        maxHeight: "100%",
        overflow: "hidden",
      }}
    >
      {/* Text pixel layer */}
      <div
        ref={textRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "300%",
          height: "300%",
          transform: "scale(0.3333)",
          transformOrigin: "top left",
          zIndex: 1,
          backgroundColor: "black",
          color: "white",
          fontSize: "8px",
          lineHeight: "8px",
          letterSpacing: "0px",
          fontWeight: 900,
          wordBreak: "break-all",
          overflow: "hidden",
          textAlign: "justify",
          willChange: "transform",
        }}
      />
      {/* Source image */}
      <img
        ref={imgRef}
        src={src}
        alt="Portrait"
        onLoad={generateArt}
        style={{
          display: "block",
          width: "100%",
          height: "auto",
          maxHeight: "100%",
          objectFit: "cover",
          position: "relative",
          zIndex: 2,
          filter: "grayscale(100%) contrast(160%) brightness(1.2)",
          mixBlendMode: "multiply",
        }}
      />
    </div>
  );
}

interface AutoClickSimulatedPreviewProps {
  demoId: string;
  formValues: Record<string, string>;
  defaultData: Record<string, any>;
  onActivateOffer?: (pricing: { originalPrice: number; specialPrice: number; cashbackAmount: number }) => void;
  onShareFreeLink?: () => void;
  onClose?: () => void;
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
  onClose,
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
  const isProposal = demoId === "she-cant-say-no" || demoId === "nasamajh-lakri";
  const isApology = demoId === "im-sorry" || demoId === "apology";

  // Dynamic Admin Pricing State
  const [pricing, setPricing] = useState({
    originalPrice: 500,
    specialPrice: 200,
    cashbackAmount: 50,
    discountPercent: 60,
    enabled: true,
  });

  // Auto-click simulation state loop
  const [simStage, setSimStage] = useState<
    | "landing" | "tap_heart" | "portrait" | "read_letter" | "continue_proposal" | "accept_clicked" | "accepted"
    // Birthday
    | "slideshow" | "read_wish"
    // Apology
    | "open_gift" | "begging" | "forgiven"
    // Planner
    | "hero" | "select_place" | "select_food" | "select_date" | "summary"
    // Proposal (She Can't Say No / Nasamajh)
    | "dodge_no" | "click_yes" | "gateway" | "rejected"
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
            originalPrice: data.originalPrice ?? 500,
            specialPrice: data.isPremium ? 0 : (data.specialPrice ?? 200),
            cashbackAmount: data.cashbackAmount ?? 50,
            discountPercent: data.isPremium ? 100 : (data.discountPercent ?? 60),
            enabled: data.enabled !== false,
          });
        }
      })
      .catch(() => {});
  }, []);

  // Continuous Multi-Stage Auto-click simulation cycle
  useEffect(() => {
    let timers: NodeJS.Timeout[] = [];

    // If payment is already completed, freeze on the celebratory unlocked state
    // and fire a single 2.5s confetti burst rather than thrashing mobile RAM
    if (isPaid) {
      setSimStage(isSurprise ? "portrait" : "accepted");
      setTriggerConfetti(true);
      const confettiTimer = setTimeout(() => setTriggerConfetti(false), 2500);
      return () => clearTimeout(confettiTimer);
    }

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

    const runBirthdayCycle = () => {
      setSimStage("landing");
      setTriggerConfetti(true); // Falling confetti from start
      timers.push(setTimeout(() => setSimStage("slideshow"), 1500));
      timers.push(setTimeout(() => setSimStage("read_wish"), 4000));
      timers.push(setTimeout(() => setSimStage("slideshow"), 7000));
      timers.push(setTimeout(() => runBirthdayCycle(), 10000));
    };

    const runApologyCycle = () => {
      setSimStage("landing"); // Gift box
      setTriggerConfetti(false);
      timers.push(setTimeout(() => setSimStage("open_gift"), 1400));
      timers.push(setTimeout(() => setSimStage("read_letter"), 2000));
      timers.push(setTimeout(() => setSimStage("begging"), 4500)); // Sad cat
      timers.push(setTimeout(() => setSimStage("dodge_no"), 6500)); // Try to click no
      timers.push(setTimeout(() => setSimStage("click_yes"), 8500));
      timers.push(setTimeout(() => {
        setSimStage("forgiven");
        setTriggerConfetti(true);
      }, 9000));
      timers.push(setTimeout(() => runApologyCycle(), 13000));
    };

    const runPlannerCycle = () => {
      setSimStage("hero"); // Typewriter hero
      setTriggerConfetti(false);
      timers.push(setTimeout(() => setSimStage("select_place"), 2500));
      timers.push(setTimeout(() => setSimStage("select_food"), 5000));
      timers.push(setTimeout(() => setSimStage("select_date"), 7500));
      timers.push(setTimeout(() => {
        setSimStage("summary");
        setTriggerConfetti(true);
      }, 10000));
      timers.push(setTimeout(() => runPlannerCycle(), 14000));
    };

    const runSheCantSayNoCycle = () => {
      setSimStage("landing"); // Flirty cat
      setTriggerConfetti(false);
      timers.push(setTimeout(() => setSimStage("dodge_no"), 2000));
      timers.push(setTimeout(() => setSimStage("click_yes"), 4500));
      timers.push(setTimeout(() => {
        setSimStage("accepted"); // Bear hug
        setTriggerConfetti(true);
      }, 5000));
      timers.push(setTimeout(() => runSheCantSayNoCycle(), 9000));
    };

    const runNasamajhCycle = () => {
      setSimStage("gateway");
      setTriggerConfetti(false);
      timers.push(setTimeout(() => setSimStage("continue_proposal"), 1500));
      timers.push(setTimeout(() => setSimStage("rejected"), 3500)); // First rejection
      timers.push(setTimeout(() => setSimStage("click_yes"), 6000));
      timers.push(setTimeout(() => {
        setSimStage("accepted");
        setTriggerConfetti(true);
      }, 6500));
      timers.push(setTimeout(() => runNasamajhCycle(), 10500));
    };

    const runGenericCycle = () => {
      setSimStage("landing");
      setTriggerConfetti(false);
      timers.push(setTimeout(() => setSimStage("accept_clicked"), 1800));
      timers.push(setTimeout(() => {
        setSimStage("accepted");
        setTriggerConfetti(true);
      }, 2200));
      timers.push(setTimeout(() => runGenericCycle(), 7000));
    };

    if (isSurprise) {
      runSurpriseCycle();
    } else if (isBirthday) {
      runBirthdayCycle();
    } else if (isApology) {
      runApologyCycle();
    } else if (isPlanner) {
      runPlannerCycle();
    } else if (demoId === "she-cant-say-no") {
      runSheCantSayNoCycle();
    } else if (demoId === "nasamajh-lakri") {
      runNasamajhCycle();
    } else {
      runGenericCycle();
    }

    return () => {
      timers.forEach((t) => clearTimeout(t));
    };
  }, [isSurprise, isPaid]);

  const handleCopy = () => {
    if (publishedUrl) {
      navigator.clipboard.writeText(publishedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getCursorTarget = () => {
    switch (simStage) {
      case "landing":
      case "hero":
      case "gateway":
        return { top: "62%", left: "50%", opacity: 1, scale: 1 };
      case "tap_heart":
      case "open_gift":
        return { top: "62%", left: "50%", opacity: 1, scale: 0.85 };
      case "portrait":
      case "slideshow":
      case "begging":
      case "select_place":
        return { top: "78%", left: "50%", opacity: 1, scale: 1 };
      case "read_letter":
      case "read_wish":
      case "select_food":
        return { top: "78%", left: "50%", opacity: 1, scale: 0.85 };
      case "continue_proposal":
      case "select_date":
      case "rejected":
        return { top: "75%", left: "38%", opacity: 1, scale: 1 };
      case "dodge_no":
        return { top: "75%", left: "65%", opacity: 1, scale: 0.85 };
      case "accept_clicked":
      case "click_yes":
        return { top: "75%", left: "38%", opacity: 1, scale: 0.85 };
      default:
        return { top: "75%", left: "38%", opacity: 0, scale: 1 };
    }
  };

  const getBgClass = () => {
    if (isSurprise && simStage !== "landing") return "bg-black";
    if (isBirthday) return "bg-gradient-to-br from-rose-950 to-black";
    if (isApology) return "bg-[#090312]";
    if (demoId === "she-cant-say-no") return "bg-[#DF98A2]";
    if (demoId === "nasamajh-lakri") return "bg-gradient-to-br from-indigo-950 via-[#1a0a2e] to-black";
    if (isPlanner) return "bg-gradient-to-br from-rose-950 via-pink-950 to-slate-950";
    return "bg-gradient-to-br from-slate-950 via-rose-950 to-purple-950";
  };

  const isDarkCanvas = isSurprise && simStage !== "landing";

  return (
    <div className="w-full flex flex-col items-center select-none animate-in fade-in duration-300 relative">
      {/* Top Close [ X ] Button if provided */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute -top-1 sm:top-0 right-0 sm:right-1 text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition z-40 cursor-pointer"
          title="Close preview"
        >
          <X className="w-5 h-5" />
        </button>
      )}

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
          <div className="w-full max-w-[160px] sm:max-w-[200px] bg-slate-950 p-2 rounded-[30px] shadow-2xl border-4 border-slate-800 relative">
            {/* Dynamic Island / Notch */}
            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-14 h-3 bg-black rounded-full z-20 flex items-center justify-center pointer-events-none">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-900/80 mr-1.5" />
              <div className="w-1 h-1 rounded-full bg-blue-900/80" />
            </div>

            {/* Screen Content Area */}
            <div className={`w-full h-[250px] sm:h-[310px] rounded-[22px] overflow-hidden relative flex flex-col justify-between p-2.5 pt-5 text-white text-center shadow-inner transition-colors duration-500 ${getBgClass()}`}>
              
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
                {isSurprise ? (
                  /* Romantic Surprise Multi-Stage Flow (including landing) */
                  <AnimatePresence mode="wait">
                    {simStage === "landing" || simStage === "tap_heart" ? (
                      <motion.div
                        key="surprise_landing"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex flex-col items-center justify-center space-y-3 h-full py-2"
                      >
                        <motion.div
                          animate={{ scale: [1, 1.08, 1] }}
                          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                          className="w-16 h-16 rounded-full bg-gradient-to-tr from-rose-600 via-pink-500 to-purple-600 flex items-center justify-center shadow-[0_0_40px_rgba(244,63,94,0.7)] border-2 border-rose-300/50"
                        >
                          <Heart className="w-8 h-8 text-white fill-white" />
                        </motion.div>
                        <h4 className="text-[11px] font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-200 via-pink-200 to-purple-200 leading-tight text-center px-2">
                          {displayTitle}
                        </h4>
                        <motion.span
                          animate={simStage === "tap_heart" ? { scale: 0.9, backgroundColor: "rgba(244,63,94,0.9)" } : { scale: 1 }}
                          className="px-4 py-1.5 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-full text-[9px] font-black shadow-lg border border-rose-300/40"
                        >
                          Open Surprise 💌
                        </motion.span>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                ) : null}
                {isSurprise && simStage !== "landing" && simStage !== "tap_heart" ? (
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
                        <div className="absolute top-0 left-0 w-full h-full z-10 overflow-hidden flex items-center justify-center">
                          <TextArtPortraitMock src={photoUrl || "/demos/surprise/cute_woman.png"} phrase={patternText || "love you"} />

                          {/* Love Letter Popup overlay directly on top of photo */}
                          <AnimatePresence>
                            {simStage === "read_letter" && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="absolute inset-x-2 top-1/2 -translate-y-1/2 z-30 m-auto bg-white/95 backdrop-blur-md rounded-xl p-2.5 text-slate-900 flex flex-col items-center justify-center text-center shadow-2xl border border-white/60"
                                style={{ fontFamily: "'Dancing Script', cursive" }}
                              >
                                <span className="text-[10px] font-extrabold text-rose-500 uppercase tracking-wider mb-0.5" style={{ fontFamily: "sans-serif" }}>💌 Message for you</span>
                                <p className="text-[11px] font-medium leading-tight line-clamp-4">"{displayMessage}"</p>
                                <span className="text-[7.5px] text-slate-400 mt-1 font-bold" style={{ fontFamily: "sans-serif" }}>(Tap note to close)</span>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {simStage !== "read_letter" && (
                          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 w-full flex justify-center">
                            <motion.button
                              animate={{ scale: 1 }}
                              className="px-4 py-1.5 bg-white/95 text-rose-600 rounded-full text-[10px] shadow-lg border border-white/80"
                              style={{ fontFamily: "'Dancing Script', cursive", fontWeight: "bold" }}
                            >
                              💌 Read My Message
                            </motion.button>
                          </div>
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
                  <AnimatePresence mode="wait">
                    {simStage === "landing" || simStage === "slideshow" || simStage === "read_wish" ? (
                      <motion.div key="bday_slideshow" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="w-full h-full flex flex-col items-center justify-center relative space-y-2">
                        {/* Typewriter Text (simulated) */}
                        <div className="text-[11px] font-bold text-rose-300 font-serif leading-tight">
                          May all your dreams come true...
                        </div>
                        <div className="relative w-full h-[140px] rounded-xl overflow-hidden shadow-2xl bg-black border-2 border-rose-300/30">
                          <img src={photoUrl || "/demos/birthday-wish/s0.jpeg"} alt="Birthday Person" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/10" />
                        </div>
                        <h4 className="text-[12px] font-bold text-white font-serif tracking-tight leading-snug pt-1">
                          Happy Birthday, <span className="text-amber-400 font-extrabold">{displayRecipient} ✨</span>
                        </h4>
                        
                        {/* Wish Popup */}
                        {simStage === "read_wish" && (
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute inset-2 z-30 bg-white/95 backdrop-blur-md rounded-xl p-2.5 text-slate-900 flex flex-col items-center justify-center text-center shadow-2xl border border-white/60">
                            <span className="text-[8px] font-extrabold text-rose-500 uppercase tracking-wider mb-0.5">💌 Birthday Wish</span>
                            <p className="text-[9px] font-medium italic leading-tight line-clamp-4">"{displayMessage}"</p>
                            <span className="text-[7.5px] text-slate-400 mt-2 font-bold bg-slate-100 px-2 py-1 rounded-full">(Tap to close)</span>
                          </motion.div>
                        )}
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                ) : isApology ? (
                  /* Apology Multi-Stage Flow (Gift -> Letter -> Begging -> Happy) */
                  <AnimatePresence mode="wait">
                    {simStage === "landing" ? (
                      <motion.div key="apology_landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="flex flex-col items-center justify-center h-full space-y-4">
                        <div className="w-16 h-16 bg-gradient-to-tr from-rose-950 via-pink-900 to-purple-950 rounded-2xl border border-rose-400/50 flex items-center justify-center shadow-[0_0_30px_rgba(244,63,94,0.5)]">
                           <Gift className="w-8 h-8 text-rose-300 animate-bounce" />
                        </div>
                        <h4 className="text-[11px] font-bold text-rose-100 tracking-tight leading-snug">
                          {displayTitle}
                        </h4>
                        <span className="px-3 py-1 bg-gradient-to-r from-rose-500 to-purple-600 text-white rounded-full text-[9px] font-bold shadow-md">
                          Tap Here 💖
                        </span>
                      </motion.div>
                    ) : simStage === "read_letter" ? (
                      <motion.div key="apology_letter" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="w-full bg-slate-950 border border-rose-500/40 rounded-xl p-3 shadow-2xl flex flex-col items-center text-center text-rose-200">
                        <h4 className="text-[9px] font-bold border-b border-rose-500/30 pb-1 mb-2 w-full text-left flex items-center gap-1"><Heart className="w-3 h-3 fill-rose-500" /> A Letter...</h4>
                        <p className="text-[7px] font-medium text-left leading-relaxed">I am so deeply sorry for making you upset. You mean the entire world to me...</p>
                        <span className="inline-block px-3 py-1 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-md text-[8px] mt-3 shadow-md w-full font-bold">Close Letter ✨</span>
                      </motion.div>
                    ) : simStage === "begging" || simStage === "dodge_no" || simStage === "click_yes" ? (
                      <motion.div key="apology_begging" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="w-full flex flex-col items-center h-full justify-center space-y-2">
                        <img src="/demos/im-sorry/cat-sorry1.png" className="w-20 h-20 rounded-xl border border-rose-400/30 bg-slate-900 object-contain shadow-[0_0_20px_rgba(244,63,94,0.4)]" />
                        <h4 className="text-[10px] font-black text-rose-100 leading-tight">I'm Really Sorry... 🥺</h4>
                        <div className="flex gap-1.5 justify-center pt-1 relative w-full h-[30px]">
                          <motion.span animate={simStage === "click_yes" ? { scale: 0.92 } : { scale: 1 }} className="absolute left-[10%] px-2.5 py-1 text-[8px] bg-gradient-to-r from-rose-500 to-emerald-500 text-white rounded-full font-bold">
                            Yes, I Forgive You 🥰
                          </motion.span>
                          <motion.span animate={simStage === "dodge_no" ? { x: 30, y: -20, opacity: 0.5 } : { x: 0, y: 0, opacity: 1 }} className="absolute right-[10%] px-2 py-1 text-[8px] bg-slate-900 text-rose-300 rounded-full font-medium border border-rose-500/40">
                            No 😤
                          </motion.span>
                        </div>
                      </motion.div>
                    ) : simStage === "forgiven" ? (
                      <motion.div key="apology_accept" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-slate-950/85 border border-emerald-500/50 p-2.5 rounded-xl text-center space-y-1 shadow-2xl h-full flex flex-col items-center justify-center">
                        <img src="/demos/im-sorry/cat-happy.png" className="w-16 h-16 object-contain" />
                        <div className="text-[10px] font-black text-emerald-400">Yay! You Forgave Me! 🥰🎉</div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                ) : demoId === "she-cant-say-no" ? (
                  /* She Can't Say No Flow (Pink Theme, Flirty Cat, Dodging No) */
                  <AnimatePresence mode="wait">
                    {simStage === "landing" ? (
                      <motion.div key="she_landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center space-y-2 h-full">
                        <img src="https://media1.tenor.com/m/al4yRBO26akAAAAC/cat-goma.gif" className="w-24 h-24 rounded-xl shadow-lg border-2 border-white" />
                        <h4 className="text-[12px] font-black text-white bg-pink-500/50 px-2 py-0.5 rounded-md drop-shadow-md">
                          Do you love me? 🤗
                        </h4>
                        <div className="flex gap-2">
                          <span className="px-3 py-1 bg-white text-pink-600 rounded-full text-[9px] font-black shadow-lg">Yes I Do! 💖</span>
                          <span className="px-3 py-1 bg-pink-400 text-white rounded-full text-[9px] font-bold shadow-lg border border-pink-300">No...</span>
                        </div>
                      </motion.div>
                    ) : simStage === "dodge_no" || simStage === "click_yes" ? (
                      <motion.div key="she_dodge" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center space-y-2 h-full relative w-full">
                        <img src="https://media1.tenor.com/m/V792k7WJFAUAAAAC/peach-goma.gif" className="w-24 h-24 rounded-xl shadow-lg border-2 border-white" />
                        <h4 className="text-[12px] font-black text-white bg-pink-500/50 px-2 py-0.5 rounded-md drop-shadow-md">
                          Ek aur baar Soch lo! 🥺
                        </h4>
                        <div className="relative w-full h-[30px]">
                          <motion.span animate={simStage === "click_yes" ? { scale: 0.9 } : { scale: 1 }} className="absolute left-[15%] px-3 py-1 bg-white text-pink-600 rounded-full text-[9px] font-black shadow-lg z-20">Yes I Do! 💖</motion.span>
                          <motion.span animate={simStage === "dodge_no" ? { x: 35, y: -25, opacity: 0.8 } : { x: 0, y: 0, opacity: 1 }} className="absolute right-[15%] px-3 py-1 bg-pink-400 text-white rounded-full text-[9px] font-bold shadow-lg border border-pink-300 z-10">No...</motion.span>
                        </div>
                      </motion.div>
                    ) : simStage === "accepted" ? (
                      <motion.div key="she_accept" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="h-full flex items-center justify-center">
                        <img src="https://media1.tenor.com/m/gUiu1zyxfzYAAAAC/bear-kiss-bear-hug.gif" className="w-32 h-32 bg-white rounded-2xl p-1 shadow-2xl border-2 border-white object-contain" />
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                ) : demoId === "nasamajh-lakri" ? (
                  /* Nasamajh Lakri Flow (Dark Theme, Gateway, Hinglish Questions) */
                  <AnimatePresence mode="wait">
                    {simStage === "gateway" ? (
                      <motion.div key="nasa_gateway" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center space-y-3 h-full">
                        <h4 className="text-[16px] font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-200 via-pink-300 to-purple-200 drop-shadow-[0_2px_10px_rgba(244,63,94,0.6)] leading-tight text-center px-2">
                          Will you be mine? 💖
                        </h4>
                        <div className="flex gap-2 w-full justify-center px-4">
                          <span className="flex-1 py-1.5 bg-gradient-to-r from-emerald-400 to-emerald-600 text-white rounded-full text-[9px] font-black shadow-[0_0_15px_rgba(16,185,129,0.5)] border border-emerald-300/50">Haan Ji 💖</span>
                        </div>
                        <div className="flex gap-2 w-full justify-center px-4">
                          <span className="flex-1 py-1.5 bg-white/10 text-white/90 rounded-full text-[9px] font-bold border border-white/20 backdrop-blur-md">Nahin Ji 😔</span>
                        </div>
                      </motion.div>
                    ) : simStage === "continue_proposal" || simStage === "rejected" || simStage === "click_yes" ? (
                      <motion.div key="nasa_questions" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center h-full relative w-full space-y-4">
                         <h4 className="text-[14px] font-black text-rose-200 text-center leading-snug px-2 drop-shadow-md">
                          {simStage === "rejected" ? "Think again, piliiiiiizzzz? 🌻" : "piliiiiiizzzzzzzz? 💔"}
                        </h4>
                        <div className="flex gap-2 w-full justify-center px-4">
                          <motion.span animate={simStage === "click_yes" ? { scale: 0.92 } : { scale: 1 }} className="flex-1 py-1.5 bg-emerald-500 text-white rounded-full text-[9px] font-black shadow-md border border-emerald-400">Yes</motion.span>
                        </div>
                        <div className="flex gap-2 w-full justify-center px-4">
                          <span className="flex-1 py-1.5 bg-white/10 text-white/90 rounded-full text-[9px] font-bold border border-white/20">No</span>
                        </div>
                      </motion.div>
                    ) : simStage === "accepted" ? (
                      <motion.div key="nasa_accept" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="h-full flex flex-col items-center justify-center space-y-2">
                        <div className="text-[24px] animate-bounce">💖</div>
                        <div className="text-[12px] font-black text-rose-200">Yayyy! ✨</div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                ) : isPlanner ? (
                  /* Date Planner Flow (Hero -> Place -> Food -> Date -> Summary) */
                  <AnimatePresence mode="wait">
                    {simStage === "hero" ? (
                      <motion.div key="plan_hero" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center h-full space-y-3 px-2 text-center">
                        <div className="text-[18px]">✨</div>
                        <p className="text-[10px] font-serif text-rose-200/90 leading-relaxed font-medium">I made this tiny corner of the internet just for you...</p>
                        <span className="text-[8px] font-bold text-white bg-rose-500/50 px-2 py-1 rounded-full border border-rose-400/40">Continue 👀</span>
                      </motion.div>
                    ) : simStage === "select_place" ? (
                      <motion.div key="plan_place" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="w-full bg-white/10 backdrop-blur-md rounded-xl p-2 shadow-xl border border-white/20">
                        <h4 className="text-[9px] font-bold text-white mb-2 text-left">Where are we going? 🗺️</h4>
                        <div className="grid grid-cols-2 gap-1.5">
                          <div className="relative h-12 rounded border border-rose-400 overflow-hidden group"><div className="absolute inset-0 bg-black/40 z-10 flex items-center justify-center text-[7px] text-white font-bold">Victoria</div><img src="https://images.unsplash.com/photo-1558431382-27e303142255?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover" /></div>
                          <div className="relative h-12 rounded border border-white/20 overflow-hidden"><div className="absolute inset-0 bg-black/40 z-10 flex items-center justify-center text-[7px] text-white font-bold">Eco Park</div><img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover" /></div>
                        </div>
                        <span className="block mt-2 px-2 py-1 bg-white text-slate-900 text-center rounded text-[8px] font-bold shadow">Next ➡️</span>
                      </motion.div>
                    ) : simStage === "select_food" ? (
                      <motion.div key="plan_food" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="w-full bg-white/10 backdrop-blur-md rounded-xl p-2 shadow-xl border border-white/20">
                        <h4 className="text-[9px] font-bold text-white mb-2 text-left">What are we eating? 🍕</h4>
                        <div className="grid grid-cols-2 gap-1.5">
                          <div className="bg-rose-500 text-white text-[7px] py-3 text-center rounded border border-rose-400 font-bold">Biryani</div>
                          <div className="bg-slate-800 text-white/70 text-[7px] py-3 text-center rounded border border-white/20 font-bold">Momo</div>
                        </div>
                        <span className="block mt-2 px-2 py-1 bg-white text-slate-900 text-center rounded text-[8px] font-bold shadow">Next ➡️</span>
                      </motion.div>
                    ) : simStage === "select_date" ? (
                      <motion.div key="plan_date" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="w-full bg-white/10 backdrop-blur-md rounded-xl p-2 shadow-xl border border-white/20">
                        <h4 className="text-[9px] font-bold text-white mb-2 text-left">When are we going? 🗓️</h4>
                        <div className="bg-slate-800/80 text-white text-[8px] py-2 text-center rounded border border-rose-400/50 mb-1">Select Date</div>
                        <div className="bg-rose-500 text-white font-bold text-[8px] py-2 text-center rounded border border-rose-400 mb-2 shadow">7:00 PM</div>
                        <span className="block mt-1 px-2 py-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-center rounded text-[8px] font-bold shadow uppercase tracking-wider">Send Plan</span>
                      </motion.div>
                    ) : simStage === "summary" ? (
                      <motion.div key="plan_accept" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white/95 border-2 border-pink-200 p-2.5 rounded-xl text-center space-y-1 w-full shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-8 h-8 bg-pink-100 rounded-bl-full z-0" />
                        <div className="text-[12px] font-black text-rose-500 relative z-10 mb-1">🌸 It's a Date! 🌸</div>
                        <div className="bg-rose-50 rounded p-1 text-[7px] text-slate-700 font-bold text-left space-y-0.5 border border-rose-100">
                          <p>📍 Victoria</p>
                          <p>🍕 Biryani</p>
                          <p>🗓️ Friday, 7:00 PM</p>
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                ) : (
                  /* Romantic Love Surprise / Catch-all Fallback */
                  <div className="space-y-1 px-1">
                    <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-400/40 text-rose-400 flex items-center justify-center mx-auto shadow-md">
                      <Heart className="w-4 h-4 fill-rose-500 animate-pulse" />
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
              
              <div className="absolute bottom-4 w-[120%] left-[-10%] z-50 flex justify-center scale-50 sm:scale-75 origin-bottom">
                <RecipientActionBar 
                  url={publishedUrl || (typeof window !== "undefined" ? window.location.origin + "/p/preview" : "")}
                  recipientName={displayRecipient}
                  title={displayTitle}
                  position="absolute"
                />
              </div>
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
                  {isPremiumAccount ? "Premium Member Price 👑" : pricing.enabled ? "Special Offer Price 🏷️" : "Template Price 🏷️"}
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  {pricing.enabled && !isPremiumAccount && (
                    <span className="text-xs font-semibold text-slate-400 line-through">
                      ₹{pricing.originalPrice}
                    </span>
                  )}
                  <span className="text-xl sm:text-2xl font-black text-rose-400 tracking-tight">
                    ₹{isPremiumAccount ? 0 : pricing.specialPrice}
                  </span>
                </div>
              </div>

              {pricing.enabled && (
                <span className={`text-white font-black text-[10px] sm:text-xs px-2.5 py-1 rounded-xl uppercase tracking-wider shadow-md ${
                  isPremiumAccount 
                    ? "bg-gradient-to-r from-amber-400 to-amber-600 shadow-amber-900/50 text-slate-950" 
                    : "bg-gradient-to-r from-rose-500 to-pink-500 shadow-rose-900/50"
                }`}>
                  {isPremiumAccount ? "100% OFF" : `${pricing.discountPercent}% OFF`}
                </span>
              )}
            </div>

            {pricing.enabled && pricing.cashbackAmount > 0 && !isPremiumAccount && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-2.5 py-1.5 text-[11px] font-bold text-amber-300 flex items-center justify-between">
                <span>🎁 Post-Payment Cashback:</span>
                <span className="text-amber-200">Get ₹{pricing.cashbackAmount} back</span>
              </div>
            )}

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
                        <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
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
                    <div className="space-y-2 pt-1">
                      {/* Direct URL text box for clear visibility & easy manual copy */}
                      <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-2.5 space-y-1">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">
                          Your Live Surprise Link:
                        </span>
                        <div
                          onClick={handleCopy}
                          className="bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800 font-mono text-[11px] text-rose-300 break-all select-all cursor-pointer hover:border-rose-500/40 transition"
                          title="Click to copy"
                        >
                          {publishedUrl}
                        </div>
                      </div>

                      {/* Action buttons matching Picture 2 */}
                      <div className="flex gap-2">
                        <button
                          onClick={handleCopy}
                          className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-slate-400" />}
                          {copied ? "Copied!" : "Copy Link"}
                        </button>
                        {onShareFreeLink && (
                          <button
                            onClick={onShareFreeLink}
                            className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-900/40 cursor-pointer"
                          >
                            WhatsApp 🚀
                          </button>
                        )}
                      </div>
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
