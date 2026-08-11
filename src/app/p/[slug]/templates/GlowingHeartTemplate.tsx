"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { recordResponseAction } from "../actions";
import { Sparkles, Heart } from "lucide-react";

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

export default function GlowingHeartTemplate({
  slug,
  acceptBtn,
  patternText,
}: ProposalClientProps) {
  const [mounted, setMounted] = useState(false);
  const [isOpened, setIsOpened] = useState(false);
  const [rotation, setRotation] = useState({ x: 10, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [tapSparkles, setTapSparkles] = useState<
    { id: number; x: number; y: number; emoji: string }[]
  >([]);

  const lastMousePos = useRef({ x: 0, y: 0 });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasViewedRef = useRef(false);

  const repeatingWord = patternText || "i love you";
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
      audioRef.current.play().catch(() => {});
    }
  };

  // Drag interaction for 3D rotation
  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isOpened) return;
    setIsDragging(true);
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    lastMousePos.current = { x: clientX, y: clientY };

    // Tap sparkle burst
    const emojis = ["💖", "✨", "🌸", "💕", "❤️", "💞"];
    const newSparkle = {
      id: Date.now() + Math.random(),
      x: clientX,
      y: clientY,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
    };
    setTapSparkles((prev) => [...prev.slice(-15), newSparkle]);
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !isOpened) return;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    const deltaX = clientX - lastMousePos.current.x;
    const deltaY = clientY - lastMousePos.current.y;

    setRotation((prev) => ({
      x: Math.max(-60, Math.min(60, prev.x - deltaY * 0.4)),
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

  // Generate 60 points aligned along the exact parametric heart curve tangent
  const pointsCount = 60;
  const heartRings = Array.from({ length: pointsCount }).map((_, i) => {
    const t = (i / pointsCount) * Math.PI * 2;

    // Heart parametric coordinates:
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    const z = Math.sin(t * 2) * 8; // 3D depth wave

    // Tangent derivatives (dx/dt, dy/dt) to align text along heart boundary:
    const dx = 48 * Math.pow(Math.sin(t), 2) * Math.cos(t);
    const dy = 13 * Math.sin(t) - 10 * Math.sin(2 * t) - 6 * Math.sin(3 * t) - 4 * Math.sin(4 * t);
    
    // Exact tangent rotation angle in degrees
    const angleRad = Math.atan2(dy, dx);
    const angleDeg = (angleRad * 180) / Math.PI;

    // HSL Color gradient wave along heart curve
    const hue = (i * 6 + 320) % 360;

    return {
      id: i,
      x: x * 11,
      y: y * 11,
      z: z * 6,
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
      className={`min-h-screen w-full bg-[#05020a] text-white flex flex-col items-center justify-center p-4 overflow-hidden relative font-sans selection:bg-rose-500 selection:text-white ${
        isOpened ? "cursor-grab active:cursor-grabbing" : ""
      }`}
    >
      
      {/* Dynamic CSS Keyframe Animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes autoRotate3D {
          0% { transform: rotateX(15deg) rotateY(0deg); }
          50% { transform: rotateX(-10deg) rotateY(180deg); }
          100% { transform: rotateX(15deg) rotateY(360deg); }
        }

        @keyframes heartbeatPulse {
          0%, 100% { transform: scale(1); }
          15% { transform: scale(1.06); }
          25% { transform: scale(1.02); }
          35% { transform: scale(1.05); }
        }

        @keyframes textGlowPulse {
          0%, 100% { filter: brightness(1) drop-shadow(0 0 10px rgba(244,63,94,0.6)); }
          50% { filter: brightness(1.3) drop-shadow(0 0 22px rgba(236,72,153,0.9)); }
        }

        @keyframes floatBgSparkle {
          0% { transform: translateY(0px) rotate(0deg); opacity: 0.2; }
          50% { transform: translateY(-40px) rotate(180deg); opacity: 0.8; }
          100% { transform: translateY(0px) rotate(360deg); opacity: 0.2; }
        }

        @keyframes tapPop {
          0% { transform: scale(0.3) translateY(0); opacity: 1; }
          100% { transform: scale(1.8) translateY(-40px); opacity: 0; }
        }

        .heart-3d-scene {
          perspective: 1100px;
          transform-style: preserve-3d;
        }

        .heart-3d-object {
          transform-style: preserve-3d;
          animation: ${isDragging ? "none" : "autoRotate3D 20s linear infinite, heartbeatPulse 2.4s ease-in-out infinite"};
          transition: transform 0.1s ease-out;
        }

        .love-word-ring {
          position: absolute;
          transform-style: preserve-3d;
          font-size: 0.95rem;
          font-weight: 900;
          letter-spacing: 1.5px;
          white-space: nowrap;
          user-select: none;
          animation: textGlowPulse 3s ease-in-out infinite alternate;
        }
      `}} />

      {/* Ambient Radial Neon Background Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <div className="w-[550px] h-[550px] bg-gradient-to-tr from-rose-600/35 via-purple-600/25 to-pink-500/35 rounded-full blur-[130px] animate-pulse" />
      </div>

      {/* Floating Sparkle Dots */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-pink-400/50 blur-[1px]"
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

      {/* Tap Sparkles Layer */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {tapSparkles.map((s) => (
          <div
            key={s.id}
            className="absolute text-2xl"
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

      <AnimatePresence mode="wait">
        {!isOpened ? (
          /* STEP 1: INITIAL ENTRY BUTTON SCREEN */
          <motion.div
            key="entry-screen"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
            transition={{ duration: 0.5 }}
            className="z-30 flex flex-col items-center justify-center text-center p-6"
          >
            {/* Glowing Heart Icon */}
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-rose-500 rounded-full blur-2xl opacity-60 animate-ping" />
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-rose-600 to-pink-500 flex items-center justify-center shadow-[0_0_50px_rgba(244,63,94,0.8)] border border-rose-300/40">
                <Heart className="w-12 h-12 text-white fill-white animate-bounce" />
              </div>
            </div>

            {/* Glowing Action Button */}
            <button
              onClick={handleOpenPage}
              className="px-8 py-4 sm:px-10 sm:py-5 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 hover:scale-108 active:scale-95 text-white font-black text-sm sm:text-base rounded-full shadow-[0_0_40px_rgba(244,63,94,0.8)] transition-all duration-300 flex items-center gap-3 border border-rose-200/50 tracking-wider uppercase cursor-pointer"
            >
              <Sparkles className="w-5 h-5 fill-white animate-spin" />
              <span>{buttonLabel}</span>
            </button>
          </motion.div>
        ) : (
          /* STEP 2: REVEALED 3D TEXT HEART SCENE */
          <motion.div
            key="heart-scene"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full flex flex-col items-center justify-center"
          >
            {/* 3D Rotating Text Heart Container */}
            <div className="relative my-auto w-full max-w-lg h-[380px] sm:h-[450px] flex items-center justify-center heart-3d-scene z-10">
              <div
                className="heart-3d-object relative w-full h-full flex items-center justify-center"
                style={
                  isDragging
                    ? { transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` }
                    : undefined
                }
              >
                {heartRings.map((pt) => (
                  <div
                    key={pt.id}
                    className="love-word-ring"
                    style={{
                      transform: `translate3d(${pt.x}px, ${pt.y}px, ${pt.z}px) rotateZ(${pt.rotZ}deg)`,
                      color: `hsl(${pt.hue}, 90%, 75%)`,
                      textShadow: `0 0 10px hsl(${pt.hue}, 100%, 65%), 0 0 22px hsl(${pt.hue}, 100%, 55%), 0 0 40px rgba(244,63,94,0.8)`,
                    }}
                  >
                    {repeatingWord}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
