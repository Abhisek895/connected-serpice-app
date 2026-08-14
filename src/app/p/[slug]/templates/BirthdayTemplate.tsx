"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { recordResponseAction } from "../actions"
import type { ProposalClientProps } from "./RomanticLoveTemplate"
import OurStoryWatermark from "./OurStoryWatermark"

// ─── Canvas Confetti ──────────────────────────────────────────────────────────
type Piece = { x: number; y: number; vy: number; size: number; color: string };

function useConfetti(active: boolean) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pieces = useRef<Piece[]>([]);
  const raf = useRef<number>(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.current.forEach((p) => {
      p.y += p.vy;
      if (p.y > canvas.height) p.y = -10;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size * 0.6);
    });
    raf.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    pieces.current = Array.from({ length: 150 }).map(() => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vy: 1 + Math.random() * 2,
      size: 5 + Math.random() * 6,
      color: ["#ff9cc6", "#ffd6e8", "#ff6b9a", "#ffffff"][Math.floor(Math.random() * 4)],
    }));
    raf.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener("resize", resize);
    };
  }, [active, draw]);

  return canvasRef;
}

// ─── Typewriter ───────────────────────────────────────────────────────────────
function useTypewriter(text: string, active: boolean, speed = 28) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    if (!active || !text) return;
    setDisplayed("");
    let i = 0;
    const iv = setInterval(() => {
      setDisplayed((prev) => prev + text.charAt(i));
      i++;
      if (i >= text.length) clearInterval(iv);
    }, speed);
    return () => clearInterval(iv);
  }, [active, text, speed]);
  return displayed;
}

// ─── Slideshow ────────────────────────────────────────────────────────────────
function useSlideshow(photos: string[], active: boolean, interval = 3000) {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    if (!active || photos.length <= 1) return;
    const iv = setInterval(() => setCurrent((c) => (c + 1) % photos.length), interval);
    return () => clearInterval(iv);
  }, [active, photos.length, interval]);
  return current;
}

// ─── BirthdayTemplate ─────────────────────────────────────────────────────────
export default function BirthdayTemplate({
  slug,
  title,
  question,
  acceptBtn,
  rejectBtn,
  loveMessage,
  recipientName,
  media,
}: ProposalClientProps) {
  // 0 = entry, 1 = card, 2 = hate
  const [stage, setStage] = useState<0 | 1 | 2>(0);
  const [showMessage, setShowMessage] = useState(false);
  const hasViewedRef = useRef(false);

  useEffect(() => {
    if (!hasViewedRef.current) {
      recordResponseAction(slug, "VIEWED");
      hasViewedRef.current = true;
    }
  }, [slug]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    audioRef.current = new Audio("/demos/birthday-wish/hbd.mp3");
    return () => { audioRef.current?.pause(); };
  }, []);

  // Media
  const uploadedImages = media.filter((m) => m.type === "IMAGE").map((m) => m.url);
  const uploadedAudio = media.find((m) => m.type === "AUDIO");
  const defaultPhotos = [
    "/demos/birthday-wish/s0.jpeg",
    "/demos/birthday-wish/s1.jpeg",
    "/demos/birthday-wish/s2.jpeg",
    "/demos/birthday-wish/s3.jpeg",
    "/demos/birthday-wish/s4.jpeg",
    "/demos/birthday-wish/s5.jpeg",
  ];
  const photos = uploadedImages.length > 0 ? uploadedImages : defaultPhotos;
  const audioSrc = uploadedAudio ? uploadedAudio.url : "/demos/birthday-wish/hbd.mp3";

  const activeSlide = useSlideshow(photos, stage === 1);
  const confettiRef = useConfetti(stage === 1);

  const displayMessage =
    loveMessage ||
    "Happy Birthday! 🎂✨ I hope today makes you smile as much as you make everyone around you smile. You deserve all the happiness, good food, and unforgettable moments today. Stay the amazing person you are. And...I hope I get to steal a little of your time to celebrate with you someday. 😉❤️";

  const typedMessage = useTypewriter(displayMessage, showMessage);

  const displayRecipient = recipientName || "My Love";
  const displayTitle = title || "Happy Birthday";
  const displayQuestion = question || "Wishing you the happiest birthday! 🎂";
  const displayAcceptBtn = acceptBtn || "Love ❤️";
  const displayRejectBtn = rejectBtn || "Hate 💔";

  const handleLove = () => {
    setStage(1);
    recordResponseAction(slug, "ACCEPTED");
    const audio = new Audio(audioSrc);
    audio.play().catch(() => {});
  };

  const handleHate = () => {
    setStage(2);
    recordResponseAction(slug, "REJECTED");
  };

  return (
    <>
      {/* Global styles injected inline */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600&family=Poppins:wght@300;500;700&display=swap');

        .bday-body {
          min-height: 100vh;
          padding: 20px 0;
          font-family: 'Poppins', sans-serif;
          background: 
            radial-gradient(circle at 20% 20%, rgba(255, 77, 143, 0.45), transparent 55%),
            radial-gradient(circle at 80% 25%, rgba(255, 180, 80, 0.35), transparent 55%),
            radial-gradient(circle at 50% 80%, rgba(180, 70, 255, 0.4), transparent 60%),
            linear-gradient(135deg, #33082b 0%, #520f3c 35%, #350a54 70%, #1a062d 100%);
          animation: bdayBgShift 10s ease-in-out infinite alternate;
          color: #fff6fa;
          overflow-x: hidden;
          overflow-y: auto;
          position: relative;
        }
        @keyframes bdayBgShift {
          0% { filter: hue-rotate(0deg) brightness(1); }
          50% { filter: hue-rotate(15deg) brightness(1.15); }
          100% { filter: hue-rotate(30deg) brightness(1.05); }
        }

        .bday-entry {
          position: fixed;
          inset: 0;
          background: rgba(15, 4, 18, 0.65);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          z-index: 20;
          text-align: center;
          backdrop-filter: blur(14px);
          animation: bdayFadeIn 1s ease forwards;
        }
        @keyframes bdayFadeIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
        .bday-entry h2 {
          color: #fff6fa;
          font-size: 26px;
          margin-bottom: 20px;
          font-family: 'Playfair Display', serif;
        }
        .bday-btn {
          display: inline-flex;
          justify-content: center;
          align-items: center;
          padding: 12px 18px;
          border-radius: 12px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          margin: 8px;
          font-size: 16px;
        }
        .bday-btn-primary {
          background: linear-gradient(90deg, #ff6b9a, #ffa8d6);
          color: #2c0f1c;
          box-shadow: 0 0 15px rgba(255,107,154,0.4);
        }
        .bday-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 30px rgba(255,107,154,0.6);
        }
        .bday-btn-ghost {
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.15);
          color: #fff;
        }
        .bday-btn-ghost:hover {
          background: rgba(255,255,255,0.15);
          transform: translateY(-2px);
        }

        .bday-card {
          width: 100%;
          max-width: 720px;
          background: rgba(255, 255, 255, 0.09);
          backdrop-filter: blur(20px) saturate(160%);
          border-radius: 24px;
          box-shadow: 0 15px 50px rgba(255, 77, 143, 0.35), 0 0 90px rgba(255, 105, 180, 0.2);
          padding: 26px;
          position: relative;
          z-index: 2;
          border: 1px solid rgba(255, 255, 255, 0.2);
          overflow: hidden;
          text-align: center;
          animation: bdayFadeIn 1.5s ease forwards;
          margin: 24px auto;
        }
        .bday-slideshow {
          width: 100%;
          height: 280px;
          border-radius: 18px;
          overflow: hidden;
          position: relative;
          box-shadow: 0 0 24px rgba(0,0,0,0.4);
          margin-bottom: 20px;
        }
        .bday-slide {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: 50% 35%;
          opacity: 0;
          transition: opacity 1.5s ease-in-out, transform 5s ease-in-out;
          transform: scale(1.1);
        }
        .bday-slide.active {
          opacity: 1;
          transform: scale(1);
        }
        .bday-card h1 {
          font-family: 'Playfair Display', serif;
          font-size: 30px;
          color: #fff;
          margin-bottom: 6px;
        }
        .bday-card .name { color: #ff6b9a; }
        .bday-subtitle {
          font-size: 15px;
          color: rgba(255,255,255,0.85);
          margin-bottom: 10px;
        }
        .bday-message {
          font-size: 16px;
          line-height: 1.6;
          color: rgba(255,255,255,0.95);
          min-height: 100px;
          margin-top: 8px;
          text-align: left;
          white-space: pre-wrap;
        }
        .bday-hate {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.85);
          color: #fff;
          font-size: 26px;
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 30;
          text-align: center;
          padding: 20px;
          font-family: 'Playfair Display', serif;
          animation: bdayFadeIn 0.8s ease forwards;
        }

        @media (max-width: 640px) {
          .bday-card { padding: 18px; max-width: 100%; }
          .bday-slideshow { height: 200px; }
          .bday-entry h2 { font-size: 22px; }
          .bday-card h1 { font-size: 24px; text-align: left; }
          .bday-subtitle { text-align: left; }
          .bday-message { font-size: 15px; text-align: left; }
        }
        @media (max-width: 480px) {
          .bday-slideshow { height: 180px; }
          .bday-card h1 { font-size: 22px; }
        }
      `}</style>

      <div className="bday-body">
        {/* Canvas confetti */}
        <canvas
          ref={confettiRef}
          style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1 }}
        />

        {/* Entry screen */}
        <AnimatePresence>
          {stage === 0 && (
            <motion.div
              className="bday-entry"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h2>{displayTitle} ❤️</h2>
              <p style={{ color: "rgba(255,255,255,0.7)", marginBottom: 20, fontSize: 15 }}>
                {displayQuestion}
              </p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
                <button className="bday-btn bday-btn-primary" onClick={handleLove}>
                  {displayAcceptBtn}
                </button>
                <button className="bday-btn bday-btn-ghost" onClick={handleHate}>
                  {displayRejectBtn}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Birthday card */}
        <AnimatePresence>
          {stage === 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              style={{ display: "flex", justifyContent: "center", padding: "0 16px" }}
            >
              <div className="bday-card">
                {/* Slideshow */}
                <div className="bday-slideshow">
                  {photos.map((src, i) => (
                    <img
                      key={src}
                      src={src}
                      className={`bday-slide ${i === activeSlide ? "active" : ""}`}
                      alt={`Birthday photo ${i + 1}`}
                    />
                  ))}
                </div>

                <h1>
                  Happy Birthday, <span className="name">{displayRecipient} 🦋</span> 💖
                </h1>
                <div className="bday-subtitle">A little surprise from someone who truly cares…</div>

                {!showMessage ? (
                  <button
                    className="bday-btn bday-btn-primary"
                    style={{ marginTop: 12 }}
                    onClick={() => setShowMessage(true)}
                  >
                    Read My Message 💌
                  </button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bday-message"
                    style={{ marginTop: 16 }}
                  >
                    {typedMessage}
                    <span style={{ opacity: 0.5 }}>|</span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hate screen */}
        <AnimatePresence>
          {stage === 2 && (
            <motion.div
              className="bday-hate"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div>
                <div style={{ fontSize: 48, marginBottom: 16 }}>💔</div>
                Why 💔 !!!!!!!!!!!!!!!!!!
                <div style={{ marginTop: 24 }}>
                  <button
                    className="bday-btn bday-btn-primary"
                    onClick={() => setStage(0)}
                  >
                    Try again 🥺
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* OurStory viral watermark badge */}
      <OurStoryWatermark variant="dark" templateId="birthday-wish" />
    </>
  );
}
