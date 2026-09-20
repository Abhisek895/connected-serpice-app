"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { recordResponseAction } from "../actions"
import OurStoryWatermark from "./OurStoryWatermark"

// ─── Shared props type ────────────────────────────────────────────────────────
export type ProposalClientProps = {
  slug: string;
  themeName: string;
  title?: string;
  question: string;
  acceptBtn: string;
  rejectBtn: string;
  loveMessage?: string;
  photoUrl?: string;
  audioUrl?: string;
  _photo?: string;
  _photo2?: string;
  _photo3?: string;
  _audio?: string;
  demoId?: string;
  recipientName?: string;
  dodgeMessages?: string;
  patternText?: string;
  customData?: Record<string, any>;
  media: { id: string; url: string; type: string }[];
};

async function generateTextArtBlob(input: File | string, phrase?: string): Promise<Blob | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    let objectUrl: string | null = null;
    if (typeof input === "string") {
      img.src = input;
    } else {
      objectUrl = URL.createObjectURL(input);
      img.src = objectUrl;
    }

    img.onload = () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);

      // Preserve exact aspect ratio selected/cropped by user (max dimension 1080px for performance & crispness)
      const maxDim = 1080;
      let naturalW = img.naturalWidth || img.width || 1080;
      let naturalH = img.naturalHeight || img.height || 1080;

      let W = naturalW;
      let H = naturalH;
      if (W > maxDim || H > maxDim) {
        if (W >= H) {
          H = Math.round((H * maxDim) / W);
          W = maxDim;
        } else {
          W = Math.round((W * maxDim) / H);
          H = maxDim;
        }
      }
      W = Math.max(100, W);
      H = Math.max(100, H);

      // ── Step 1: Draw image to temp canvas & apply exact grayscale + contrast + brightness filter ──
      const tmpCanvas = document.createElement("canvas");
      tmpCanvas.width = W;
      tmpCanvas.height = H;
      const tmpCtx = tmpCanvas.getContext("2d");
      if (!tmpCtx) return resolve(null);

      // Draw the exact user-selected photo without forced square cover-crop
      tmpCtx.drawImage(img, 0, 0, W, H);

      // Apply Grayscale (100%) + Contrast (160%) + Brightness (1.2)
      const imageData = tmpCtx.getImageData(0, 0, W, H);
      const d = imageData.data;
      for (let i = 0; i < d.length; i += 4) {
        let gray = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
        gray = ((gray - 128) * 1.6 + 128) * 1.2;
        gray = Math.min(255, Math.max(0, gray));
        d[i] = d[i + 1] = d[i + 2] = gray;
      }
      tmpCtx.putImageData(imageData, 0, 0);

      // ── Step 2: Draw dense white phrase text grid on black background ──
      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(null);

      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, W, H);

      ctx.fillStyle = "#ffffff";
      const fontSize = 9;
      const lineHeight = 9;
      ctx.font = `900 ${fontSize}px sans-serif`;
      ctx.textBaseline = "top";

      const targetPhrase = (phrase && phrase.trim()) ? phrase.trim() : "love you";
      const repPhrase = targetPhrase.toUpperCase() + "  ";
      let lineText = "";
      while (ctx.measureText(lineText).width < W + 300) {
        lineText += repPhrase;
      }

      const totalLines = Math.ceil(H / lineHeight) + 2;
      for (let y = 0; y < totalLines; y++) {
        ctx.fillText(lineText, 0, y * lineHeight);
      }

      // Step 3: Multiply blend grayscale photo on top of white text grid
      ctx.globalCompositeOperation = "multiply";
      ctx.drawImage(tmpCanvas, 0, 0);
      ctx.globalCompositeOperation = "source-over";

      canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.92);
    };
    img.onerror = () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      resolve(null);
    };
  });
}

// ─── Portrait Text-Art Generator ─────────────────────────────────────────────
function TextArtPortrait({
  src,
  phrase = "love you",
  generatedUrl,
}: {
  src: string;
  phrase?: string;
  generatedUrl?: string | null;
}) {
  const [artImageSrc, setArtImageSrc] = useState<string>(generatedUrl || "");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let objectUrlToRevoke: string | null = null;

    if (generatedUrl) {
      setArtImageSrc(generatedUrl);
      return;
    }

    const effectivePhrase = (phrase && phrase.trim()) ? phrase.trim() : "love you";
    generateTextArtBlob(src, effectivePhrase).then((blob) => {
      if (blob && isMounted) {
        const blobUrl = URL.createObjectURL(blob);
        objectUrlToRevoke = blobUrl;
        setArtImageSrc(blobUrl);
      }
    });

    return () => {
      isMounted = false;
      if (objectUrlToRevoke) URL.revokeObjectURL(objectUrlToRevoke);
    };
  }, [src, phrase, generatedUrl]);

  return (
    <div className="portrait-art-wrapper">
      <img
        src={artImageSrc || src}
        alt="Portrait"
        className="portrait-art-img"
        onLoad={() => setIsLoaded(true)}
        style={{
          display: "block",
          width: "100%",
          height: "auto",
          filter: artImageSrc ? "none" : "grayscale(100%) contrast(160%) brightness(1.2)",
          opacity: isLoaded ? 1 : 0.95,
          transition: "opacity 0.2s ease-in-out",
        }}
      />
    </div>
  );
}

// ─── Floating background hearts ───────────────────────────────────────────────
function FloatingHearts({ active }: { active: boolean }) {
  const [hearts, setHearts] = useState<
    { id: number; left: string; scale: number; opacity: number; duration: number }[]
  >([]);

  useEffect(() => {
    if (!active) return;
    let id = 0;
    const iv = setInterval(() => {
      const newHeart = {
        id: id++,
        left: Math.random() * 100 + "vw",
        scale: Math.random() * 1 + 0.5,
        opacity: Math.random() * 0.5 + 0.3,
        duration: Math.random() * 6 + 4,
      };
      setHearts((prev) => [...prev.slice(-30), newHeart]);
    }, 400);
    return () => clearInterval(iv);
  }, [active]);

  if (!active) return null;

  return (
    <>
      <style>{`
        @keyframes floatUp {
          0% { top: 110vh; opacity: 0.8; }
          100% { top: -10vh; opacity: 0; }
        }
        .bg-heart-shape {
          position: fixed;
          width: 20px;
          height: 20px;
          background-color: rgba(255,255,255,0.6);
          transform: rotate(-45deg);
          z-index: 1;
          pointer-events: none;
        }
        .bg-heart-shape::before,
        .bg-heart-shape::after {
          content: "";
          position: absolute;
          width: 100%;
          height: 100%;
          background-color: rgba(255,255,255,0.6);
          border-radius: 50%;
        }
        .bg-heart-shape::before { top: -50%; left: 0; }
        .bg-heart-shape::after { top: 0; left: 50%; }
      `}</style>
      {hearts.map((h) => (
        <div
          key={h.id}
          className="bg-heart-shape"
          style={{
            left: h.left,
            transform: `rotate(-45deg) scale(${h.scale})`,
            animation: `floatUp ${h.duration}s linear forwards`,
          }}
          onAnimationEnd={() =>
            setHearts((prev) => prev.filter((x) => x.id !== h.id))
          }
        />
      ))}
    </>
  );
}

// ─── CSS Heart Button ──────────────────────────────────────────────────────────
function HeartButton({ onClick }: { onClick: () => void }) {
  return (
    <>
      <style>{`
        @keyframes heartbeat {
          0%   { transform: rotate(-45deg) scale(1); }
          14%  { transform: rotate(-45deg) scale(1.15); }
          28%  { transform: rotate(-45deg) scale(1); }
          42%  { transform: rotate(-45deg) scale(1.15); }
          70%  { transform: rotate(-45deg) scale(1); }
        }
        @keyframes floatBob {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-12px); }
        }
        .heart-wrapper { animation: floatBob 3s ease-in-out infinite; position: relative; z-index: 10; }
        .heart-btn-el {
          background: none; border: none; cursor: pointer;
          display: block; -webkit-tap-highlight-color: transparent; outline: none;
        }
        .heart-shape {
          background-color: #ff4d6d;
          width: 80px; height: 80px;
          position: relative;
          transform: rotate(-45deg);
          animation: heartbeat 1.2s infinite;
          box-shadow: 0 0 40px rgba(255,77,109,0.6);
          transition: all 0.3s ease;
        }
        .heart-shape::before, .heart-shape::after {
          content: "";
          background-color: #ff4d6d;
          width: 80px; height: 80px;
          border-radius: 50%;
          position: absolute;
        }
        .heart-shape::before { top: -40px; left: 0; }
        .heart-shape::after  { top: 0; left: 40px; }
        .heart-btn-el:hover .heart-shape,
        .heart-btn-el:active .heart-shape {
          background-color: #ff2a55;
          box-shadow: 0 0 60px rgba(255,42,85,0.9);
        }

        @media (max-width: 600px) {
          .heart-shape { width: 60px; height: 60px; }
          .heart-shape::before { top: -30px; width: 60px; height: 60px; }
          .heart-shape::after  { left: 30px; width: 60px; height: 60px; }
        }
      `}</style>
      <div className="heart-wrapper">
        <button className="heart-btn-el" onClick={onClick}>
          <div className="heart-shape" />
        </button>
      </div>
    </>
  );
}

// ─── Main Template ─────────────────────────────────────────────────────────────
export default function RomanticLoveTemplate({
  slug,
  title,
  question,
  acceptBtn,
  rejectBtn,
  loveMessage,
  recipientName,
  patternText,
  photoUrl,
  audioUrl,
  _photo,
  _audio,
  customData,
  media,
}: ProposalClientProps) {
  // 0 = landing, 1 = fade-to-black, 2 = portrait, 3 = proposal, 4 = accepted, 5 = rejected
  const [stage, setStage] = useState<0 | 1 | 2 | 3 | 4 | 5>(0);
  const [showLetter, setShowLetter] = useState(false);
  const [showDownloadPopup, setShowDownloadPopup] = useState(true);
  const hasViewedRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!hasViewedRef.current) {
      recordResponseAction(slug, "VIEWED");
      hasViewedRef.current = true;
    }
  }, [slug]);

  // Browser back button → go back to portrait image
  useEffect(() => {
    const handlePopState = () => {
      setStage((prev) => {
        if (prev === 3 || prev === 4 || prev === 5) return 2;
        return prev;
      });
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Media resolution (prioritizes user uploaded photo & audio data URLs or DB media)
  const imageMedia = media.filter((m) => m.type === "IMAGE");
  const audioMedia = media.find((m) => m.type === "AUDIO");

  const displayPhoto =
    customData?._photo ||
    customData?.photoUrl ||
    customData?._photo1 ||
    photoUrl ||
    _photo ||
    (imageMedia.length > 0 ? imageMedia[0].url : "/demos/surprise/cute_woman.png");

  const audioSrc =
    customData?.audioUrl ||
    customData?._audio ||
    audioUrl ||
    _audio ||
    (audioMedia ? audioMedia.url : "https://k4q9rpuc4cgssyjq.public.blob.vercel-storage.com/uploads/terenaina.mp3");

  const displayTitle = title || "I have a surprise for you...";
  const displayLetter =
    loveMessage || "A little surprise from someone who truly cares…";
  const displayRecipient = recipientName || "My Love";

  // Tap the heart → play music → fade → show portrait
  const handleReveal = () => {
    setStage(1);
    const audio = new Audio(audioSrc);
    audio.loop = true;
    audio.volume = 1.0;
    audio.play().catch(() => { });
    audioRef.current = audio;
    // After 1s fade, show portrait
    setTimeout(() => setStage(2), 1000);
  };

  const handleAccept = () => {
    setStage(4);
    recordResponseAction(slug, "ACCEPTED");
  };
  const handleReject = () => {
    setStage(5);
    recordResponseAction(slug, "REJECTED");
  };

  // Advance to proposal + push history so back button works
  const handleGoToProposal = () => {
    window.history.pushState({ stage: 3 }, "");
    setStage(3);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Pacifico&display=swap');

        ::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
        * { scrollbar-width: none !important; -ms-overflow-style: none !important; }
        html, body { overflow: hidden !important; overscroll-behavior: none !important; max-width: 100vw; max-height: 100vh; margin: 0; padding: 0; }


        .romantic-body {
          margin: 0;
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: hidden;
          transition: background 1s ease;
          background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%);
          user-select: none;
          touch-action: manipulation;
          position: relative;
          flex-direction: column;
        }
        .romantic-body.to-black { background: #000 !important; }

        /* Landing */
        .romantic-landing {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          font-family: 'Pacifico', cursive;
          text-align: center;
          padding: 0 15px;
          position: relative;
          z-index: 10;
          width: 100%;
        }
        .romantic-h1 {
          color: #b5194e;
          font-size: 4rem;
          margin-bottom: 50px;
          text-shadow: none;
          animation: rFadeIn 2s ease-in;
          line-height: 1.25;
          font-family: 'Dancing Script', cursive;
          font-weight: 700;
          letter-spacing: 0.5px;
        }
        @keyframes rFadeIn {
          from { opacity:0; transform:translateY(-20px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes rSlideUp {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .click-text-el {
          margin-top: 60px;
          color: #d6336c;
          font-family: 'Dancing Script', cursive;
          font-size: 2rem;
          font-weight: bold;
          opacity: 0;
          animation: rSlideUp 1s ease-out 1s forwards;
          pointer-events: none;
        }

        /* ── Portrait art: base (mobile) — Full width, exact user aspect ratio as-is with 0 cutting ── */
        .portrait-art-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          width: 100%;
          max-width: min(92vw, 420px);
          height: auto;
          border-radius: 24px;
          box-shadow: 0 18px 48px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255, 255, 255, 0.15);
          flex-shrink: 0;
        }

        .portrait-art-img {
          display: block;
          position: relative;
          z-index: 2;
          width: 100%;
          height: auto;
          border-radius: 24px;
        }

        /* ── Portrait page: base (mobile) ── */
        .portrait-page {
          width: 100%;
          height: 100vh;
          height: 100dvh;
          min-height: -webkit-fill-available;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          z-index: 10;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 8px 16px 20px 16px;
          box-sizing: border-box;
          will-change: transform, opacity;
        }

        /* ── Portrait container: base (mobile) ── */
        .portrait-container-wrapper {
          position: relative;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 15;
          margin: auto 0;
          flex-shrink: 0;
          transition: transform 0.3s ease;
        }

        /* ── Buttons: base (mobile) — shifted up so it never cuts ── */
        .portrait-buttons-container {
          position: relative;
          margin-top: 12px;
          margin-bottom: max(32px, calc(env(safe-area-inset-bottom, 0px) + 24px));
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: center;
          gap: 10px;
          z-index: 40;
          width: calc(100% - 24px);
          max-width: 380px;
          pointer-events: auto;
          flex-shrink: 0;
        }

        /* ── Desktop: generous art size, perfectly framed ── */
        @media (min-width: 768px) {
          .portrait-page {
            background: #000;
            padding: 16px 20px 24px 20px;
          }
          .portrait-container-wrapper {
            margin: auto 0;
          }
          .portrait-art-wrapper {
            width: 100%;
            max-width: 480px;
            height: auto;
            border-radius: 28px;
            box-shadow: 0 24px 64px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.18);
            flex-shrink: 0;
          }
          .portrait-art-img {
            width: 100%;
            height: auto;
            border-radius: 28px;
          }
          .portrait-buttons-container {
            margin-top: 16px;
            margin-bottom: 40px;
            max-width: 420px;
            gap: 14px;
          }
        }

        .love-letter-popup {
          position: absolute;
          top: 50%;
          left: 50%;
          width: calc(100% - 32px);
          max-width: 440px;
          height: auto;
          max-height: 70vh;
          background: rgba(255, 255, 255, 0.97);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-radius: 22px;
          padding: 24px 20px;
          font-family: 'Dancing Script', cursive;
          font-size: 1.25rem;
          color: #111;
          line-height: 1.6;
          text-align: center;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.6);
          z-index: 30;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          overflow-y: auto;
        }

        /* Love letter button (compact, elevated pill, zero overflow) */
        .love-letter-btn {
          background: rgba(255,255,255,0.98);
          color: #d6336c;
          border: 1px solid rgba(255,255,255,0.8);
          border-radius: 9999px;
          padding: 10px 12px;
          font-family: 'Dancing Script', cursive;
          font-size: 0.98rem;
          font-weight: bold;
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(0,0,0,0.5), 0 2px 10px rgba(214,51,108,0.3);
          transition: all 0.25s ease;
          white-space: nowrap;
          z-index: 10;
          flex: 1 1 0%;
          min-width: 0;
          text-align: center;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
        }
        .love-letter-btn:hover { transform: translateY(-2px) scale(1.03); background: #ffffff; }
        .love-letter-box {
          max-width: 500px;
          width: 90%;
          background: rgba(255,255,255,0.95);
          border-radius: 20px;
          padding: 24px;
          font-family: 'Dancing Script', cursive;
          font-size: 1.2rem;
          color: #333;
          line-height: 1.7;
          box-shadow: 0 8px 40px rgba(0,0,0,0.2);
          text-align: center;
          z-index: 10;
        }

        /* Continue to proposal button (elevated gradient pill) */
        .continue-btn {
          background: linear-gradient(135deg, #ff4d6d, #e8003d);
          color: white;
          border: none;
          border-radius: 9999px;
          padding: 10px 12px;
          font-size: 0.92rem;
          font-weight: bold;
          cursor: pointer;
          font-family: sans-serif;
          box-shadow: 0 8px 24px rgba(255,77,109,0.55);
          transition: all 0.25s ease;
          white-space: nowrap;
          z-index: 10;
          flex: 1 1 0%;
          min-width: 0;
          text-align: center;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
        }
        .continue-btn:hover { transform: translateY(-2px) scale(1.03); filter: brightness(1.08); }

        @media (min-width: 640px) {
          .portrait-buttons-container {
            max-width: 440px;
            gap: 14px;
            margin-bottom: 36px;
          }
          .love-letter-btn,
          .continue-btn {
            padding: 11px 20px;
            font-size: 1rem;
          }
        }

        @media (max-width: 600px) {
          .romantic-h1 { font-size: 2.2rem; }
        }
      `}</style>

      {/* Floating hearts — only on landing */}
      <FloatingHearts active={stage === 0} />

      <div
        className={`romantic-body ${stage === 1 ? "to-black" : ""}`}
        style={stage >= 2 ? { background: "#000" } : {}}
      >
        {/* ── STAGE 0: Landing ── */}
        <AnimatePresence>
          {stage === 0 && (
            <motion.div
              key="landing"
              className="romantic-landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="romantic-h1">{displayTitle}</h1>
              <HeartButton onClick={handleReveal} />
              <div className="click-text-el">Tap the Heart</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── STAGE 1: Fade to black (transition) ── */}
        {/* Handled by background color change */}

        {/* ── STAGE 2: Portrait + love letter + continue ── */}
        <AnimatePresence>
          {stage === 2 && (
            <motion.div
              key="portrait"
              className="portrait-page"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              {/* ── Download Popup (Top-aligned, compact & refined) ── */}
              <AnimatePresence>
                {showDownloadPopup && (customData?.generatedThumbnailUrl || displayPhoto) && (
                  <motion.div
                    initial={{ opacity: 0, y: -15, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -15, scale: 0.96 }}
                    transition={{ delay: 0.6, type: "spring", stiffness: 240, damping: 22 }}
                    className="relative z-50 mt-1 mb-1.5 bg-black/85 backdrop-blur-xl border border-white/20 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl shadow-2xl flex flex-col items-center gap-2 w-[88%] max-w-[310px] sm:max-w-[340px] shrink-0"
                  >
                    <div className="text-white text-xs sm:text-sm font-semibold text-center leading-snug">
                      Download portrait picture? 💖
                    </div>
                    <div className="flex gap-2 w-full">
                      <button
                        onClick={async () => {
                          setShowDownloadPopup(false);
                          try {
                            let blob: Blob | null = null;
                            const effectivePattern = (patternText && patternText.trim()) ? patternText.trim() : "love you";

                            // Generate directly on client to guarantee 100% fidelity to the dynamic text input
                            if (displayPhoto) {
                              blob = await generateTextArtBlob(displayPhoto, effectivePattern);
                            }
                            if (!blob && customData?.generatedThumbnailUrl) {
                              try {
                                const res = await fetch(customData.generatedThumbnailUrl);
                                if (res.ok) blob = await res.blob();
                              } catch { }
                            }
                            if (!blob) return;

                            const blobUrl = URL.createObjectURL(blob);
                            const link = document.createElement("a");
                            link.href = blobUrl;
                            link.download = `${effectivePattern.replace(/[^a-zA-Z0-9_-]/g, "-").toLowerCase()}-art.jpg`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
                          } catch (e) {
                            console.error("[Download] Error:", e);
                          }
                        }}
                        className="flex-1 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 text-white text-xs font-bold py-1.5 px-2.5 rounded-lg transition shadow-md shadow-rose-500/25 active:scale-95"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setShowDownloadPopup(false)}
                        className="flex-1 bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-1.5 px-2.5 rounded-lg transition active:scale-95"
                      >
                        No
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Photo & Overlay Popup Container (Centered) */}
              <div className="portrait-container-wrapper">
                <TextArtPortrait
                  src={displayPhoto}
                  phrase={(patternText && patternText.trim()) ? patternText.trim() : "love you"}
                  generatedUrl={customData?.generatedThumbnailUrl}
                />

                {/* Love Letter Popup Overlay directly on top of photo */}
                <AnimatePresence>
                  {showLetter && (
                    <motion.div
                      className="love-letter-popup"
                      initial={{ opacity: 0, scale: 0.8, x: "-50%", y: "-50%" }}
                      animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
                      exit={{ opacity: 0, scale: 0.8, x: "-50%", y: "-50%" }}
                      onClick={() => setShowLetter(false)}
                      title="Tap to close"
                    >
                      <div style={{ fontSize: "0.8rem", fontWeight: "bold", color: "#d6336c", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "1px" }}>
                        💌 Message For You
                      </div>
                      "{displayLetter}"
                      <div style={{ fontSize: "0.75rem", color: "#888", marginTop: "10px", fontWeight: "bold" }}>
                        (Tap note to close)
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Action Buttons (Shifted up, guaranteed visible, zero text overflow) */}
              <div className="portrait-buttons-container">
                {!showLetter && (
                  <button
                    className="love-letter-btn"
                    onClick={() => setShowLetter(true)}
                  >
                    💌 Read Message
                  </button>
                )}

                <button className="continue-btn" onClick={handleGoToProposal}>
                  💖 Continue
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── STAGE 3: Proposal Question ── */}
        <AnimatePresence>
          {stage === 3 && (
            <motion.div
              key="proposal"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.5 }}
              onClick={() => setStage(2)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                height: "100%",
                position: "absolute",
                top: 0,
                left: 0,
                cursor: "default",
              }}
            >
              {/* Inner content — stopPropagation so buttons still work */}
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  maxWidth: "700px",
                  padding: "20px",
                  textAlign: "center",
                  width: "100%",
                }}
              >
                <h1
                  style={{
                    fontFamily: "'Pacifico', cursive",
                    fontSize: "clamp(1.8rem,5vw,3rem)",
                    color: "#ff4d6d",
                    textShadow: "2px 2px 8px rgba(0,0,0,0.3)",
                    marginBottom: 36,
                    lineHeight: 1.3,
                  }}
                >
                  {question || "Will you be mine? 💖"}
                </h1>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 16,
                    flexWrap: "nowrap",
                    width: "100%",
                  }}
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAccept}
                    style={{
                      padding: "12px 28px",
                      background: "#ff4d6d",
                      color: "white",
                      border: "none",
                      borderRadius: 30,
                      fontSize: "1.1rem",
                      fontWeight: "bold",
                      cursor: "pointer",
                      boxShadow: "0 4px 20px rgba(255,77,109,0.4)",
                      fontFamily: "sans-serif",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {acceptBtn || "Yes! 😍"}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 0.95 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleReject}
                    style={{
                      padding: "12px 28px",
                      background: "#1e293b",
                      color: "white",
                      border: "none",
                      borderRadius: 30,
                      fontSize: "1.1rem",
                      fontWeight: "bold",
                      cursor: "pointer",
                      fontFamily: "sans-serif",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {rejectBtn || "No 🙈"}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── STAGE 4: Accepted ── */}
        <AnimatePresence>
          {stage === 4 && (
            <motion.div
              key="accepted"
              initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ type: "spring", bounce: 0.5, duration: 1 }}
              style={{
                background: "#ff4d6d",
                borderRadius: 24,
                padding: "48px 40px",
                textAlign: "center",
                color: "white",
                maxWidth: 500,
                width: "90%",
              }}
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                style={{ fontSize: 80, marginBottom: 24 }}
              >
                ❤️
              </motion.div>
              <h1 style={{ fontFamily: "'Pacifico', cursive", fontSize: "2.5rem", marginBottom: 8 }}>
                I love you too!
              </h1>
              <p style={{ fontSize: "1.2rem", opacity: 0.9 }}>Forever and always. ✨</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── STAGE 5: Rejected ── */}
        <AnimatePresence>
          {stage === 5 && (
            <motion.div
              key="rejected"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                background: "#0f172a",
                borderRadius: 24,
                padding: "48px 40px",
                textAlign: "center",
                color: "white",
                maxWidth: 500,
                width: "90%",
                border: "1px solid #334155",
              }}
            >
              <h1 style={{ fontFamily: "'Pacifico', cursive", fontSize: "3rem", marginBottom: 24 }}>
                Ouch... 💔
              </h1>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setStage(3)}
                style={{
                  background: "white",
                  color: "#0f172a",
                  border: "none",
                  borderRadius: 40,
                  padding: "14px 32px",
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                  cursor: "pointer",
                  fontFamily: "sans-serif",
                }}
              >
                Can we try that again?
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* OurStory viral watermark badge */}
      <OurStoryWatermark variant="dark" templateId="surprise" />
    </>
  );
}
