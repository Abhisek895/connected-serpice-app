"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { recordResponseAction } from "../actions";
import { Heart, Sparkles, X, MailOpen, Volume2, VolumeX, Gift, Award, Coffee } from "lucide-react";
import OurStoryWatermark from "./OurStoryWatermark";

export type ProposalClientProps = {
  slug: string;
  themeName?: string;
  title?: string;
  question?: string;
  acceptBtn?: string;
  rejectBtn?: string;
  loveMessage?: string;
  photoUrl?: string;
  demoId?: string;
  recipientName?: string;
  dodgeMessages?: string;
  patternText?: string;
  media?: any[];
};

export default function ImSorryTemplate({
  slug,
  title,
  question,
  acceptBtn,
  rejectBtn,
  loveMessage,
  recipientName,
  photoUrl: propPhotoUrl,
  media = [],
}: ProposalClientProps) {
  const [mounted, setMounted] = useState(false);
  const [isOpened, setIsOpened] = useState(false);
  const [isForgiven, setIsForgiven] = useState(false);
  const [showLetterModal, setShowLetterModal] = useState(false);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);

  // Dodging "No" button position & message
  const [noPos, setNoPos] = useState({ x: 0, y: 0 });
  const [dodgeCount, setDodgeCount] = useState(0);

  // Floating heart particles
  const [particles, setParticles] = useState<
    { id: number; x: number; y: number; size: number; color: string; emoji: string }[]
  >([]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasViewedRef = useRef(false);

  const mainTitle = title || "I'm Really Sorry... 🥺";
  const apolQuestion = question || "";
  const forgiveBtnLabel = acceptBtn || "Yes, I Forgive You 🥰";
  const stillMadBtnLabel = rejectBtn || "No 😤";
  const partnerName = recipientName || "Someone Special ✨";
  const defaultApologyNote =
    loveMessage ||
    `I am so deeply sorry for making you upset. You mean the entire world to me, and seeing you hurt breaks my heart into a million pieces.\n\nI promise to listen better, cherish you more, and make it up to you every single day. Please give me another chance to make you smile! I love you endlessly ❤️`;

  const dodgeTextArray = [
    "I brought boba tea! 🧋",
    "I promise 100 bear hugs! 🧸",
    "Look at my sad eyes 🥺",
    "Pretty please forgive me? 🌸",
    "I promise 1000 kisses! 💋",
  ];
  const currentDodgeMsg = dodgeTextArray[dodgeCount % dodgeTextArray.length];

  const sadCatGifs = [
    "/demos/im-sorry/cat-sorry1.png",
    "/demos/im-sorry/cat-sorry2.png",
    "/demos/im-sorry/cat-sorry3.png",
    "/demos/im-sorry/cat-sorry4.png",
  ];

  const uploadedImage = media?.find((m: any) => m.type === "IMAGE")?.url;
  const currentSadCatGif = sadCatGifs[dodgeCount % sadCatGifs.length];
  const displayPhoto = propPhotoUrl || uploadedImage || currentSadCatGif;
  const happyCatGif = "/demos/im-sorry/cat-happy.png";

  useEffect(() => {
    setMounted(true);

    if (!hasViewedRef.current) {
      recordResponseAction(slug, "VIEWED");
      hasViewedRef.current = true;
    }

    audioRef.current = new Audio("/demos/surprise/loveSong.mp3");
    if (audioRef.current) {
      audioRef.current.loop = true;
      audioRef.current.volume = 0.45;
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [slug]);

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlayingMusic) {
      audioRef.current.pause();
      setIsPlayingMusic(false);
    } else {
      audioRef.current.play().then(() => setIsPlayingMusic(true)).catch(() => {});
    }
  };

  const handleOpenGift = () => {
    setIsOpened(true);
    setShowLetterModal(true);
    if (audioRef.current) {
      audioRef.current.play().then(() => setIsPlayingMusic(true)).catch(() => {});
    }
  };

  const fireHeartParticles = () => {
    const emojis = ["🧋", "💖", "💕", "✨", "🌸", "🧸", "💌", "🍦"];
    const colors = ["#f472b6", "#ec4899", "#c084fc", "#fbbf24", "#38bdf8", "#34d399"];
    const newParticles = Array.from({ length: 50 }).map((_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 20 + 16,
      color: colors[i % colors.length],
      emoji: emojis[i % emojis.length],
    }));
    setParticles(newParticles);
  };

  const handleForgive = () => {
    setIsForgiven(true);
    recordResponseAction(slug, "ACCEPTED");

    fireHeartParticles();

    if (audioRef.current && !isPlayingMusic) {
      audioRef.current.play().then(() => setIsPlayingMusic(true)).catch(() => {});
    }
  };

  const handleDodgeNo = () => {
    const randomX = (Math.random() - 0.5) * 260;
    const randomY = (Math.random() - 0.5) * 200;
    setNoPos({ x: randomX, y: randomY });
    setDodgeCount((prev) => prev + 1);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen w-full bg-[#090312] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-rose-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#090312] text-white flex flex-col items-center justify-between p-4 sm:p-6 relative font-sans selection:bg-rose-500 selection:text-white overflow-hidden">
      
      {/* Keyframe Animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes floatBgSparkle {
          0% { transform: translateY(0px) rotate(0deg); opacity: 0.2; }
          50% { transform: translateY(-30px) rotate(180deg); opacity: 0.8; }
          100% { transform: translateY(0px) rotate(360deg); opacity: 0.2; }
        }
        @keyframes heartParticleFall {
          0% { transform: translateY(-20px) scale(0.5); opacity: 1; }
          100% { transform: translateY(100vh) scale(1.5); opacity: 0; }
        }
        @keyframes pulseGlint {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 15px rgba(244,63,94,0.6)); }
          50% { transform: scale(1.05); filter: drop-shadow(0 0 30px rgba(236,72,153,0.9)); }
        }
      `}} />

      {/* Floating Particle Explosion on Forgiveness */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              fontSize: `${p.size}px`,
              animation: "heartParticleFall 3.2s ease-out forwards",
            }}
          >
            {p.emoji}
          </div>
        ))}
      </div>

      {/* Ambient Pulsing Background Light */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <div className={`w-[550px] h-[550px] rounded-full blur-[140px] transition-all duration-1000 ${
          isForgiven
            ? "bg-gradient-to-tr from-emerald-600/30 via-teal-500/25 to-amber-400/30 animate-pulse"
            : "bg-gradient-to-tr from-rose-600/30 via-pink-600/25 to-purple-600/30 animate-pulse"
        }`} />
      </div>

      {/* Floating Sparkles Layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-pink-300/40 blur-[1px]"
            style={{
              width: `${(i % 4) * 2 + 3}px`,
              height: `${(i % 4) * 2 + 3}px`,
              top: `${(i * 17) % 100}%`,
              left: `${(i * 29) % 100}%`,
              animation: `floatBgSparkle ${(i % 5) + 4}s ease-in-out infinite`,
              animationDelay: `${(i % 3)}s`,
            }}
          />
        ))}
      </div>

      {/* Top Header Bar */}
      {isForgiven && (
        <div className="w-full max-w-xl flex items-center justify-start z-20 pt-2">
          <div className="flex items-center gap-2 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/15 backdrop-blur-md shadow-md">
            <Heart className="w-4 h-4 text-rose-400 fill-rose-400 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-widest text-rose-200">
              Forgiven & Loved ✨
            </span>
          </div>
        </div>
      )}

      {/* Main Interactive Stage Container */}
      <AnimatePresence mode="wait">
        {!isOpened ? (
          /* STAGE 0: UNBOXING SURPRISE PARCEL */
          <motion.div
            key="gift-unboxing-stage"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
            transition={{ duration: 0.5 }}
            className="my-auto w-full max-w-md flex flex-col items-center text-center z-20 p-6"
          >
            <div className="relative mb-8 cursor-pointer" onClick={handleOpenGift}>
              <div className="absolute inset-0 bg-rose-500/40 rounded-full blur-2xl animate-pulse" />
              <div className="relative w-40 h-40 sm:w-48 sm:h-48 bg-gradient-to-tr from-rose-950 via-pink-900 to-purple-950 rounded-3xl border-2 border-rose-300/50 shadow-[0_0_50px_rgba(244,63,94,0.7)] flex flex-col items-center justify-center p-4 transition-transform hover:scale-105 active:scale-95">
                <Gift className="w-16 h-16 sm:w-20 sm:h-20 text-rose-300 animate-bounce mb-2" />
                <span className="text-xs font-black uppercase tracking-wider text-rose-200">Special Apology Surprise</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-rose-100 mb-2 drop-shadow-md">
              {mainTitle}
            </h1>
            <p className="text-xs sm:text-sm text-rose-200/90 font-medium mb-8 max-w-xs leading-relaxed">
              I brought boba tea 🧋 and made a cute apology surprise just for you... 🥺❤️
            </p>

            <button
              onClick={handleOpenGift}
              className="px-9 py-4 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 hover:scale-108 active:scale-95 text-white font-black text-sm rounded-full shadow-[0_0_40px_rgba(244,63,94,0.8)] transition-all duration-300 flex items-center gap-3 border border-rose-200/50 tracking-wider uppercase cursor-pointer"
            >
              <Sparkles className="w-5 h-5 fill-white animate-spin" />
              <span>Tap to Open My Apology 🎁</span>
            </button>
          </motion.div>
        ) : (
          /* STAGE 1 & 2: BEGGING & FORGIVENESS STAGE */
          <div className="my-auto w-full max-w-md flex flex-col items-center text-center z-20 py-6">
            
            <AnimatePresence mode="wait">
              {!isForgiven ? (
                /* BEGGING FORGIVENESS */
                <motion.div
                  key="begging-stage"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="w-full flex flex-col items-center"
                >
                  {/* Cute Sad Begging Cat GIF */}
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-rose-500/40 rounded-full blur-2xl animate-pulse" />
                    <img
                      src={displayPhoto}
                      alt="Sad Begging Cat"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/demos/im-sorry/cat-sorry1.png";
                      }}
                      className="relative w-44 h-44 sm:w-52 sm:h-52 object-cover rounded-3xl border-2 border-rose-300/40 shadow-[0_0_40px_rgba(244,63,94,0.7)] bg-slate-950"
                    />
                  </div>

                  {/* Question Header */}
                  <h1 className={`text-2xl sm:text-3xl font-black text-rose-100 drop-shadow-md ${apolQuestion ? "mb-1" : "mb-6"}`}>
                    {mainTitle}
                  </h1>
                  {apolQuestion && (
                    <h2 className="text-sm sm:text-base font-bold text-rose-200/90 mb-6 max-w-xs">
                      {apolQuestion}
                    </h2>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full mb-6 relative">
                    {/* YES BUTTON */}
                    <button
                      onClick={handleForgive}
                      className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-rose-500 via-pink-500 to-emerald-500 hover:scale-108 active:scale-95 text-white font-black text-sm rounded-full shadow-[0_0_35px_rgba(244,63,94,0.9)] transition-all duration-300 flex items-center justify-center gap-2 border border-rose-200/50 cursor-pointer"
                    >
                      <Heart className="w-5 h-5 fill-white animate-bounce" />
                      <span>{forgiveBtnLabel}</span>
                    </button>

                    {/* RUNAWAY NO BUTTON */}
                    <motion.button
                      onPointerDown={handleDodgeNo}
                      onTouchStart={handleDodgeNo}
                      onMouseEnter={handleDodgeNo}
                      onClick={handleDodgeNo}
                      animate={{ x: noPos.x, y: noPos.y }}
                      transition={{ type: "spring", stiffness: 350, damping: 20 }}
                      className="w-full sm:w-auto px-7 py-3.5 bg-slate-900/90 hover:bg-slate-800 text-rose-300 font-black text-sm rounded-full border border-rose-500/40 shadow-lg cursor-pointer whitespace-nowrap"
                    >
                      {dodgeCount > 0 ? currentDodgeMsg : stillMadBtnLabel}
                    </motion.button>
                  </div>
                </motion.div>
              ) : (
                /* CELEBRATION FORGIVEN STAGE */
                <motion.div
                  key="forgiven-stage"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full bg-slate-950/85 border border-emerald-500/50 rounded-3xl p-6 sm:p-8 text-center shadow-2xl backdrop-blur-md relative"
                >
                  {/* Floating Boba Tea Banner Badge */}
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 font-bold text-xs mb-4">
                    <Coffee className="w-4 h-4 text-emerald-300" />
                    <span>I brought boba tea! 🧋</span>
                  </div>

                  <div className="relative mb-4">
                    <div className="absolute inset-0 bg-emerald-500/30 rounded-full blur-2xl animate-pulse" />
                    <img
                      src={happyCatGif}
                      alt="Happy Celebration Cat"
                      referrerPolicy="no-referrer"
                      className="relative w-44 h-44 mx-auto object-contain rounded-2xl"
                    />
                  </div>

                  {/* Stamp Seal Badge */}
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-400/40 text-emerald-300 font-extrabold text-[10px] uppercase tracking-wider mb-3">
                    <Award className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Forgiveness Granted ✨</span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-black text-emerald-400 mb-2">
                    Yay! You Forgave Me! 🥰🎉
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed max-w-sm mx-auto mb-2">
                    You made my heart so happy! Here's your boba tea 🧋 and 1000 bear hugs! I love you endlessly! ❤️✨
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        )}
      </AnimatePresence>

      {/* Wax-Sealed Apology Letter Modal */}
      <AnimatePresence>
        {showLetterModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              className="bg-gradient-to-br from-slate-900 via-rose-950 to-slate-950 border border-rose-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-white relative overflow-hidden"
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-5">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                  <h3 className="font-bold text-base sm:text-lg text-rose-200">A Letter From My Heart 💌</h3>
                </div>
                <button
                  onClick={() => setShowLetterModal(false)}
                  className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Letter Content Parchment Box */}
              <div className="bg-slate-950/70 p-5 rounded-2xl border border-rose-500/20 mb-6 max-h-64 overflow-y-auto leading-relaxed text-xs sm:text-sm text-slate-200 font-medium shadow-inner">
                <p className="whitespace-pre-wrap leading-relaxed">
                  {defaultApologyNote}
                </p>
              </div>

              <div className="flex justify-between items-center text-xs text-rose-300/80">
                <span>Forever Yours 💖</span>
                <button
                  onClick={() => setShowLetterModal(false)}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition shadow-md shadow-rose-900/50 cursor-pointer"
                >
                  Close Letter ✨
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* OurStory viral watermark badge */}
      <OurStoryWatermark variant="dark" templateId="im-sorry" />

    </div>
  );
}
