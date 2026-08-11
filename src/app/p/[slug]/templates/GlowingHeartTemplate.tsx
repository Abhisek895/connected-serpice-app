"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { recordResponseAction } from "../actions";
import { Sparkles, Heart, Volume2, VolumeX, RefreshCw, Wand2, Star, Flame } from "lucide-react";

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

type ThemeMode = "neon-ribbon" | "gold-vortex" | "cosmic-galaxy";

export default function GlowingHeartTemplate({
  slug,
  acceptBtn,
  patternText,
  recipientName,
  loveMessage,
}: ProposalClientProps) {
  const [mounted, setMounted] = useState(false);
  const [isOpened, setIsOpened] = useState(false);
  const [rotation, setRotation] = useState({ x: 12, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [themeMode, setThemeMode] = useState<ThemeMode>("neon-ribbon");
  const [isPlayingMusic, setIsPlayingMusic] = useState(true);
  const [tapSparkles, setTapSparkles] = useState<
    { id: number; x: number; y: number; emoji: string }[]
  >([]);

  const lastMousePos = useRef({ x: 0, y: 0 });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasViewedRef = useRef(false);

  const repeatingWord = patternText || "I LOVE YOU";
  const buttonLabel = acceptBtn || "Open Special Surprise 💖";

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

  const handleOpenPage = () => {
    setIsOpened(true);
    recordResponseAction(slug, "ACCEPTED");

    if (audioRef.current) {
      audioRef.current.play().then(() => setIsPlayingMusic(true)).catch(() => setIsPlayingMusic(false));
    }
  };

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlayingMusic) {
      audioRef.current.pause();
      setIsPlayingMusic(false);
    } else {
      audioRef.current.play().then(() => setIsPlayingMusic(true)).catch(() => {});
    }
  };

  // Continuous smooth 360° Auto-Rotation RAF loop
  useEffect(() => {
    if (!isOpened) return;
    let animId: number;
    const tick = () => {
      setRotation((prev) => {
        if (isDragging) return prev;
        return { ...prev, y: (prev.y + 0.45) % 360 };
      });
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isOpened, isDragging]);

  // Mouse & Touch Dragging Handlers
  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isOpened) return;
    setIsDragging(true);
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    lastMousePos.current = { x: clientX, y: clientY };

    // Tap sparkle burst
    const emojis = themeMode === "gold-vortex" 
      ? ["✨", "👑", "🌟", "💫", "🏆", "💛"]
      : themeMode === "cosmic-galaxy" 
      ? ["🌌", "⭐", "🔮", "✨", "💜", "🌙"] 
      : ["💖", "🌸", "💕", "❤️", "💞", "✨"];
      
    const newSparkle = {
      id: Date.now() + Math.random(),
      x: clientX,
      y: clientY,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
    };
    setTapSparkles((prev) => [...prev.slice(-20), newSparkle]);
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !isOpened) return;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    const deltaX = clientX - lastMousePos.current.x;
    const deltaY = clientY - lastMousePos.current.y;

    setRotation((prev) => ({
      x: Math.max(-65, Math.min(65, prev.x - deltaY * 0.4)),
      y: prev.y + deltaX * 0.5,
    }));

    lastMousePos.current = { x: clientX, y: clientY };
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen w-full bg-[#05020a] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-rose-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  // 1. Primary 3D Heart Outer Lattice (46 Points)
  const outerPointsCount = 46;
  const outerRings = Array.from({ length: outerPointsCount }).map((_, i) => {
    const t = (i / outerPointsCount) * Math.PI * 2;
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    const z = Math.sin(t * 2) * 9;

    const dx = 48 * Math.pow(Math.sin(t), 2) * Math.cos(t);
    const dy = 13 * Math.sin(t) - 10 * Math.sin(2 * t) - 6 * Math.sin(3 * t) - 4 * Math.sin(4 * t);
    
    const angleRad = Math.atan2(dy, dx);
    const angleDeg = (angleRad * 180) / Math.PI;

    let hue = (i * 8 + 320) % 360;
    if (themeMode === "gold-vortex") hue = (i * 4 + 40) % 60; // Golden Yellow
    if (themeMode === "cosmic-galaxy") hue = (i * 6 + 250) % 360; // Violet Cyan

    return {
      id: `outer-${i}`,
      x: x * 12,
      y: y * 12,
      z: z * 7.5,
      rotZ: angleDeg,
      hue,
    };
  });

  // 2. Inner 3D Helix Spiral Ring (20 Points)
  const innerPointsCount = 20;
  const innerRings = Array.from({ length: innerPointsCount }).map((_, i) => {
    const t = (i / innerPointsCount) * Math.PI * 2;
    const radius = 95;
    const x = Math.cos(t) * radius;
    const z = Math.sin(t) * radius;
    const y = Math.sin(t * 3) * 35;
    const angleDeg = (-t * 180) / Math.PI;

    let hue = (i * 15 + 340) % 360;
    if (themeMode === "gold-vortex") hue = 45;
    if (themeMode === "cosmic-galaxy") hue = 280;

    return {
      id: `inner-${i}`,
      x,
      y,
      z,
      rotZ: angleDeg,
      hue,
    };
  });

  return (
    <div
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchMove={handleMouseMove}
      onTouchEnd={handleMouseUp}
      className={`min-h-screen w-full bg-[#030108] text-white flex flex-col items-center justify-between p-4 overflow-hidden relative font-sans selection:bg-rose-500 selection:text-white ${
        isOpened ? "cursor-grab active:cursor-grabbing" : ""
      }`}
    >
      {/* Dynamic Keyframe Animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes heartbeatPulse {
          0%, 100% { transform: scale(1); }
          15% { transform: scale(1.08); }
          25% { transform: scale(1.03); }
          35% { transform: scale(1.06); }
        }

        @keyframes innerOrbitRotate {
          0% { transform: rotateY(0deg) rotateX(10deg); }
          100% { transform: rotateY(-360deg) rotateX(10deg); }
        }

        @keyframes coreGlowPulse {
          0%, 100% { transform: scale(1) rotate(0deg); filter: drop-shadow(0 0 35px #f43f5e); }
          50% { transform: scale(1.15) rotate(180deg); filter: drop-shadow(0 0 70px #ec4899); }
        }

        @keyframes floatBgStar {
          0% { transform: translateY(0px) scale(0.8); opacity: 0.2; }
          50% { transform: translateY(-50px) scale(1.3); opacity: 0.9; }
          100% { transform: translateY(0px) scale(0.8); opacity: 0.2; }
        }

        @keyframes tapPop {
          0% { transform: scale(0.3) translateY(0); opacity: 1; }
          100% { transform: scale(2) translateY(-60px); opacity: 0; }
        }

        .heart-3d-scene {
          perspective: 1200px;
          transform-style: preserve-3d;
        }

        .heart-pulse-wrapper {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          transform-style: preserve-3d;
          animation: heartbeatPulse 2.2s ease-in-out infinite;
        }

        .heart-3d-object {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          transform-style: preserve-3d;
          will-change: transform;
        }

        .love-word-ring {
          position: absolute;
          transform-style: preserve-3d;
          font-size: 1.25rem;
          font-weight: 900;
          letter-spacing: 2px;
          white-space: nowrap;
          user-select: none;
          -webkit-text-stroke: 0.7px rgba(0, 0, 0, 0.9);
          transition: color 0.4s;
        }

        .inner-helix-ring {
          position: absolute;
          transform-style: preserve-3d;
          font-size: 0.85rem;
          font-weight: 800;
          letter-spacing: 1.5px;
          white-space: nowrap;
          user-select: none;
          opacity: 0.85;
        }
      `}} />

      {/* Dynamic Ambient Background Aura */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <div 
          className={`w-[600px] h-[600px] rounded-full blur-[140px] transition-all duration-700 ${
            themeMode === "gold-vortex"
              ? "bg-gradient-to-tr from-amber-600/30 via-yellow-500/25 to-rose-500/30"
              : themeMode === "cosmic-galaxy"
              ? "bg-gradient-to-tr from-violet-600/35 via-indigo-600/30 to-fuchsia-500/35"
              : "bg-gradient-to-tr from-rose-600/40 via-purple-600/30 to-pink-500/40"
          } animate-pulse`} 
        />
      </div>

      {/* Ambient Star Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={i}
            className={`absolute rounded-full ${
              themeMode === "gold-vortex"
                ? "bg-amber-300/60"
                : themeMode === "cosmic-galaxy"
                ? "bg-cyan-300/60"
                : "bg-pink-400/60"
            } blur-[1px]`}
            style={{
              width: `${(i % 4) * 2 + 2}px`,
              height: `${(i % 4) * 2 + 2}px`,
              top: `${(i * 19) % 100}%`,
              left: `${(i * 31) % 100}%`,
              animation: `floatBgStar ${(i % 5) + 4}s ease-in-out infinite`,
              animationDelay: `${(i % 3)}s`,
            }}
          />
        ))}
      </div>

      {/* Tap Explosions Layer */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {tapSparkles.map((s) => (
          <div
            key={s.id}
            className="absolute text-3xl drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]"
            style={{
              left: `${s.x}px`,
              top: `${s.y}px`,
              animation: "tapPop 0.8s ease-out forwards",
            }}
          >
            {s.emoji}
          </div>
        ))}
      </div>

      {/* TOP FLOATING NAVIGATION BAR */}
      <div className="w-full max-w-lg z-40 flex items-center justify-between pt-2 px-2">
        {isOpened ? (
          <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md p-1.5 rounded-full border border-white/15 shadow-lg">
            <button
              onClick={() => setThemeMode("neon-ribbon")}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${
                themeMode === "neon-ribbon"
                  ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.6)]"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              <span>Neon</span>
            </button>
            <button
              onClick={() => setThemeMode("gold-vortex")}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${
                themeMode === "gold-vortex"
                  ? "bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.6)]"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Gold</span>
            </button>
            <button
              onClick={() => setThemeMode("cosmic-galaxy")}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${
                themeMode === "cosmic-galaxy"
                  ? "bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.6)]"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              <Star className="w-3.5 h-3.5" />
              <span>Cosmic</span>
            </button>
          </div>
        ) : (
          <div />
        )}

        {/* Music Control Toggle */}
        <button
          onClick={toggleMusic}
          className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 text-white shadow-lg transition-all active:scale-90 cursor-pointer"
          title="Toggle Music"
        >
          {isPlayingMusic ? (
            <Volume2 className="w-5 h-5 text-rose-400 animate-pulse" />
          ) : (
            <VolumeX className="w-5 h-5 text-gray-400" />
          )}
        </button>
      </div>

      {/* MAIN CONTENT AREA */}
      <AnimatePresence mode="wait">
        {!isOpened ? (
          /* STEP 1: ENTRY SCREEN */
          <motion.div
            key="entry-screen"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
            transition={{ duration: 0.5 }}
            className="z-30 my-auto flex flex-col items-center justify-center text-center p-6"
          >
            {/* Glowing Heart Gem Center */}
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-rose-500 rounded-full blur-3xl opacity-70 animate-ping" />
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-tr from-rose-600 via-pink-500 to-purple-600 flex items-center justify-center shadow-[0_0_60px_rgba(244,63,94,0.9)] border-2 border-rose-200/50">
                <Heart className="w-14 h-14 text-white fill-white animate-bounce" />
              </div>
            </div>

            {/* Recipient Greeting if present */}
            {recipientName && (
              <div className="mb-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/20 border border-rose-400/30 backdrop-blur-md">
                <Sparkles className="w-4 h-4 text-pink-300" />
                <span className="text-sm font-bold text-pink-200 uppercase tracking-widest">
                  For {recipientName}
                </span>
              </div>
            )}

            {/* Open Button */}
            <button
              onClick={handleOpenPage}
              className="px-9 py-4 sm:px-12 sm:py-5 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 hover:scale-108 active:scale-95 text-white font-black text-sm sm:text-base rounded-full shadow-[0_0_50px_rgba(244,63,94,0.9)] transition-all duration-300 flex items-center gap-3 border border-rose-200/50 tracking-wider uppercase cursor-pointer"
            >
              <Sparkles className="w-5 h-5 fill-white animate-spin" />
              <span>{buttonLabel}</span>
            </button>
          </motion.div>
        ) : (
          /* STEP 2: REVEALED 3D MULTI-LAYER HEART SCENE */
          <motion.div
            key="heart-scene"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full my-auto flex flex-col items-center justify-center relative"
          >
            {/* 3D Scene Frame */}
            <div className="relative w-full max-w-lg h-[420px] sm:h-[480px] flex items-center justify-center heart-3d-scene z-10">
              <div className="heart-pulse-wrapper">
                <div
                  className="heart-3d-object"
                  style={{
                    transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
                  }}
                >
                  {/* LAYER 1: Core Glowing 3D Heart Crystal */}
                  <div className="absolute z-20 flex items-center justify-center pointer-events-none">
                    <div 
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-rose-600 to-pink-400 flex items-center justify-center shadow-[0_0_50px_#f43f5e] border border-white/40"
                      style={{ animation: "coreGlowPulse 2.5s ease-in-out infinite" }}
                    >
                      <Heart className="w-8 h-8 sm:w-10 sm:h-10 text-white fill-white" />
                    </div>
                  </div>

                  {/* LAYER 2: Inner Helix Ring of Floating Love Words */}
                  {innerRings.map((pt) => (
                    <div
                      key={pt.id}
                      className="inner-helix-ring"
                      style={{
                        transform: `translate3d(${pt.x}px, ${pt.y}px, ${pt.z}px) rotateZ(${pt.rotZ}deg)`,
                        color: themeMode === "gold-vortex" ? "#fef08a" : themeMode === "cosmic-galaxy" ? "#c084fc" : "#fbcfe8",
                        textShadow: `0 0 8px ${themeMode === "gold-vortex" ? "#eab308" : themeMode === "cosmic-galaxy" ? "#a855f7" : "#ec4899"}`,
                      }}
                    >
                      💖 {repeatingWord}
                    </div>
                  ))}

                  {/* LAYER 3: Outer 3D Heart Curve Text Lattice */}
                  {outerRings.map((pt) => (
                    <div
                      key={pt.id}
                      className="love-word-ring"
                      style={{
                        transform: `translate3d(${pt.x}px, ${pt.y}px, ${pt.z}px) rotateZ(${pt.rotZ}deg)`,
                        color: "#ffffff",
                        textShadow: themeMode === "gold-vortex"
                          ? `0 2px 5px rgba(0,0,0,0.95), 0 0 6px #ffffff, 0 0 16px #eab308, 0 0 35px #f59e0b`
                          : themeMode === "cosmic-galaxy"
                          ? `0 2px 5px rgba(0,0,0,0.95), 0 0 6px #ffffff, 0 0 16px #a855f7, 0 0 35px #ec4899`
                          : `0 2px 5px rgba(0,0,0,0.95), 0 0 6px #ffffff, 0 0 16px hsl(${pt.hue}, 100%, 75%), 0 0 35px rgba(244,63,94,0.9)`,
                      }}
                    >
                      {repeatingWord}
                    </div>
                  ))}

                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BOTTOM FLOATING BADGE FOOTER */}
      {isOpened && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="z-40 pb-2 text-center flex flex-col items-center gap-1"
        >
          {loveMessage && (
            <p className="text-xs sm:text-sm font-semibold text-rose-200/90 max-w-sm px-4 bg-black/40 backdrop-blur-md py-1.5 rounded-full border border-white/10">
              "{loveMessage}"
            </p>
          )}
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-bold tracking-wider text-pink-200 uppercase shadow-lg">
            <Wand2 className="w-3.5 h-3.5 text-pink-400 animate-spin" />
            <span>Drag to rotate 3D • Tap for Sparkles</span>
          </div>
        </motion.div>
      )}

    </div>
  );
}
