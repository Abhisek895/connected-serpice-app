"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { recordResponseAction } from "../actions"
import type { ProposalClientProps } from "./RomanticLoveTemplate"

const secondChanceMessages = [
  "piliiiiiizzzzzzzzzzzzzzzzzzzzz? 💔",
  "Think again, piliiiiiizzzzzzzzzzzzzzzzzzzzzzz? 🌻",
  "I really like you 🥺",
  "Give me a chance to make you smile 💫",
  "I promise to bring you chocolates 🍫",
  "Let’s create memories together 📸",
  "I will make you laugh every day 😂",
  "You deserve all the love 🌹",
  "I won't give up easily 😌",
  "piliiiiiizzzzzzzzzzzzzzzzzzzzzzz say yes this time 💖",
  "Nasamajh larki 😌🌸",
  "Your smile means everything 💛",
  "Say yes and make my day brighter ☀️",
  "You and I, best team ever? 👫",
  "I will bring coffee and care 🫶",
  "Your yes will be the best gift 🎁",
  "Your yes will make me the happiest 🌈",
  "One yes, and I’ll bring you ice cream 🍦",
  "I promise to always support you 🤝",
  "Say yes, let’s start our story together 📖",
  "Waiting for you, like coffee waits for morning ☕💕"
];

export default function NasamajhLakriTemplate({
  slug,
  title,
  question,
  acceptBtn,
  rejectBtn,
  dodgeMessages,
}: ProposalClientProps) {
  const [stage, setStage] = useState(1) // 1: Question, 2: Accepted, 3: Rejected
  const [attempt, setAttempt] = useState(0)
  const [currentQuestion, setCurrentQuestion] = useState(question || "Will you be mine? 💖")
  const [confetti, setConfetti] = useState<{ id: number, emoji: string, left: string, duration: string, size: string }[]>([])

  const messagesToUse = dodgeMessages
    ? dodgeMessages.split('\n').map(m => m.trim()).filter(Boolean)
    : secondChanceMessages;

  const startMusicRef = useRef<HTMLAudioElement | null>(null);
  const yesMusicRef = useRef<HTMLAudioElement | null>(null);
  const noMusicRef = useRef<HTMLAudioElement | null>(null);

  const hasViewedRef = useRef(false);

  useEffect(() => {
    if (!hasViewedRef.current) {
      recordResponseAction(slug, "VIEWED");
      hasViewedRef.current = true;
    }

    startMusicRef.current = new Audio('/demos/nasamajh-lakri/Start.mp3');
    yesMusicRef.current = new Audio('/demos/nasamajh-lakri/yess.mp3');
    noMusicRef.current = new Audio('/demos/nasamajh-lakri/no.mp3');

    if (startMusicRef.current) startMusicRef.current.volume = 0.3;
    if (yesMusicRef.current) yesMusicRef.current.volume = 0.3;
    if (noMusicRef.current) noMusicRef.current.volume = 0.3;
  }, [slug]);

  useEffect(() => {
    const playMusicOnInteraction = () => {
      if (startMusicRef.current && stage === 1) {
        startMusicRef.current.play().catch(e => console.log("Audio play blocked", e));
      }
      document.removeEventListener("click", playMusicOnInteraction);
    };
    document.addEventListener("click", playMusicOnInteraction);
    return () => document.removeEventListener("click", playMusicOnInteraction);
  }, [stage]);

  const generateConfetti = () => {
    const possibleEmojis = ["💖", "🌸", "💕", "💗", "❤️", "✨", "🥰", "😍", "💞", "💝"];
    const newConfetti = Array.from({ length: 30 }).map((_, i) => ({
      id: Date.now() + i,
      emoji: possibleEmojis[Math.floor(Math.random() * possibleEmojis.length)],
      left: Math.random() * 100 + "vw",
      duration: (Math.random() * 3 + 4) + "s",
      size: (Math.random() * 20 + 20) + "px"
    }));
    setConfetti(newConfetti);
  }

  const handleAccept = () => {
    setStage(2);
    recordResponseAction(slug, "ACCEPTED");

    generateConfetti();

    if (startMusicRef.current) startMusicRef.current.pause();
    if (noMusicRef.current) noMusicRef.current.pause();
    if (yesMusicRef.current) {
      yesMusicRef.current.currentTime = 0;
      yesMusicRef.current.play().catch(e => console.log("Audio play blocked", e));
    }
  };

  const handleReject = () => {
    recordResponseAction(slug, "REJECTED");

    if (attempt >= messagesToUse.length) {
      setStage(3);
      if (startMusicRef.current) startMusicRef.current.pause();
      if (yesMusicRef.current) yesMusicRef.current.pause();
      if (noMusicRef.current) {
        noMusicRef.current.currentTime = 0;
        noMusicRef.current.play().catch(e => console.log("Audio play blocked", e));
      }
    } else {
      setCurrentQuestion(messagesToUse[attempt]);
      setAttempt(attempt + 1);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center font-sans overflow-hidden bg-gradient-to-br from-[#fbc2eb] via-[#a6c1ee] to-[#fbc2eb]">

      {/* Confetti container */}
      <div className="fixed inset-0 pointer-events-none z-50">
        {confetti.map(c => (
          <div
            key={c.id}
            className="absolute -top-10 opacity-90 animate-fall"
            style={{
              left: c.left,
              fontSize: c.size,
              animationDuration: c.duration,
              animationName: 'fall',
              animationTimingFunction: 'linear',
              animationFillMode: 'forwards'
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

      <div className="bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl text-center w-[90%] max-w-md border border-white/50">

        {stage < 2 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h1 className="text-3xl font-bold text-[#e75480] mb-4">
              {title || "Hi, Nasamajh Lakri 😊"}
            </h1>
            <p className="text-xl text-[#d36c6c] mb-6">
              I have something to ask you...
            </p>
          </motion.div>
        )}



        {stage === 1 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center"
          >
            <p className="text-2xl text-[#d36c6c] font-bold mb-8">
              {currentQuestion}
            </p>
            <div className="flex flex-wrap justify-center gap-4 w-full">
              <button
                onClick={handleAccept}
                className="px-6 py-3 bg-gradient-to-br from-[#ff758c] to-[#ff7eb3] text-white font-bold rounded-xl shadow-lg hover:scale-105 transition-all"
              >
                {acceptBtn || "Yes 😍"}
              </button>
              <button
                onClick={handleReject}
                className="px-6 py-3 bg-gradient-to-br from-[#ff758c] to-[#ff7eb3] text-white font-bold rounded-xl shadow-lg hover:scale-105 transition-all"
              >
                {rejectBtn || "No 🙈"}
              </button>
            </div>
          </motion.div>
        )}

        {stage === 2 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h1 className="text-3xl font-bold text-[#e75480] mb-4">
              Yay! You made my day 💖
            </h1>
          </motion.div>
        )}

        {stage === 3 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center"
          >
            <img
              src="https://media.giphy.com/media/ROF8OQvDmxytW/giphy.gif"
              alt="Crying"
              className="w-full max-w-[300px] rounded-2xl mb-6 shadow-md"
            />
            <h1 className="text-xl font-bold text-red-500">
              💔 Heart.exe has stopped working due to excessive rejection. 💔
            </h1>
          </motion.div>
        )}
      </div>

    </div>
  )
}
