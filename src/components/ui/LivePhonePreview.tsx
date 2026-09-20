"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Music, MousePointer2 } from "lucide-react";
import { RecipientActionBar } from "./RecipientActionBar";

// ─── Text-Art Portrait Mock (matches real RomanticLoveTemplate effect) ─────────
function SurpriseTextArtPortrait({
  src,
  phrase = "love you",
}: {
  src: string;
  phrase?: string;
}) {
  const textRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const generate = useCallback(() => {
    const img = imgRef.current;
    const wall = textRef.current;
    if (!img || !wall || !img.complete || img.naturalWidth === 0) return;
    const w = img.clientWidth;
    const h = img.clientHeight;
    const multiplier = 3;
    const charsPerLine = Math.ceil((w * multiplier) / 5);
    const totalLines = Math.ceil((h * multiplier) / 8);
    const totalChars = charsPerLine * totalLines * 1.5;
    const eff = (phrase && phrase.trim()) ? phrase.trim() : "love you";
    const rep = eff.toUpperCase() + "  ";
    wall.innerText = rep.repeat(Math.ceil(totalChars / rep.length));
  }, [phrase]);

  useEffect(() => {
    window.addEventListener("resize", generate);
    return () => window.removeEventListener("resize", generate);
  }, [generate]);

  return (
    <div style={{ position: "relative", display: "flex", width: "100%", height: "auto", overflow: "hidden" }}>
      {/* Text pixel layer */}
      <div
        ref={textRef}
        style={{
          position: "absolute",
          top: 0, left: 0,
          width: "300%", height: "300%",
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
        onLoad={generate}
        style={{
          display: "block",
          width: "100%",
          height: "auto",
          objectFit: "contain",
          position: "relative",
          zIndex: 2,
          filter: "grayscale(100%) contrast(160%) brightness(1.2)",
          mixBlendMode: "multiply",
        }}
      />
    </div>
  );
}

// ─── Romantic Surprise Animated Phone Preview ─────────────────────────────────
type SurpriseStage =
  | "landing" | "tap_heart" | "portrait" | "read_letter"
  | "continue_proposal" | "accept_clicked" | "accepted";

function RomanticSurpriseAnimatedPreview({
  photoUrl,
  patternText,
  displayTitle,
  displayMessage,
  displayQuestion,
  acceptBtn,
  rejectBtn,
}: {
  photoUrl: string;
  patternText: string;
  displayTitle: string;
  displayMessage: string;
  displayQuestion: string;
  acceptBtn: string;
  rejectBtn: string;
}) {
  const [stage, setStage] = useState<SurpriseStage>("landing");
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    let timers: NodeJS.Timeout[] = [];

    const runCycle = () => {
      setStage("landing");
      setShowConfetti(false);
      timers.push(setTimeout(() => setStage("tap_heart"), 1400));
      timers.push(setTimeout(() => setStage("portrait"), 1900));
      timers.push(setTimeout(() => setStage("read_letter"), 4200));
      timers.push(setTimeout(() => setStage("continue_proposal"), 6800));
      timers.push(setTimeout(() => setStage("accept_clicked"), 9000));
      timers.push(setTimeout(() => {
        setStage("accepted");
        setShowConfetti(true);
      }, 9400));
      timers.push(setTimeout(() => runCycle(), 14000));
    };

    runCycle();
    return () => timers.forEach(clearTimeout);
  }, []);

  // Virtual cursor target per stage
  const cursorTarget = (() => {
    switch (stage) {
      case "landing":    return { top: "62%", left: "50%", opacity: 1, scale: 1 };
      case "tap_heart":  return { top: "62%", left: "50%", opacity: 1, scale: 0.82 };
      case "portrait":   return { top: "80%", left: "30%", opacity: 1, scale: 1 };
      case "read_letter": return { top: "80%", left: "30%", opacity: 1, scale: 0.82 };
      case "continue_proposal": return { top: "80%", left: "65%", opacity: 1, scale: 1 };
      case "accept_clicked":    return { top: "78%", left: "32%", opacity: 1, scale: 0.82 };
      default: return { top: "75%", left: "50%", opacity: 0, scale: 1 };
    }
  })();

  const isDark = stage !== "landing" && stage !== "tap_heart";
  const bgClass = isDark ? "bg-black" : "bg-gradient-to-br from-rose-950 via-purple-950 to-slate-950";

  return (
    /* Outer phone frame */
    <div className="w-full max-w-[175px] sm:max-w-[210px] bg-slate-950 p-2 rounded-[30px] shadow-2xl border-4 border-slate-800 relative mx-auto">
      {/* Dynamic Island */}
      <div className="absolute top-1 left-1/2 -translate-x-1/2 w-14 h-3 bg-black rounded-full z-20 flex items-center justify-center pointer-events-none">
        <div className="w-1.5 h-1.5 rounded-full bg-slate-900/80 mr-1.5" />
        <div className="w-1 h-1 rounded-full bg-blue-900/80" />
      </div>

      {/* Screen */}
      <div className={`w-full h-[270px] sm:h-[330px] rounded-[22px] overflow-hidden relative text-white text-center shadow-inner transition-colors duration-500 ${bgClass}`}>

        {/* Ambient glow (landing only) */}
        {!isDark && (
          <>
            <div className="absolute -top-8 -left-8 w-24 h-24 bg-rose-500/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />
          </>
        )}

        {/* Virtual cursor */}
        <motion.div
          className="absolute z-40 pointer-events-none"
          animate={cursorTarget}
          transition={{ duration: 0.55, ease: "easeInOut" }}
        >
          <div className="relative">
            <MousePointer2 className="w-4 h-4 text-white fill-slate-900 drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]" />
            {(stage === "tap_heart" || stage === "read_letter" || stage === "accept_clicked") && (
              <motion.span
                initial={{ scale: 0.5, opacity: 1 }}
                animate={{ scale: 1.8, opacity: 0 }}
                className="absolute -top-1 -left-1 w-6 h-6 rounded-full bg-rose-400/50 border border-white"
              />
            )}
          </div>
        </motion.div>

        {/* Content */}
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">

          {/* ── STAGE 0/1: Landing ── */}
          <AnimatePresence mode="wait">
            {(stage === "landing" || stage === "tap_heart") && (
              <motion.div
                key="landing"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                className="flex flex-col items-center justify-center gap-3 px-3 w-full"
              >
                <motion.div
                  animate={{ scale: [1, 1.09, 1] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                  className="w-14 h-14 rounded-full bg-gradient-to-tr from-rose-600 via-pink-500 to-purple-600 flex items-center justify-center shadow-[0_0_36px_rgba(244,63,94,0.75)] border-2 border-rose-300/50"
                >
                  <Heart className="w-7 h-7 text-white fill-white" />
                </motion.div>
                <h4 className="text-[10px] sm:text-[11px] font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-200 via-pink-200 to-purple-200 leading-tight px-2">
                  {displayTitle}
                </h4>
                <motion.span
                  animate={stage === "tap_heart" ? { scale: 0.9, backgroundColor: "rgba(244,63,94,0.95)" } : { scale: 1 }}
                  className="px-4 py-1.5 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-full text-[8px] sm:text-[9px] font-black shadow-lg border border-rose-300/40"
                >
                  Open Surprise 💌
                </motion.span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── STAGE 2/3: Portrait + Letter ── */}
          {(stage === "portrait" || stage === "read_letter") && (
            <motion.div
              key="portrait"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center overflow-hidden"
            >
              {/* Full portrait fills screen */}
              <div className="w-full h-full flex items-center justify-center overflow-hidden pb-10">
                <SurpriseTextArtPortrait
                  src={photoUrl}
                  phrase={patternText}
                />
              </div>

              {/* Read letter button (bottom) */}
              {stage === "portrait" && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute bottom-9 left-0 right-0 flex justify-center gap-2 z-20 px-4"
                >
                  <span className="px-3 py-1 bg-white/90 text-rose-600 rounded-full text-[8px] font-bold shadow-md">
                    💌 Read My Message
                  </span>
                  <span className="px-3 py-1 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-full text-[8px] font-bold shadow-md">
                    💖 Continue
                  </span>
                </motion.div>
              )}

              {/* Love letter popup */}
              <AnimatePresence>
                {stage === "read_letter" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.82 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.82 }}
                    className="absolute inset-x-3 top-1/2 -translate-y-1/2 z-30 bg-white/97 backdrop-blur-md rounded-xl p-2.5 text-slate-900 flex flex-col items-center text-center shadow-2xl border border-white/70"
                    style={{ fontFamily: "'Dancing Script', cursive" }}
                  >
                    <span className="text-[8px] font-extrabold text-rose-500 uppercase tracking-wider mb-0.5" style={{ fontFamily: "sans-serif" }}>
                      💌 Message for you
                    </span>
                    <p className="text-[9px] font-medium leading-tight line-clamp-4">"{displayMessage}"</p>
                    <span className="text-[7px] text-slate-400 mt-1 font-bold" style={{ fontFamily: "sans-serif" }}>(Tap note to close)</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Continue button when letter open */}
              {stage === "read_letter" && (
                <div className="absolute bottom-9 left-0 right-0 flex justify-center z-20">
                  <span className="px-3 py-1 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-full text-[8px] font-bold shadow-md">
                    💖 Continue
                  </span>
                </div>
              )}
            </motion.div>
          )}

          {/* ── STAGE 4/5: Proposal question ── */}
          <AnimatePresence mode="wait">
            {(stage === "continue_proposal" || stage === "accept_clicked") && (
              <motion.div
                key="proposal"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center gap-3 px-3"
              >
                <h4 className="text-[10px] sm:text-[11px] font-black text-rose-300 leading-tight px-1">
                  {displayQuestion}
                </h4>
                <div className="flex gap-2 justify-center">
                  <motion.span
                    animate={stage === "accept_clicked" ? { scale: 0.92 } : { scale: 1 }}
                    className={`px-3 py-1.5 text-[8px] rounded-full font-black shadow-md transition-all ${
                      stage === "accept_clicked"
                        ? "bg-emerald-500 text-white ring-2 ring-emerald-300"
                        : "bg-gradient-to-r from-rose-500 to-pink-500 text-white"
                    }`}
                  >
                    {acceptBtn}
                  </motion.span>
                  <span className="px-3 py-1.5 text-[8px] bg-white/15 text-white rounded-full font-bold border border-white/20">
                    {rejectBtn}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── STAGE 6: Accepted ── */}
          <AnimatePresence mode="wait">
            {stage === "accepted" && (
              <motion.div
                key="accepted"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mx-3 bg-gradient-to-r from-rose-500/40 to-pink-500/40 backdrop-blur-md border border-rose-400/50 p-3 rounded-xl text-center space-y-1.5"
              >
                <div className="text-[11px] font-black text-rose-200">💖 She Said Yes! 💖</div>
                <p className="text-[8px] text-pink-100 font-semibold line-clamp-2 leading-tight">
                  "{displayMessage}"
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* iPhone Home Bar */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-16 h-0.5 bg-white/30 rounded-full z-30" />
      </div>
    </div>
  );
}

// ─── Main LivePhonePreview ─────────────────────────────────────────────────────

interface LivePhonePreviewProps {
  demoId: string;
  formValues: Record<string, string>;
  defaultData: Record<string, any>;
  currentStep?: number;
}

export default function LivePhonePreview({ demoId, formValues, defaultData, currentStep = 0 }: LivePhonePreviewProps) {
  const [showLetterPreview, setShowLetterPreview] = useState(false);

  const isBirthday = demoId === "birthday-wish";
  const isPlanner = demoId.includes("planner");
  const isSurprise = demoId === "surprise";
  const isApology = demoId === "im-sorry" || demoId === "apology";
  const isPuja = demoId === "durga-puja" || demoId === "puja";

  const displayTitle = formValues["title"] || defaultData["title"] || "A Surprise For You... 😊";
  const displayRecipient = formValues["recipientName"] || defaultData["recipientName"] || "Someone Special ✨";
  const displayQuestion = formValues["question"] || defaultData["question"] || "Will you be mine? 💖";
  const displayMessage = formValues["loveMessage"] || defaultData["loveMessage"] || "A little surprise from someone who truly cares…";
  const patternText = (formValues["patternText"] && formValues["patternText"].trim()) ? formValues["patternText"].trim() : (defaultData["patternText"] || "love you");
  const acceptBtn = formValues["acceptBtn"] || defaultData["acceptBtn"] || (isBirthday ? "Love ❤️" : "Yes! 😍");
  const rejectBtn = formValues["rejectBtn"] || defaultData["rejectBtn"] || (isBirthday ? "Hate 💔" : "No 🙈");
  const hasCustomAudio = Boolean(formValues["_audio"] || formValues["audioUrl"]);

  const userBirthdayPhotos = [
    formValues["_photo"],
    formValues["photoUrl"],
    formValues["_photo1"],
    formValues["_photo2"],
    formValues["_photo3"],
  ].filter(Boolean) as string[];

  const [bdaySlideIndex, setBdaySlideIndex] = useState(0);
  useEffect(() => {
    if (userBirthdayPhotos.length <= 1) return;
    const interval = setInterval(() => {
      setBdaySlideIndex((idx) => (idx + 1) % userBirthdayPhotos.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [userBirthdayPhotos.length]);

  const activeBdayPhoto = userBirthdayPhotos.length > 0
    ? userBirthdayPhotos[bdaySlideIndex % userBirthdayPhotos.length]
    : defaultData["_photo"] || defaultData["photo"] || "/demos/birthday-wish/s0.jpeg";

  const photoUrl = formValues["_photo"] || formValues["_photo1"] || formValues["photoUrl"] || defaultData["_photo"] || defaultData["photo"] || "/demos/surprise/cute_woman.png";

  const isStep2 = currentStep === 1;

  // ── Romantic Surprise: render full animated simulation in place of the phone ──
  if (isSurprise) {
    return (
      <div className="w-full flex flex-col items-center select-none gap-2">
        {/* Label */}
        <div className="text-center">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            📱 Live Recipient Preview
          </p>
          <p className="text-[9px] text-slate-400 font-medium mt-0.5">
            Auto-simulating exactly what they'll see ✨
          </p>
        </div>

        {/* Custom audio badge */}
        {hasCustomAudio && (
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-[9px] font-bold">
            <Music className="w-2.5 h-2.5 animate-pulse" />
            Custom Audio Attached 🎵
          </div>
        )}

        {/* The animated phone mockup */}
        <RomanticSurpriseAnimatedPreview
          photoUrl={photoUrl}
          patternText={patternText}
          displayTitle={displayTitle}
          displayMessage={displayMessage}
          displayQuestion={displayQuestion}
          acceptBtn={acceptBtn}
          rejectBtn={rejectBtn}
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-[280px] mx-auto select-none">
      {/* Outer Phone Frame */}
      <div className="bg-slate-900 p-3 rounded-[38px] shadow-2xl border-4 border-slate-800 relative">
        {/* Dynamic Island / Notch */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-4 bg-black rounded-full z-20 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-900/80 mr-3" />
          <div className="w-1.5 h-1.5 rounded-full bg-blue-900/80" />
        </div>

        {/* Screen */}
        <div className={`w-full h-[480px] rounded-[30px] overflow-hidden relative flex flex-col justify-between p-4 pt-10 text-white text-center shadow-inner transition-all duration-300 ${
          isPuja ? "bg-[#161413]" : "bg-gradient-to-br from-purple-950 via-rose-900 to-slate-950"
        }`}>

          {/* Custom audio active indicator */}
          {hasCustomAudio && (
            <div className="absolute top-8 left-1/2 -translate-x-1/2 z-30 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-rose-500/40 text-[8px] font-semibold text-rose-300 flex items-center gap-1 shadow-sm whitespace-nowrap">
              <Music className="w-2.5 h-2.5 text-rose-400 animate-pulse" />
              <span>Custom Audio Attached 🎵</span>
            </div>
          )}

          {/* Ambient Glow */}
          {!isPuja && (
            <>
              <div className="absolute -top-12 -left-12 w-36 h-36 bg-pink-500/35 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute top-1/2 -right-12 w-36 h-36 bg-amber-400/25 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-40 h-40 bg-purple-500/35 rounded-full blur-2xl pointer-events-none" />
            </>
          )}

          {isPuja && (
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-40 h-40 bg-[#C0422B]/20 rounded-full blur-2xl pointer-events-none" />
          )}

          {/* Content Body */}
          {isPuja ? (
            <div className="relative z-10 h-full w-full flex flex-col justify-between py-2 px-1 text-center">
              <div className="space-y-2 mt-4">
                <span className="text-[10px] text-[#D4AF37] uppercase tracking-widest block font-medium">
                  Autumn • Sharodiya
                </span>
                <h4 className="text-xl font-bold text-[#FDFBF7] font-serif">
                  শুভ শারদীয়া 🌺
                </h4>
                <p className="text-[10px] text-[#D4AF37] italic">
                  For {displayRecipient}
                </p>
              </div>

              {isStep2 ? (
                <div className="bg-[#FAF7F0] text-[#161413] rounded-2xl p-3 shadow-lg border border-[#D4AF37]/40 text-left space-y-1.5">
                  <span className="text-[9px] font-bold text-[#C0422B] uppercase tracking-wider block">
                    Personal Note
                  </span>
                  <p className="text-[10px] italic leading-snug line-clamp-4 text-[#161413]/90">
                    &ldquo;{displayMessage}&rdquo;
                  </p>
                  <div className="pt-1 text-[9px] font-bold text-[#631726]">
                    Menu: <span className="font-normal text-[#161413]/80">{formValues["foodOptions"] || "Phuchka, Biryani, Momos"}</span>
                  </div>
                </div>
              ) : (
                <div className="bg-[#24201D] border border-[#D4AF37]/30 rounded-2xl p-3 text-center space-y-2">
                  <p className="text-[10.5px] text-[#FDFBF7]/90 font-serif italic">
                    &ldquo;আমার সাথে পুজোয় যাবে?&rdquo;
                  </p>
                  <div className="flex gap-2 justify-center pt-1">
                    <span className="px-3 py-1 text-[9px] bg-[#631726] border border-[#D4AF37]/40 text-white rounded-full font-bold">
                      হ্যাঁ, যাবো ❤️
                    </span>
                    <span className="px-2.5 py-1 text-[9px] bg-[#2E2926] text-white/70 rounded-full">
                      একটু ভাবি... 🌸
                    </span>
                  </div>
                </div>
              )}

              <div className="text-[9px] text-[#FDFBF7]/40 pb-4">
                Bengal After Dusk • Experience
              </div>
            </div>
          ) : isBirthday ? (
            <div className="relative z-10 h-full w-full flex flex-col justify-center items-center py-2 px-1">
              {/* Glass Card Container (Matches Real Birthday Card & Photos) */}
              <div className="w-full bg-rose-950/40 backdrop-blur-xl border border-rose-300/30 rounded-2xl p-2 sm:p-2.5 shadow-2xl flex flex-col items-center text-center space-y-2">
                {/* 1. Photo Container */}
                <div className="relative w-full h-[130px] sm:h-[140px] rounded-xl overflow-hidden shadow-md bg-slate-950">
                  <img
                    src={activeBdayPhoto}
                    alt="Birthday Photo"
                    className="w-full h-full object-cover object-[center_35%] transition-opacity duration-500"
                  />
                </div>

                {/* 2. Heading BELOW photo box */}
                <h4 className="text-xs font-bold text-white font-serif tracking-tight leading-snug px-1 text-left w-full">
                  Happy Birthday, <span className="text-rose-300 font-extrabold">{displayRecipient} ✨</span> 🦋 💖
                </h4>

                {/* 3. Subtitle BELOW heading */}
                <p className="text-[9px] text-rose-100/90 font-medium text-left w-full">
                  A little surprise from someone who truly cares…
                </p>

                {/* 4. Live Message Box */}
                <div className="w-full bg-white/5 rounded-lg p-1.5 text-left border border-white/10">
                  <p className="text-[9.5px] text-white font-medium leading-relaxed">
                    {displayMessage}
                    <span className="animate-pulse text-white/80"> |</span>
                  </p>
                </div>
              </div>
            </div>
          ) : isApology ? (
            isStep2 ? (
              /* Apology Template Step 2 Preview: Exact 'A Letter From My Heart' Modal Card */
              <div className="relative z-10 my-auto w-full px-1">
                <div className="bg-gradient-to-br from-slate-900 via-rose-950 to-slate-950 border border-rose-500/50 rounded-2xl p-3 text-white shadow-2xl space-y-2 text-left">
                  {/* Header */}
                  <div className="flex justify-between items-center border-b border-rose-500/20 pb-1.5">
                    <h5 className="font-bold text-[11px] text-rose-200 flex items-center gap-1">
                      <span>A Letter From My Heart 💌</span>
                    </h5>
                    <span className="text-[10px] text-slate-400">✕</span>
                  </div>

                  {/* Letter Content Box */}
                  <div className="bg-slate-950/80 p-2.5 rounded-xl border border-rose-500/25 max-h-[160px] overflow-y-auto">
                    <p className="text-[9px] leading-relaxed text-slate-200 font-medium whitespace-pre-wrap">
                      {displayMessage}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="flex justify-between items-center pt-1 text-[8.5px]">
                    <span className="text-rose-300 font-bold">Forever Yours 💖</span>
                    <span className="px-2.5 py-1 bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold rounded-lg shadow-md">
                      Close Letter & Continue 💌
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* Apology Template Step 1 Preview: Front Parcel Unboxing Page */
              <div className="relative z-10 my-auto space-y-3 px-1 text-center">
                <div className="relative w-24 h-24 mx-auto bg-gradient-to-tr from-rose-950 via-pink-900 to-purple-950 rounded-2xl border border-rose-300/40 shadow-xl flex flex-col items-center justify-center p-2">
                  <span className="text-2xl animate-bounce">🎁</span>
                </div>

                <h4 className="text-sm font-bold text-white tracking-tight drop-shadow">
                  {displayTitle}
                </h4>

                <div className="flex justify-center pt-1">
                  <span className="px-4 py-1.5 text-[9.5px] rounded-full font-bold bg-gradient-to-r from-rose-500 to-purple-600 text-white shadow-md tracking-wider uppercase">
                    Tap Here 💖
                  </span>
                </div>
              </div>
            )
          ) : isStep2 ? (
            /* Step 2 View for Dodge / Planner / Media templates */
            <div className="relative z-10 my-auto space-y-3 px-1 w-full text-center">
              {isPlanner ? (
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 text-white space-y-2">
                  <span className="text-xs font-bold text-rose-300 block">🌸 Menu & Date Plan Summary</span>
                  <div className="bg-black/40 rounded-xl p-2 text-left space-y-1 text-[9.5px]">
                    <p className="text-rose-200 font-bold">🍔 Food Menu:</p>
                    <p className="text-slate-300 truncate">{formValues["foodOptions"] || defaultData["foodOptions"] || "Biryani, Momo, Fuchka"}</p>
                    <p className="text-rose-200 font-bold pt-1">📍 Activities:</p>
                    <p className="text-slate-300 truncate">{formValues["activityOptions"] || defaultData["activityOptions"] || "Victoria Walk, Boat Ride"}</p>
                  </div>
                </div>
              ) : (
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 text-white space-y-2">
                  <span className="text-xs font-bold text-rose-300 block">😜 Dodging 'No' Messages Preview</span>
                  <div className="bg-black/50 rounded-xl p-2 text-left text-[9.5px] text-rose-100 space-y-1 max-h-[120px] overflow-y-auto font-mono">
                    {(formValues["dodgeMessages"] || defaultData["dodgeMessages"] || "Think again! 🥺")
                      .split("\n")
                      .map((msg: string, idx: number) => (
                        <p key={idx} className="truncate">▪ {msg}</p>
                      ))}
                  </div>
                </div>
              )}

              {photoUrl && (
                <div className="w-16 h-16 rounded-xl overflow-hidden mx-auto border border-white/30 shadow-md">
                  <img src={photoUrl} alt="Uploaded Media" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          ) : (
            /* Step 1 / Cover View for other templates */
            <div className="relative z-10 my-auto space-y-3 px-1">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-400/40 text-rose-400 flex items-center justify-center mx-auto shadow-lg shadow-rose-950/50">
                {isPlanner ? (
                  <span className="text-xl">🌸</span>
                ) : (
                  <Heart className="w-6 h-6 fill-rose-500 animate-pulse" />
                )}
              </div>

              <h4 className="text-base font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-200 via-pink-200 to-purple-200 leading-tight">
                {displayTitle}
              </h4>

              <p className="text-xs font-medium text-rose-300/90 truncate">
                For: <span className="font-bold text-white">{displayRecipient}</span>
              </p>

              {isPlanner ? (
                <div className="bg-white/10 backdrop-blur-md border border-white/15 p-2.5 rounded-xl text-[11px] text-rose-100 leading-snug">
                  {displayQuestion}
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold text-rose-200 leading-snug">
                    "{displayQuestion}"
                  </p>
                  <div className="flex gap-2 justify-center pt-1">
                    <span className="px-3 py-1 text-[10px] bg-rose-500 text-white rounded-full font-bold shadow-sm">
                      {acceptBtn}
                    </span>
                    <span className="px-3 py-1 text-[10px] bg-white/20 text-white rounded-full font-medium border border-white/20">
                      {rejectBtn}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* iPhone Home Bar */}
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-24 h-1 bg-white/40 rounded-full" />

          <div className="absolute bottom-6 w-full left-0 z-50 flex justify-center scale-90">
            <RecipientActionBar
              url={typeof window !== "undefined" ? window.location.origin + "/p/preview" : ""}
              recipientName={displayRecipient}
              title={displayTitle}
              position="absolute"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
