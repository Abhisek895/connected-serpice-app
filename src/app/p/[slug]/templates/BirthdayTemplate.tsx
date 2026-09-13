"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { recordResponseAction } from "../actions";
import type { ProposalClientProps } from "./RomanticLoveTemplate";
import OurStoryWatermark from "./OurStoryWatermark";

// ─── Soft Falling Fairy Confetti Canvas (Matches Demo & Reference Photos) ────
type Piece = {
  x: number;
  y: number;
  vy: number;
  vx: number;
  width: number;
  height: number;
  color: string;
  opacity: number;
  rotation: number;
  vr: number;
};

function useConfetti(active = true) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pieces = useRef<Piece[]>([]);
  const raf = useRef<number>(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    pieces.current.forEach((p) => {
      p.y += p.vy;
      p.x += p.vx;
      p.rotation += p.vr;

      if (p.y > canvas.height) {
        p.y = -10;
        p.x = Math.random() * canvas.width;
      }
      if (p.x > canvas.width) p.x = 0;
      if (p.x < 0) p.x = canvas.width;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.opacity;
      ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
      ctx.restore();
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

    pieces.current = Array.from({ length: 90 }).map(() => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vy: 0.8 + Math.random() * 1.4,
      vx: (Math.random() - 0.5) * 0.4,
      width: 4 + Math.random() * 5,
      height: 3 + Math.random() * 4,
      color: ["#ffffff", "#ffd1dc", "#fca5a5", "#ff9cc6", "#ffe4e6"][Math.floor(Math.random() * 5)],
      opacity: 0.35 + Math.random() * 0.55,
      rotation: Math.random() * 360,
      vr: (Math.random() - 0.5) * 1.5,
    }));

    raf.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener("resize", resize);
    };
  }, [active, draw]);

  return canvasRef;
}

// ─── Smooth Typewriter Hook ──────────────────────────────────────────────────
function useTypewriter(text: string, active = true, speed = 32) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    if (!active || !text) return;
    setDisplayed("");
    let i = 0;
    const iv = setInterval(() => {
      setDisplayed(text.substring(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(iv);
    }, speed);
    return () => clearInterval(iv);
  }, [active, text, speed]);
  return displayed;
}

// ─── Photo Slideshow Hook ────────────────────────────────────────────────────
function useSlideshow(photos: string[], interval = 3000) {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    if (photos.length <= 1) return;
    const iv = setInterval(() => setCurrent((c) => (c + 1) % photos.length), interval);
    return () => clearInterval(iv);
  }, [photos.length, interval]);
  return current;
}

// ─── BirthdayTemplate Component ──────────────────────────────────────────────
export default function BirthdayTemplate({
  slug,
  title,
  loveMessage,
  recipientName,
  media = [],
  photoUrl,
  audioUrl,
  _photo,
  _photo2,
  _photo3,
  _audio,
  customData,
}: ProposalClientProps) {
  const hasViewedRef = useRef(false);

  useEffect(() => {
    if (!hasViewedRef.current) {
      recordResponseAction(slug, "VIEWED");
      recordResponseAction(slug, "ACCEPTED");
      hasViewedRef.current = true;
    }
  }, [slug]);

  // Media resolution (prioritizes user uploaded slideshow photos & music)
  const customPhotos: string[] = [];
  const p1 = customData?._photo || customData?.photoUrl || customData?._photo1 || _photo || photoUrl;
  const p2 = customData?._photo2 || _photo2;
  const p3 = customData?._photo3 || _photo3;

  if (p1 && typeof p1 === "string" && p1.trim()) customPhotos.push(p1.trim());
  if (p2 && typeof p2 === "string" && p2.trim()) customPhotos.push(p2.trim());
  if (p3 && typeof p3 === "string" && p3.trim()) customPhotos.push(p3.trim());

  const uploadedImages = (media || []).filter((m) => m.type === "IMAGE").map((m) => m.url);
  uploadedImages.forEach((img) => {
    if (img && !customPhotos.includes(img)) customPhotos.push(img);
  });

  const defaultPhotos = [
    "/demos/birthday-wish/s0.jpeg",
    "/demos/birthday-wish/s1.jpeg",
    "/demos/birthday-wish/s2.jpeg",
    "/demos/birthday-wish/s3.jpeg",
    "/demos/birthday-wish/s4.jpeg",
    "/demos/birthday-wish/s5.jpeg",
  ];

  const photos = customPhotos.length > 0 ? customPhotos : defaultPhotos;

  const uploadedAudio = (media || []).find((m) => m.type === "AUDIO");
  const audioSrc =
    customData?.audioUrl ||
    customData?._audio ||
    audioUrl ||
    _audio ||
    (uploadedAudio ? uploadedAudio.url : "/demos/birthday-wish/hbd.mp3");

  const activeSlide = useSlideshow(photos, 3000);
  const confettiRef = useConfetti(true);

  const displayRecipient = recipientName || "Someone Special";
  const displayMessage =
    loveMessage ||
    "My all your dreams come true. You deserve all the happiness in the world! 🎉";

  const typedMessage = useTypewriter(displayMessage, true, 30);

  // Audio Playback & Toggle
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const startAudio = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current
      .play()
      .then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false));
  }, []);

  const toggleMusic = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!audioRef.current) return;
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        startAudio();
      }
    },
    [isPlaying, startAudio]
  );

  useEffect(() => {
    const audio = new Audio(audioSrc);
    audio.loop = true;
    audioRef.current = audio;

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setIsPlaying(true))
        .catch(() => {
          setIsPlaying(false);
          const unlock = () => {
            audio.play().then(() => setIsPlaying(true)).catch(() => {});
            window.removeEventListener("click", unlock);
            window.removeEventListener("touchstart", unlock);
          };
          window.addEventListener("click", unlock, { once: true });
          window.addEventListener("touchstart", unlock, { once: true });
        });
    }

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, [audioSrc]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=Poppins:wght@300;400;500;600;700&display=swap');

        .bday-page {
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px 16px;
          font-family: 'Poppins', sans-serif;
          background: radial-gradient(ellipse at 50% 25%, #851838 0%, #4a071c 55%, #1f010b 100%);
          color: #ffffff;
          overflow-x: hidden;
          position: relative;
          box-sizing: border-box;
          -webkit-font-smoothing: antialiased;
        }

        .bday-confetti {
          position: fixed;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
        }

        .bday-music-btn {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 100;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 18px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
          transition: transform 0.2s ease, background 0.2s ease;
        }
        .bday-music-btn:hover {
          transform: scale(1.08);
          background: rgba(255, 255, 255, 0.25);
        }
        .bday-music-btn:active {
          transform: scale(0.95);
        }

        .bday-card-container {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 680px;
          background: rgba(225, 29, 72, 0.22);
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          border-radius: 28px;
          border: 1px solid rgba(255, 180, 200, 0.28);
          box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 40px rgba(225, 29, 72, 0.35);
          padding: 26px;
          box-sizing: border-box;
          animation: bdayCardFadeIn 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          margin: 24px auto;
        }

        @keyframes bdayCardFadeIn {
          from {
            opacity: 0;
            transform: scale(0.96) translateY(12px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .bday-photo-slider {
          width: 100%;
          height: 280px;
          border-radius: 20px;
          overflow: hidden;
          position: relative;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
          margin-bottom: 20px;
          background: #150208;
        }

        .bday-slide-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 30%;
          opacity: 0;
          transition: opacity 1.5s ease-in-out, transform 6s ease-in-out;
          transform: scale(1.06);
        }

        .bday-slide-img.active {
          opacity: 1;
          transform: scale(1);
        }

        .bday-heading {
          font-family: 'Playfair Display', serif;
          font-size: 28px;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 8px;
          line-height: 1.3;
          text-align: left;
          letter-spacing: -0.2px;
        }

        .bday-name {
          color: #fca5a5;
          font-weight: 700;
        }

        .bday-subtitle {
          font-size: 15px;
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 16px;
          text-align: left;
          font-weight: 400;
          line-height: 1.4;
        }

        .bday-message-box {
          font-size: 16px;
          line-height: 1.6;
          color: #ffffff;
          text-align: left;
          min-height: 52px;
          font-weight: 500;
          white-space: pre-wrap;
          word-break: break-word;
        }

        .bday-cursor {
          display: inline-block;
          font-weight: 300;
          margin-left: 2px;
          color: rgba(255, 255, 255, 0.8);
          animation: bdayBlink 0.9s step-start infinite;
        }

        @keyframes bdayBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        @media (max-width: 640px) {
          .bday-page {
            padding: 16px 12px;
          }
          .bday-card-container {
            padding: 18px;
            border-radius: 24px;
            max-width: 100%;
          }
          .bday-photo-slider {
            height: 220px;
            border-radius: 16px;
            margin-bottom: 16px;
          }
          .bday-heading {
            font-size: 24px;
            line-height: 1.28;
          }
          .bday-subtitle {
            font-size: 14px;
            margin-bottom: 14px;
          }
          .bday-message-box {
            font-size: 15px;
            line-height: 1.55;
          }
          .bday-music-btn {
            top: 14px;
            right: 14px;
            width: 38px;
            height: 38px;
            font-size: 16px;
          }
        }

        @media (max-width: 380px) {
          .bday-photo-slider {
            height: 190px;
          }
          .bday-heading {
            font-size: 22px;
          }
          .bday-message-box {
            font-size: 14px;
          }
        }
      `}</style>

      <div className="bday-page">
        {/* Soft Falling Confetti Canvas */}
        <canvas ref={confettiRef} className="bday-confetti" />

        {/* Music Control Button */}
        <button
          className="bday-music-btn"
          onClick={toggleMusic}
          aria-label="Toggle Music"
          title="Toggle Music"
        >
          {isPlaying ? "🎵" : "🔇"}
        </button>

        {/* Glassmorphic Card (Matches Demo & Reference Photos) */}
        <div className="bday-card-container">
          {/* Photo Slideshow */}
          <div className="bday-photo-slider">
            {photos.map((src, i) => (
              <img
                key={src + i}
                src={src}
                className={`bday-slide-img ${i === activeSlide ? "active" : ""}`}
                alt={`Birthday photo ${i + 1}`}
              />
            ))}
          </div>

          {/* Heading */}
          <h1 className="bday-heading">
            Happy Birthday, <span className="bday-name">{displayRecipient} ✨</span> 🦋 💖
          </h1>

          {/* Subtitle */}
          <div className="bday-subtitle">
            A little surprise from someone who truly cares…
          </div>

          {/* Typewriter Message */}
          <div className="bday-message-box">
            {typedMessage}
            <span className="bday-cursor">|</span>
          </div>
        </div>

        {/* OurStory viral watermark badge */}
        <OurStoryWatermark variant="dark" templateId="birthday-wish" />
      </div>
    </>
  );
}
