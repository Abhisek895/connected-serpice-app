"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { recordResponseAction } from "../actions"
import type { ProposalClientProps } from "./RomanticLoveTemplate"
import OurStoryWatermark from "./OurStoryWatermark"

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
  "Cute Mey 😌🌸",
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
  const [stage, setStage] = useState(0) // 0: Gateway, 1: Question, 2: Accepted, 3: Rejected
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

  const handleContinue = () => {
    setStage(1);
    if (startMusicRef.current) {
      startMusicRef.current.play().catch(e => console.log("Audio play blocked", e));
    }
  };

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
        .nasamajh-root {
          font-family: 'Segoe UI', sans-serif;
        }
        .nasamajh-container {
          text-align: center;
          background: rgba(255, 240, 245, 0.92);
          padding: 30px;
          border-radius: 20px;
          box-shadow: 0 0 30px rgba(255, 182, 193, 0.4);
          width: 90%;
          max-width: 400px;
          backdrop-filter: blur(8px);
          margin: 0 auto;
        }
        .nasamajh-h1 {
          font-size: 2em;
          margin-bottom: 10px;
          color: #e75480;
          font-weight: bold;
        }
        .nasamajh-p {
          font-size: 1.2em;
          margin-bottom: 20px;
          color: #d36c6c;
        }
        .nasamajh-btn {
          padding: 12px 20px;
          margin: 10px;
          border: none;
          background: linear-gradient(135deg, #ff758c, #ff7eb3);
          color: white;
          font-size: 1em;
          font-weight: normal;
          border-radius: 12px;
          cursor: pointer;
          transition: 0.4s, transform 0.2s, box-shadow 0.3s;
          box-shadow: 0 4px 14px rgba(255, 105, 135, 0.4);
        }
        .nasamajh-btn:hover {
          background: linear-gradient(135deg, #ff6a88, #ff99ac);
          transform: scale(1.07);
          box-shadow: 0 6px 20px rgba(255, 105, 135, 0.5);
        }
        @keyframes fall {
          to { transform: translateY(110vh) rotate(360deg); }
        }
      `}} />

      <div className="nasamajh-root nasamajh-container">

        {stage < 2 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h1 className="nasamajh-h1">
              {title || "Hi, Cute Mey 😊"}
            </h1>
            <p className="nasamajh-p">
              I have something to ask you...
            </p>
          </motion.div>
        )}

        {stage === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center mt-2"
          >
            <button
              onClick={handleContinue}
              className="nasamajh-btn"
            >
              Tap to continue 💌
            </button>
          </motion.div>
        )}

        {stage === 1 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center"
          >
            <p className="nasamajh-p font-bold mb-4" style={{ color: '#e75480' }}>
              {currentQuestion}
            </p>
            <div className="flex flex-wrap justify-center w-full">
              <button
                onClick={handleAccept}
                className="nasamajh-btn"
              >
                {acceptBtn || "Yes 😍"}
              </button>
              <button
                onClick={handleReject}
                className="nasamajh-btn"
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

      {/* OurStory viral watermark badge */}
      <OurStoryWatermark variant="dark" templateId="nasamajh-lakri" />

    </div>
  )
}
