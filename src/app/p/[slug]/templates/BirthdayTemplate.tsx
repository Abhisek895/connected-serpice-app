"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { recordResponseAction } from "../actions";
import type { ProposalClientProps } from "./RomanticLoveTemplate";
import OurStoryWatermark from "./OurStoryWatermark";

// --- Soft Falling Fairy Confetti Canvas (Matches Demo & Reference Photos) ---
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

    pieces.current = Array.from({ length: 110 }).map(() => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vy: 0.7 + Math.random() * 1.6,
      vx: (Math.random() - 0.5) * 0.5,
      width: 4 + Math.random() * 7,
      height: 3 + Math.random() * 5,
      color: [
        "#ffd700", "#ffb700", "#ffc4d0", "#ff85a1", "#c084fc",
        "#e9d5ff", "#ffffff", "#fef3c7", "#f9a8d4", "#a78bfa"
      ][Math.floor(Math.random() * 10)],
      opacity: 0.4 + Math.random() * 0.55,
      rotation: Math.random() * 360,
      vr: (Math.random() - 0.5) * 1.8,
    }));

    raf.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener("resize", resize);
    };
  }, [active, draw]);

  return canvasRef;
}

// --- Smooth Typewriter Hook ---
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

// --- Photo Slideshow Hook ---
function useSlideshow(photos: string[], interval = 3000) {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    if (photos.length <= 1) return;
    const iv = setInterval(() => setCurrent((c) => (c + 1) % photos.length), interval);
    return () => clearInterval(iv);
  }, [photos.length, interval]);
  return current;
}

// --- BirthdayTemplate Component ---
export default function BirthdayTemplate({
  slug,
  title,
  question,
  acceptBtn,
  rejectBtn,
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
  const [revealed, setRevealed] = useState(false);
  const [showPopup, setShowPopup] = useState(true); // Show immediately on load
  const [noCount, setNoCount] = useState(0);
  const [yesScale, setYesScale] = useState(1);
  const [popupMsg, setPopupMsg] = useState({ title: "Do you love me? 💖", sub: "Choose honestly…" });
  const [showMessagePopup, setShowMessagePopup] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!hasViewedRef.current) {
      recordResponseAction(slug, "VIEWED");
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
  const displayTitle = title || "Happy Birthday! 🎂";
  const displayQuestion = question || "Wishing you the happiest birthday! 🎂";
  const displayAcceptBtn = acceptBtn || "Love ❤️";
  const displayRejectBtn = rejectBtn || "Hate 💔";
  
  const displayMessage =
    loveMessage ||
    "May all your dreams come true. You deserve all the happiness in the world! 🎉";

  const typedMessage = useTypewriter(displayMessage, revealed, 30);

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

  const noMessages = [
    { title: "Are you sure? 🥺", sub: "Think again, please…" },
    { title: "Really sure? 🤨", sub: "I made this with love!" },
    { title: "Don't break my heart! 💔", sub: "The Yes button is RIGHT THERE…" },
    { title: "Last chance! 🥺", sub: "Just click Love already!" },
    { title: "Okay fine… 😒", sub: "You clearly can't resist forever!" },
  ];

  const handleOpenPopup = () => {
    if (revealed) return;
    setNoCount(0);
    setYesScale(1);
    setPopupMsg({ title: "Do you love me? 💖", sub: "Choose honestly…" });
    setShowPopup(true);
  };

  const handleAccept = () => {
    setShowPopup(false);
    setRevealed(true);
    startAudio();
    setTimeout(() => {
      setShowMessagePopup(true);
    }, 5000);
  };

  const submitReply = (skipped = false) => {
    setIsSubmitting(true);
    const msg = replyMessage.trim();
    const metadata = skipped || !msg ? undefined : JSON.stringify({ recipientNote: msg });
    recordResponseAction(slug, "ACCEPTED", metadata);
    setShowMessagePopup(false);
    setIsSubmitting(false);
  };

  const handleReject = () => {
    recordResponseAction(slug, "REJECTED");
    const next = noCount + 1;
    setNoCount(next);
    const newYes = Math.min(yesScale + 0.18, 2.2);
    setYesScale(newYes);
    const msg = noMessages[Math.min(next - 1, noMessages.length - 1)];
    setPopupMsg(msg);
  };

  const noScale = Math.max(1 - noCount * 0.12, 0.38);
  const noOpacity = Math.max(noScale, 0.35);
  const noHidden = noCount >= 5;

  useEffect(() => {
    const audio = new Audio(audioSrc);
    audio.loop = true;
    audioRef.current = audio;
    // Do NOT auto-play Ã¢â‚¬â€ music only starts after Love is clicked
    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, [audioSrc]);


  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=Poppins:wght@300;400;500;600;700&family=Dancing+Script:wght@600;700&display=swap');

        /* Psychology Palette:
           Deep Violet = Magic, Wonder, Mystery (evokes awe)
           Gold/Amber  = Achievement, Joy, Celebration (dopamine trigger)
           Rose/Pink   = Love, Warmth, Tenderness (oxytocin response)
           Warm White  = Comfort, Clarity (cognitive ease)
        */

        .bday-page {
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 28px 16px;
          font-family: 'Poppins', sans-serif;
          background:
            radial-gradient(ellipse at 30% 0%,   rgba(120,40,200,0.55) 0%,  transparent 55%),
            radial-gradient(ellipse at 70% 100%, rgba(220,38,100,0.45) 0%,  transparent 55%),
            radial-gradient(ellipse at 80% 20%,  rgba(251,191,36,0.15) 0%,  transparent 45%),
            linear-gradient(160deg, #0d0118 0%, #150530 40%, #1e0a30 70%, #120215 100%);
          color: #ffffff;
          overflow-x: hidden;
          position: relative;
          box-sizing: border-box;
          -webkit-font-smoothing: antialiased;
        }

        .bday-page::before {
          content: '';
          position: fixed;
          top: -15%;
          left: 50%;
          transform: translateX(-50%);
          width: 80vw;
          height: 50vh;
          background: radial-gradient(ellipse, rgba(251,191,36,0.09) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
          animation: auroraFloat 8s ease-in-out infinite alternate;
        }
        @keyframes auroraFloat {
          0%   { opacity: 0.6; transform: translateX(-50%) scale(1); }
          100% { opacity: 1;   transform: translateX(-50%) scale(1.18); }
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
          width: 46px;
          height: 46px;
          border-radius: 50%;
          background: rgba(251, 191, 36, 0.12);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(251, 191, 36, 0.3);
          color: #fde68a;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 18px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.5), 0 0 12px rgba(251,191,36,0.18);
          transition: transform 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
        }
        .bday-music-btn:hover {
          transform: scale(1.1);
          background: rgba(251, 191, 36, 0.25);
          box-shadow: 0 6px 24px rgba(0,0,0,0.5), 0 0 22px rgba(251,191,36,0.38);
        }
        .bday-music-btn:active { transform: scale(0.93); }

        .bday-card-container {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 680px;
          background: linear-gradient(
            145deg,
            rgba(70, 15, 120, 0.38) 0%,
            rgba(130, 18, 65, 0.30) 50%,
            rgba(55, 8, 100, 0.38) 100%
          );
          backdrop-filter: blur(36px) saturate(200%);
          -webkit-backdrop-filter: blur(36px) saturate(200%);
          border-radius: 32px;
          border: 1px solid rgba(251, 191, 36, 0.2);
          box-shadow:
            0 0 0 1px rgba(192, 132, 252, 0.12),
            0 25px 65px -15px rgba(0,0,0,0.8),
            0 0 55px rgba(100, 30, 180, 0.2),
            inset 0 1px 0 rgba(255,255,255,0.07);
          padding: 28px;
          box-sizing: border-box;
          animation: bdayCardFadeIn 1.1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          margin: 24px auto;
        }
        @keyframes bdayCardFadeIn {
          from { opacity: 0; transform: scale(0.94) translateY(18px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }

        .bday-photo-slider {
          width: 100%;
          height: 300px;
          border-radius: 22px;
          overflow: hidden;
          position: relative;
          margin-bottom: 22px;
          background: #0d0118;
          box-shadow:
            0 12px 40px rgba(0,0,0,0.6),
            0 0 0 1.5px rgba(251,191,36,0.18),
            0 0 30px rgba(192,132,252,0.18);
        }
        /* Animated shimmer ring around photo */
        .bday-photo-slider::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 22px;
          background: linear-gradient(135deg, rgba(255,215,0,0.18) 0%, rgba(192,132,252,0.12) 40%, rgba(255,133,161,0.12) 70%, rgba(255,215,0,0.18) 100%);
          background-size: 200% 200%;
          pointer-events: none;
          z-index: 2;
          animation: photoShimmer 4s ease-in-out infinite;
        }
        @keyframes photoShimmer {
          0%, 100% { background-position: 0% 50%; opacity: 0.7; }
          50%       { background-position: 100% 50%; opacity: 1; }
        }

        .bday-slide-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 25%;
          opacity: 0;
          transition: opacity 1.8s ease-in-out, transform 7s ease-in-out;
          transform: scale(1.07);
        }
        .bday-slide-img.active {
          opacity: 1;
          transform: scale(1);
        }

        .bday-heading {
          font-family: 'Playfair Display', serif;
          font-size: 28px;
          font-weight: 700;
          background: linear-gradient(135deg, #fde68a 0%, #fbbf24 40%, #f9a8d4 80%, #e9d5ff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 10px;
          line-height: 1.3;
          text-align: left;
          letter-spacing: -0.3px;
          filter: drop-shadow(0 2px 8px rgba(251,191,36,0.25));
        }

        .bday-name {
          background: linear-gradient(90deg, #ffd700 0%, #f9a8d4 55%, #c084fc 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 700;
        }

        .bday-subtitle {
          font-size: 15px;
          color: rgba(253, 230, 138, 0.82);
          margin-bottom: 18px;
          text-align: left;
          font-weight: 400;
          line-height: 1.5;
          font-style: italic;
        }

        .bday-message-box {
          background: rgba(251, 191, 36, 0.06);
          border: 1px solid rgba(251, 191, 36, 0.16);
          border-radius: 18px;
          padding: 18px 20px;
          font-family: 'Dancing Script', cursive;
          font-size: 19px;
          line-height: 1.65;
          color: #fef3c7;
          text-align: left;
          min-height: 64px;
          font-weight: 600;
          white-space: pre-wrap;
          word-break: break-word;
          box-shadow: inset 0 0 24px rgba(251,191,36,0.04);
        }

        .bday-cursor {
          display: inline-block;
          font-weight: 300;
          margin-left: 2px;
          color: #fbbf24;
          animation: bdayBlink 0.9s step-start infinite;
        }
        @keyframes bdayBlink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }

        @media (max-width: 640px) {
          .bday-page { padding: 16px 12px; }
          .bday-card-container { padding: 18px; border-radius: 26px; max-width: 100%; }
          .bday-photo-slider { height: 230px; border-radius: 18px; margin-bottom: 18px; }
          .bday-heading { font-size: 23px; line-height: 1.28; }
          .bday-subtitle { font-size: 13px; margin-bottom: 14px; }
          .bday-message-box { font-size: 17px; line-height: 1.6; padding: 14px 16px; }
          .bday-music-btn { top: 14px; right: 14px; width: 40px; height: 40px; font-size: 16px; }
        }
        @media (max-width: 380px) {
          .bday-photo-slider { height: 200px; }
          .bday-heading { font-size: 20px; }
          .bday-message-box { font-size: 16px; }
        }

        /* --- Tap Prompt --- */
        .bday-tap-prompt {
          text-align: center;
          padding: 18px 0 8px;
          background: linear-gradient(90deg, #fbbf24, #c084fc, #f9a8d4, #fbbf24);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-size: 15px;
          font-weight: 600;
          letter-spacing: 0.4px;
          cursor: pointer;
          animation: tapPulse 2s ease-in-out infinite, shimmerText 3s linear infinite;
        }
        @keyframes tapPulse {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.04); }
        }
        @keyframes shimmerText {
          0%   { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }

        
        .bday-reply-textarea {
          width: 100%;
          background: rgba(251, 191, 36, 0.08);
          border: 1px solid rgba(251, 191, 36, 0.25);
          border-radius: 12px;
          padding: 12px 16px;
          color: #fef3c7;
          font-family: 'Poppins', sans-serif;
          font-size: 14px;
          resize: none;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
          margin-bottom: 12px;
        }
        .bday-reply-textarea::placeholder {
          color: rgba(251, 191, 36, 0.4);
        }
        .bday-reply-textarea:focus {
          border-color: rgba(251, 191, 36, 0.6);
          box-shadow: 0 0 12px rgba(251, 191, 36, 0.15);
        }

        /* --- Popup Overlay --- */
        .bday-popup-overlay {
          position: fixed;
          inset: 0;
          background: rgba(6, 0, 18, 0.84);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          z-index: 200;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          box-sizing: border-box;
          animation: popupFadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes popupFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        .bday-popup-box {
          position: relative;
          background: linear-gradient(
            145deg,
            rgba(55, 8, 100, 0.95) 0%,
            rgba(95, 12, 48, 0.92) 55%,
            rgba(45, 6, 88, 0.95) 100%
          );
          backdrop-filter: blur(40px) saturate(220%);
          -webkit-backdrop-filter: blur(40px) saturate(220%);
          border-radius: 32px;
          padding: 42px 34px 38px;
          max-width: 360px;
          width: calc(100% - 36px);
          max-height: calc(100dvh - 32px);
          overflow-y: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
          text-align: center;
          box-shadow:
            0 0 0 1px rgba(251,191,36,0.28),
            0 30px 80px rgba(0,0,0,0.85),
            0 0 70px rgba(100,30,180,0.3),
            inset 0 1px 0 rgba(255,255,255,0.09);
          animation: popupBoxIn 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .bday-popup-box::-webkit-scrollbar {
          display: none;
        }
        /* Animated shimmer ring */
        .bday-popup-box::before {
          content: '';
          position: absolute;
          inset: -1.5px;
          border-radius: 33.5px;
          background: linear-gradient(135deg, #ffd700, #c084fc, #ff85a1, #ffd700);
          background-size: 300% 300%;
          z-index: -1;
          animation: popupRing 3s linear infinite;
          opacity: 0.55;
        }
        @keyframes popupRing {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes popupBoxIn {
          from { opacity: 0; transform: scale(0.84) translateY(28px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }

        .bday-popup-emoji {
          font-size: 56px;
          margin-bottom: 14px;
          display: block;
          animation: emojiBounce 1.6s ease-in-out infinite;
          filter: drop-shadow(0 4px 16px rgba(251,191,36,0.55));
        }
        @keyframes emojiBounce {
          0%, 100% { transform: translateY(0)   rotate(-4deg); }
          50%       { transform: translateY(-12px) rotate(4deg); }
        }

        .bday-popup-title {
          font-family: 'Playfair Display', serif;
          font-size: 24px;
          font-weight: 700;
          background: linear-gradient(135deg, #fde68a 0%, #fbbf24 50%, #f9a8d4 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0 0 10px;
          line-height: 1.3;
          transition: all 0.35s ease;
          filter: drop-shadow(0 2px 8px rgba(251,191,36,0.3));
        }

        .bday-popup-sub {
          font-size: 13.5px;
          color: rgba(233, 213, 255, 0.82);
          margin: 0 0 32px;
          font-weight: 400;
          min-height: 20px;
          transition: all 0.35s ease;
          font-style: italic;
        }

        .bday-popup-btns {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
          min-height: 64px;
        }

        .bday-btn-yes {
          padding: 15px 36px;
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #fcd34d 100%);
          color: #1c0a00;
          font-weight: 700;
          font-size: 16px;
          border-radius: 9999px;
          border: none;
          cursor: pointer;
          box-shadow:
            0 8px 30px rgba(251,191,36,0.65),
            0 0 0 1px rgba(251,191,36,0.4),
            inset 0 1px 0 rgba(255,255,255,0.35);
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease;
          transform-origin: center;
          font-family: 'Poppins', sans-serif;
        }
        .bday-btn-yes:hover {
          box-shadow: 0 12px 38px rgba(251,191,36,0.85), 0 0 0 2px rgba(251,191,36,0.55);
        }
        .bday-btn-yes:active { filter: brightness(0.9); }

        .bday-btn-no {
          padding: 12px 24px;
          background: rgba(255,255,255,0.07);
          color: rgba(233,213,255,0.55);
          font-weight: 500;
          font-size: 13px;
          border-radius: 9999px;
          border: 1px solid rgba(192,132,252,0.22);
          cursor: pointer;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease;
          transform-origin: center;
          font-family: 'Poppins', sans-serif;
        }
        .bday-btn-no:hover { background: rgba(255,255,255,0.13); }
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

        {/* Card â€” only visible after Love â¤ï¸ is clicked */}
        {revealed && (
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

            {/* Birthday card content with typewriter */}
            <h1 className="bday-heading">
              Happy Birthday, <span className="bday-name">{displayRecipient} ✨</span> 🦋 💖
            </h1>
            <div className="bday-subtitle">
              A little surprise from someone who truly cares…
            </div>
            <div className="bday-message-box">
              {typedMessage}
              <span className="bday-cursor">|</span>
            </div>
          </div>
        )}

        {/* Love Popup Overlay */}
        {showPopup && (
          <div className="bday-popup-overlay" onClick={(e) => e.stopPropagation()}>
            <div className="bday-popup-box">
              <div className="bday-popup-emoji">🎂</div>
              <h2 className="bday-popup-title">{popupMsg.title}</h2>
              <p className="bday-popup-sub">{popupMsg.sub}</p>
              <div className="bday-popup-btns">
                <button
                  className="bday-btn-yes"
                  onClick={handleAccept}
                  style={{ transform: `scale(${yesScale})` }}
                >
                  {displayAcceptBtn}
                </button>
                {!noHidden && (
                  <button
                    className="bday-btn-no"
                    onClick={handleReject}
                    style={{
                      transform: `scale(${noScale})`,
                      opacity: noOpacity,
                    }}
                  >
                    {displayRejectBtn}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        
        {/* Reply Message Popup Overlay */}
        {showMessagePopup && (
          <div className="bday-popup-overlay" onClick={(e) => e.stopPropagation()}>
            <div className="bday-popup-box">
              <div className="bday-popup-emoji">💌</div>
              <h2 className="bday-popup-title">Send a Reply?</h2>
              <p className="bday-popup-sub">Would you like to send a message back to the sender?</p>
              
              <textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Type your message here..."
                className="bday-reply-textarea"
                rows={3}
              />

              <div className="bday-popup-btns" style={{ minHeight: 'auto' }}>
                <button
                  className="bday-btn-yes"
                  onClick={() => submitReply(false)}
                  disabled={isSubmitting}
                  style={{ padding: '12px 24px', fontSize: '14px' }}
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </button>
                <button
                  className="bday-btn-no"
                  onClick={() => submitReply(true)}
                  disabled={isSubmitting}
                >
                  Skip
                </button>
              </div>
            </div>
          </div>
        )}

        {/* OurStory viral watermark badge */}
        <OurStoryWatermark variant="dark" templateId="birthday-wish" />
      </div>
    </>
  );
}
