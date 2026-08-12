"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { recordResponseAction } from "../actions";
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

const defaultDodgeStages = [
  {
    image: "https://media.giphy.com/media/MDJ9IbxxvDUQM/giphy.gif",
    fallbackImage: "https://media1.tenor.com/m/al4yRBO26akAAAAC/cat-goma.gif",
    title: "Do you love me? 🤗",
    subtext: "mvn is all yours",
  },
  {
    image: "https://media.giphy.com/media/ROF8OQvDmxytW/giphy.gif",
    fallbackImage: "https://media1.tenor.com/m/V792k7WJFAUAAAAC/peach-goma.gif",
    title: "Ek aur baar Soch lo! 🥺",
    subtext: "kyu aisa kar rahi ho Pls Maan jao 🥺",
  },
  {
    image: "https://media.giphy.com/media/OPU6wzx8JrHna/giphy.gif",
    fallbackImage: "https://media1.tenor.com/m/Z6oT-2B96JMAAAAC/cat-crying.gif",
    title: "Please think again! 😳",
    subtext: "itni jaldi na matt bolo 🥺",
  },
  {
    image: "https://media.giphy.com/media/d2lcHJTG5Tscg/giphy.gif",
    fallbackImage: "https://media1.tenor.com/m/vU334w9g5gQAAAAC/goma-cat.gif",
    title: "beautiful pls Man jao na! Kitna code likh waogi 😭",
    subtext: "bhut galat baat hai yrr 🥺",
  },
];

export default function SheCantSayNoTemplate({
  slug,
  title,
  question,
  acceptBtn,
  rejectBtn,
  recipientName,
  dodgeMessages,
}: ProposalClientProps) {
  const [stageIndex, setStageIndex] = useState(0);
  const [isAccepted, setIsAccepted] = useState(false);
  const [noBtnPosition, setNoBtnPosition] = useState<{ x: number; y: number } | null>(null);
  const [confetti, setConfetti] = useState<
    { id: number; emoji: string; left: string; duration: string; size: string }[]
  >([]);

  const yesMusicRef = useRef<HTMLAudioElement | null>(null);
  const hasViewedRef = useRef(false);

  // Custom dodge messages if passed by user
  const customDodgeList = dodgeMessages
    ? dodgeMessages.split("\n").map((m) => m.trim()).filter(Boolean)
    : [];

  useEffect(() => {
    if (!hasViewedRef.current) {
      recordResponseAction(slug, "VIEWED");
      hasViewedRef.current = true;
    }

    yesMusicRef.current = new Audio("/demos/nasamajh-lakri/yess.mp3");
    if (yesMusicRef.current) yesMusicRef.current.volume = 0.4;
  }, [slug]);

  const currentStage = defaultDodgeStages[Math.min(stageIndex, defaultDodgeStages.length - 1)];

  // Heading & Subtitle logic
  const currentTitle =
    stageIndex === 0
      ? question || title || currentStage.title
      : customDodgeList[stageIndex - 1] || currentStage.title;

  const currentSubtext =
    stageIndex === 0
      ? recipientName ? `${recipientName} is all yours` : currentStage.subtext
      : currentStage.subtext;

  const generateConfetti = () => {
    const emojis = ["💖", "🌸", "💕", "✨", "🥰", "😍", "💞", "💝", "🎉", "🌹"];
    const items = Array.from({ length: 35 }).map((_, i) => ({
      id: Date.now() + i,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      left: Math.random() * 100 + "vw",
      duration: Math.random() * 3 + 3 + "s",
      size: Math.random() * 18 + 22 + "px",
    }));
    setConfetti(items);
  };

  const handleAccept = () => {
    setIsAccepted(true);
    recordResponseAction(slug, "ACCEPTED");
    generateConfetti();

    if (yesMusicRef.current) {
      yesMusicRef.current.currentTime = 0;
      yesMusicRef.current.play().catch((e) => console.log("Audio play blocked", e));
    }
  };

  const moveNoButton = () => {
    if (typeof window === "undefined") return;
    const padding = 80;
    const maxX = window.innerWidth - 150;
    const maxY = window.innerHeight - 80;

    const randomX = Math.max(padding, Math.floor(Math.random() * maxX));
    const randomY = Math.max(padding, Math.floor(Math.random() * maxY));

    setNoBtnPosition({ x: randomX, y: randomY });
  };

  const handleReject = () => {
    recordResponseAction(slug, "REJECTED");
    const nextStage = stageIndex + 1;
    setStageIndex(nextStage);

    // If reached final stage (3+), start teleporting button away on click/hover!
    if (nextStage >= 3) {
      moveNoButton();
    }
  };

  const handleNoHover = () => {
    if (stageIndex >= 3) {
      moveNoButton();
    }
  };

  return (
    <>
    <div className="min-h-screen w-full flex items-center justify-center p-4 overflow-hidden relative font-sans bg-[#DF98A2] selection:bg-rose-200">

      {/* Falling Emoji Confetti */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {confetti.map((c) => (
          <div
            key={c.id}
            className="absolute -top-12 opacity-90 animate-fall"
            style={{
              left: c.left,
              fontSize: c.size,
              animationDuration: c.duration,
              animationName: "fall",
              animationTimingFunction: "linear",
              animationFillMode: "forwards",
            }}
          >
            {c.emoji}
          </div>
        ))}
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes fall {
          to { transform: translateY(110vh) rotate(360deg); }
        }
      `}} />

      {/* Main Content Card */}
      <div className="w-full max-w-sm sm:max-w-md flex flex-col items-center justify-center text-center z-10 px-4">
        
        {isAccepted ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="flex flex-col items-center"
          >
            <div className="w-48 h-48 sm:w-56 sm:h-56 bg-white p-3 rounded-2xl shadow-xl border-4 border-white overflow-hidden mb-6 flex items-center justify-center">
              <img
                src="https://media1.tenor.com/m/gUiu1zyxfzYAAAAC/bear-kiss-bear-hug.gif"
                alt="Celebration Love Gif"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain rounded-xl"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://media.giphy.com/media/26hpUn0CfZJd12ZQA/giphy.gif";
                }}
              />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2 drop-shadow-md">
              Yayyy! I knew you loved me! 💖🥰
            </h1>
            <p className="text-white/95 text-base sm:text-lg font-medium drop-shadow-sm">
              You can never say no! 🙈✨
            </p>
          </motion.div>
        ) : (
          <motion.div
            key={stageIndex}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col items-center w-full"
          >
            {/* Cute Sticker Box */}
            <div className="w-44 h-44 sm:w-52 sm:h-52 bg-white p-3 rounded-2xl shadow-2xl border-4 border-white/80 overflow-hidden mb-6 flex items-center justify-center">
              <img
                src={currentStage.image}
                alt="Cute Cat Sticker"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain rounded-xl"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = (currentStage as any).fallbackImage || "https://media.giphy.com/media/MDJ9IbxxvDUQM/giphy.gif";
                }}
              />
            </div>

            {/* Question Heading */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2 drop-shadow-md px-2 leading-tight">
              {currentTitle}
            </h1>

            {/* Subtitle / Recipient text */}
            <p className="text-white/90 text-xs sm:text-sm font-medium mb-6 drop-shadow-xs">
              {currentSubtext}
            </p>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-4 w-full relative min-h-[50px]">
              
              {/* YES Button */}
              <button
                onClick={handleAccept}
                className="px-8 py-3 bg-white text-[#DF98A2] font-extrabold text-base rounded-full shadow-lg hover:scale-105 active:scale-95 transition-transform duration-200 cursor-pointer border-2 border-white"
                style={{
                  transform: stageIndex >= 2 ? `scale(${1 + stageIndex * 0.1})` : "scale(1)",
                }}
              >
                {acceptBtn || "Yes"}
              </button>

              {/* NO Button (Runs Away when clicked enough) */}
              <button
                onClick={handleReject}
                onMouseEnter={handleNoHover}
                onTouchStart={handleNoHover}
                style={
                  noBtnPosition
                    ? {
                        position: "fixed",
                        left: `${noBtnPosition.x}px`,
                        top: `${noBtnPosition.y}px`,
                        zIndex: 999,
                        transition: "all 0.2s ease-out",
                      }
                    : undefined
                }
                className="px-8 py-3 bg-white/90 hover:bg-white text-slate-700 font-extrabold text-base rounded-full shadow-md hover:scale-105 transition duration-200 cursor-pointer"
              >
                {rejectBtn || "No"}
              </button>

            </div>
          </motion.div>
        )}

      </div>
    </div>

      {/* OurStory viral watermark badge */}
      <OurStoryWatermark variant="dark" templateId="she-cant-say-no" />
    </>
  );
}

