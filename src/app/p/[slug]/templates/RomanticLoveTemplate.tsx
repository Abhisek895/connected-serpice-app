"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { recordResponseAction } from "../actions"

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
  demoId?: string;
  recipientName?: string;
  media: { id: string; url: string; type: string }[];
};

// ─── Portrait Text-Art Generator ─────────────────────────────────────────────
function TextArtPortrait({
  src,
  phrase = "LOVE YOU",
}: {
  src: string;
  phrase?: string;
}) {
  const textRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const generateArt = useCallback(() => {
    const img = imgRef.current;
    const wall = textRef.current;
    if (!img || !wall || !img.complete || img.naturalWidth === 0) return;
    const w = img.clientWidth;
    const h = img.clientHeight;
    const multiplier = 3;
    const charsPerLine = Math.ceil((w * multiplier) / 5);
    const totalLines = Math.ceil((h * multiplier) / 8);
    const totalChars = charsPerLine * totalLines * 1.5;
    const repeatCount = Math.ceil(totalChars / phrase.length);
    wall.innerText = phrase.repeat(repeatCount);
  }, [phrase]);

  useEffect(() => {
    window.addEventListener("resize", generateArt);
    return () => window.removeEventListener("resize", generateArt);
  }, [generateArt]);

  return (
    <div
      style={{
        position: "relative",
        display: "inline-flex",
        maxWidth: "98vw",
        maxHeight: "80vh",
        boxShadow: "inset 0 0 80px rgba(0,0,0,1)",
        overflow: "hidden",
      }}
    >
      {/* Text pixel layer */}
      <div
        ref={textRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "300%",
          height: "300%",
          transform: "scale(0.3333)",
          transformOrigin: "top left",
          zIndex: 1,
          backgroundColor: "black",
          color: "white",
          fontSize: "8px",
          lineHeight: "8px",
          letterSpacing: "0px",
          fontWeight: 900,
          wordBreak: "break-all",
          overflow: "hidden",
          textAlign: "justify",
        }}
      />
      {/* Source image */}
      <img
        ref={imgRef}
        src={src}
        alt="Portrait"
        onLoad={generateArt}
        style={{
          display: "block",
          width: "auto",
          height: "auto",
          maxWidth: "100%",
          maxHeight: "80vh",
          position: "relative",
          zIndex: 2,
          filter: "grayscale(100%) contrast(160%) brightness(1.2)",
          mixBlendMode: "multiply",
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
  media,
}: ProposalClientProps) {
  // 0 = landing, 1 = fade-to-black, 2 = portrait, 3 = proposal, 4 = accepted, 5 = rejected
  const [stage, setStage] = useState<0 | 1 | 2 | 3 | 4 | 5>(0);
  const [showLetter, setShowLetter] = useState(false);
  const hasViewedRef = useRef(false);

  useEffect(() => {
    if (!hasViewedRef.current) {
      recordResponseAction(slug, "VIEWED");
      hasViewedRef.current = true;
    }
  }, [slug]);

  // Media
  const imageMedia = media.filter((m) => m.type === "IMAGE");
  const audioMedia = media.find((m) => m.type === "AUDIO");
  const displayPhoto =
    imageMedia.length > 0
      ? imageMedia[0].url
      : "/demos/surprise/cute_woman.png";
  const audioSrc = audioMedia
    ? audioMedia.url
    : "/demos/surprise/loveSong.mp3";

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
    audio.play().catch(() => {});
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

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Pacifico&display=swap');

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
          color: #d6336c;
          font-size: 3.5rem;
          margin-bottom: 50px;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
          animation: rFadeIn 2s ease-in;
          line-height: 1.2;
          font-family: 'Pacifico', cursive;
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
        .tiny-text-el {
          color: #d6336c;
          font-family: 'Dancing Script', cursive;
          font-size: 1.2rem;
          margin-top: 12px;
          opacity: 0;
          animation: rSlideUp 1s ease-out 1.2s forwards;
          pointer-events: none;
        }
        .scroll-hint-el {
          color: #d6336c;
          font-family: 'Dancing Script', cursive;
          font-size: 1.5rem;
          font-weight: bold;
          opacity: 0;
          animation: rSlideUp 1s ease-out 1.5s forwards;
          pointer-events: none;
        }

        /* Portrait */
        .portrait-page {
          width: 100%;
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          z-index: 10;
          flex-direction: column;
          gap: 24px;
        }

        /* Love letter */
        .love-letter-btn {
          background: rgba(255,255,255,0.9);
          color: #d6336c;
          border: none;
          border-radius: 40px;
          padding: 12px 28px;
          font-family: 'Dancing Script', cursive;
          font-size: 1.4rem;
          font-weight: bold;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(214,51,108,0.3);
          transition: all 0.3s ease;
          z-index: 10;
        }
        .love-letter-btn:hover { transform: scale(1.05); }
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

        /* Continue to proposal */
        .continue-btn {
          background: #ff4d6d;
          color: white;
          border: none;
          border-radius: 40px;
          padding: 14px 36px;
          font-size: 1.1rem;
          font-weight: bold;
          cursor: pointer;
          font-family: sans-serif;
          box-shadow: 0 4px 20px rgba(255,77,109,0.5);
          transition: all 0.3s ease;
          z-index: 10;
        }
        .continue-btn:hover { transform: scale(1.05); background: #e8003d; }

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
              <div className="tiny-text-el">I made this tiny</div>
              <div className="scroll-hint-el">scroll down ↓</div>
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
            >
              <TextArtPortrait src={displayPhoto} phrase="LOVE YOU" />

              {/* Love letter */}
              {!showLetter ? (
                <button
                  className="love-letter-btn"
                  onClick={() => setShowLetter(true)}
                >
                  💌 Read My Message
                </button>
              ) : (
                <motion.div
                  className="love-letter-box"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  "{displayLetter}"
                </motion.div>
              )}

              {/* Continue to proposal */}
              <button className="continue-btn" onClick={() => setStage(3)}>
                ✨ Continue
              </button>
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
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                maxWidth: "700px",
                padding: "20px",
                textAlign: "center",
              }}
            >
              <h1
                style={{
                  fontFamily: "'Pacifico', cursive",
                  fontSize: "clamp(2rem,6vw,4rem)",
                  color: "#ff4d6d",
                  textShadow: "2px 2px 8px rgba(0,0,0,0.3)",
                  marginBottom: 48,
                  lineHeight: 1.3,
                }}
              >
                {question || "Will you be mine? 💖"}
              </h1>
              <div style={{ display: "flex", gap: 24, flexWrap: "wrap", justifyContent: "center" }}>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleAccept}
                  style={{
                    padding: "18px 48px",
                    background: "#ff4d6d",
                    color: "white",
                    border: "none",
                    borderRadius: 40,
                    fontSize: "1.4rem",
                    fontWeight: "bold",
                    cursor: "pointer",
                    boxShadow: "0 6px 30px rgba(255,77,109,0.5)",
                    fontFamily: "sans-serif",
                  }}
                >
                  {acceptBtn || "Yes! 😍"}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 0.9 }}
                  whileTap={{ scale: 0.8 }}
                  onClick={handleReject}
                  style={{
                    padding: "18px 48px",
                    background: "#1e293b",
                    color: "white",
                    border: "none",
                    borderRadius: 40,
                    fontSize: "1.4rem",
                    fontWeight: "bold",
                    cursor: "pointer",
                    fontFamily: "sans-serif",
                  }}
                >
                  {rejectBtn || "No 🙈"}
                </motion.button>
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
    </>
  );
}
