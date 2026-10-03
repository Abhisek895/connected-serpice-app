"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
} from "react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { Heart, ChevronRight, Send, Volume2, VolumeX } from "lucide-react";
import {
  WHISPER_DEFAULT_AUDIO_URL,
  DEFAULT_PUJA_DAYS,
  DEFAULT_PUJA_VIBE_OPTIONS,
  DEFAULT_FOOD_OPTIONS,
} from "@/lib/templates/sharodya-whisper";

// ─────────────────────────────────────────────────────────────────────────────
// SVG COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function MarigoldGarlandBorder({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 360 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-full pointer-events-none ${className}`}
      aria-hidden="true"
    >
      {[0, 45, 90, 135, 180, 225, 270, 315].map((x, i) => (
        <g key={i} transform={`translate(${x},10)`}>
          {/* Petals */}
          {[0, 72, 144, 216, 288].map((angle, j) => (
            <ellipse
              key={j}
              cx={0}
              cy={-5}
              rx={2}
              ry={4.5}
              fill="#F4B942"
              opacity={0.85}
              transform={`rotate(${angle})`}
            />
          ))}
          {/* Center */}
          <circle cx={0} cy={0} r={2} fill="#E8791A" />
          {/* Dots between */}
          <circle cx={22} cy={0} r={1.2} fill="#5C7A5E" opacity={0.6} />
        </g>
      ))}
    </svg>
  );
}

function LotusWatermark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`pointer-events-none absolute inset-0 m-auto ${className}`}
      aria-hidden="true"
    >
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
        <ellipse
          key={i}
          cx={100}
          cy={100}
          rx={18}
          ry={50}
          fill="#E8791A"
          fillOpacity={0.07}
          transform={`rotate(${angle} 100 100)`}
        />
      ))}
      <circle cx={100} cy={100} r={12} fill="#E8791A" fillOpacity={0.1} />
    </svg>
  );
}

function EnvelopeSVG() {
  return (
    <svg
      viewBox="0 0 180 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-44 h-auto drop-shadow-lg"
      aria-hidden="true"
    >
      {/* Envelope body */}
      <rect x="4" y="24" width="172" height="92" rx="10" fill="#FDF5E6" stroke="#F4B942" strokeWidth="1.5" />
      {/* Envelope flap */}
      <path d="M4 34 L90 78 L176 34" stroke="#E8C97A" strokeWidth="1.5" fill="none" />
      {/* Left fold */}
      <path d="M4 24 L4 116 L55 70 Z" fill="#F0E6CF" opacity={0.5} />
      {/* Right fold */}
      <path d="M176 24 L176 116 L125 70 Z" fill="#F0E6CF" opacity={0.5} />
      {/* Wax seal ring */}
      <circle cx="90" cy="52" r="16" fill="#E8791A" opacity={0.15} />
      <circle cx="90" cy="52" r="11" fill="#E8791A" opacity={0.9} />
      {/* Marigold on seal */}
      {[0, 72, 144, 216, 288].map((angle, i) => (
        <ellipse
          key={i}
          cx={90}
          cy={52 - 5}
          rx={2}
          ry={4}
          fill="#F4B942"
          transform={`rotate(${angle} 90 52)`}
        />
      ))}
      <circle cx="90" cy="52" r="2.5" fill="#FFF8F0" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SHIULI PETALS — bright-mode (lighter, for cream background)
// ─────────────────────────────────────────────────────────────────────────────

function ShiuliBrightPetals({ reducedMotion = false }: { reducedMotion: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (reducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const count = width < 500 ? 28 : 45;
    const flowers = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 5 + Math.random() * 7,
      speedY: 0.4 + Math.random() * 0.7,
      speedX: -0.2 + Math.random() * 0.4,
      angle: Math.random() * Math.PI * 2,
      spinSpeed: (Math.random() - 0.5) * 0.025,
      opacity: 0.25 + Math.random() * 0.35,
    }));

    const drawShiuli = (x: number, y: number, size: number, angle: number, opacity: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.globalAlpha = opacity;
      ctx.fillStyle = "#FFFFFF";
      for (let i = 0; i < 5; i++) {
        ctx.save();
        ctx.rotate((i * 2 * Math.PI) / 5);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(size * 0.4, -size * 0.7, 0, -size);
        ctx.quadraticCurveTo(-size * 0.4, -size * 0.7, 0, 0);
        ctx.fill();
        ctx.restore();
      }
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.22, 0, Math.PI * 2);
      ctx.fillStyle = "#E85D35";
      ctx.fill();
      ctx.restore();
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      for (const f of flowers) {
        f.y += f.speedY;
        f.x += f.speedX + Math.sin(f.y * 0.01) * 0.25;
        f.angle += f.spinSpeed;
        if (f.y > height + 20) { f.y = -20; f.x = Math.random() * width; }
        if (f.x < -20) f.x = width + 20;
        if (f.x > width + 20) f.x = -20;
        drawShiuli(f.x, f.y, f.size, f.angle, f.opacity);
      }
      animId = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animId);
    };
  }, [reducedMotion]);

  if (reducedMotion) return null;
  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-10 w-full h-full"
      aria-hidden="true"
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CONFETTI BURST — marigold + shiuli on YES
// ─────────────────────────────────────────────────────────────────────────────

function ConfettiBurst({ active, reducedMotion }: { active: boolean; reducedMotion: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!active || reducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.parentElement?.clientWidth || 400;
    canvas.height = canvas.parentElement?.clientHeight || 600;
    const W = canvas.width;
    const H = canvas.height;

    const colors = ["#F4B942", "#E8791A", "#C05B7A", "#FFFFFF", "#5C7A5E"];
    const particles = Array.from({ length: 60 }, () => ({
      x: W / 2,
      y: H * 0.45,
      vx: (Math.random() - 0.5) * 10,
      vy: -Math.random() * 12 - 4,
      size: 4 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      gravity: 0.3 + Math.random() * 0.2,
      alpha: 1,
    }));

    let frame = 0;
    const render = () => {
      ctx.clearRect(0, 0, W, H);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.alpha -= 0.012;
        if (p.alpha <= 0) continue;
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      frame++;
      if (frame < 140) animRef.current = requestAnimationFrame(render);
      else ctx.clearRect(0, 0, W, H);
    };
    render();

    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [active, reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-20 w-full h-full"
      aria-hidden="true"
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PLANNING PROGRESS BAR
// ─────────────────────────────────────────────────────────────────────────────

function PlanningProgressBar({ step }: { step: number }) {
  const steps = ["The Day", "Our Vibe", "Food", "Secret"];
  return (
    <div className="flex items-center justify-center gap-2 mb-4">
      {steps.map((label, i) => {
        const isActive = i < step;
        const isCurrent = i === step - 1;
        return (
          <div key={i} className="flex flex-col items-center gap-1">
            <div
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${isActive ? "bg-[#E8791A] scale-110" : "bg-[#E8791A]/25"
                } ${isCurrent ? "ring-2 ring-[#E8791A]/40 ring-offset-1 ring-offset-[#FFF8F0]" : ""}`}
            />
            <span className={`text-[9px] tracking-wider font-medium uppercase transition-colors ${isActive ? "text-[#E8791A]" : "text-[#5C3D2E]/40"}`}>
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface SharodyaWhisperTemplateProps {
  slug?: string;
  recipientName?: string;
  title?: string;
  loveMessage?: string;
  customData?: Record<string, any>;
  audioUrl?: string;
  onResponse?: (action: string, data: any) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN TEMPLATE
// ─────────────────────────────────────────────────────────────────────────────

export default function SharodyaWhisperTemplate(props: SharodyaWhisperTemplateProps) {
  const custom = props.customData || {};

  const recipientName = props.recipientName || custom.recipientName || "Riya";
  const creatorName = custom.creatorName || "Ayan";
  const memoryMessage =
    props.loveMessage ||
    custom.memoryMessage ||
    "Last Ashtami, you were laughing at something the dhaki played wrong. I remember thinking — I want to be standing next to you every time you laugh like that.";
  const secretMessage =
    custom.secretMessage ||
    "I already know which phuchka stall I want to take you to. I've been saving it. 🧆 And I want the first photo we take together this Puja to be the one we both keep.";
  const vibeHint = custom.vibeHint || "";
  const creatorFavFood = custom.creatorFavFood || "phuchka";

  // Food choices
  const foodChoices = useMemo(() => {
    if (Array.isArray(custom.foodOptions) && custom.foodOptions.length > 0) {
      return custom.foodOptions.map((item: string | any) => {
        if (typeof item === "string") {
          const match = DEFAULT_FOOD_OPTIONS.find(
            (f) => f.id.toLowerCase() === item.toLowerCase() || f.name.toLowerCase() === item.toLowerCase()
          );
          return match || { id: item.toLowerCase().replace(/\s+/g, "-"), name: item, icon: "🍽️", desc: "Festival treat" };
        }
        return item;
      });
    }
    return DEFAULT_FOOD_OPTIONS;
  }, [custom.foodOptions]);

  // Screens:
  // 1  = Letter Arrives
  // 2  = The Memory
  // 3  = This Autumn
  // 4  = The Question
  // 4.5 = Soft Decline
  // 5  = Celebration
  // 6  = Which Day (plan step 1)
  // 7  = Our Vibe (plan step 2)
  // 8  = Food Journey (plan step 3)
  // 9  = One Last Thing / Secret (plan step 4)
  // 10 = Final Letter
  const [currentScreen, setCurrentScreen] = useState<number>(1);
  const [showConfetti, setShowConfetti] = useState(false);

  // Selections
  const [selectedDay, setSelectedDay] = useState<string>("ashtami");
  const [selectedVibe, setSelectedVibe] = useState<string>("evening");
  const [selectedFoods, setSelectedFoods] = useState<string[]>([foodChoices[0]?.id || "phuchka"]);
  const [recipientNote, setRecipientNote] = useState<string>("");
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Audio
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isAudioActive, setIsAudioActive] = useState<boolean>(false);
  const effectiveAudioUrl = props.audioUrl || custom.audioUrl || WHISPER_DEFAULT_AUDIO_URL;

  const reducedMotion = useReducedMotion() ?? false;

  const noteRef = useRef("");
  useEffect(() => { noteRef.current = recipientNote; }, [recipientNote]);

  // beforeunload save on final screen
  useEffect(() => {
    if (currentScreen !== 10) return;
    const save = () => {
      const payload = buildPayload("ACCEPTED");
      if (props.slug) {
        fetch(`/api/invitations/${props.slug}/respond`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          keepalive: true,
        }).catch(() => { });
      }
    };
    window.addEventListener("beforeunload", save);
    return () => window.removeEventListener("beforeunload", save);
  }, [currentScreen, selectedDay, selectedVibe, selectedFoods, recipientNote]);

  const buildPayload = (status: string) => ({
    eventId: props.slug || custom.eventId || "puja-whisper",
    action: status,
    metadata: {
      status,
      recipientName,
      creatorName,
      selectedDay,
      selectedVibe,
      selectedFoods,
      recipientNote: noteRef.current,
      submittedAt: new Date().toISOString(),
    },
  });

  const submitResponse = async (
    status: "ACCEPTED" | "THINKING" | "STARTED_PLANNING" | "PLANNING_COMPLETE",
    forceUpdate = false
  ) => {
    if (hasSubmitted && !forceUpdate || isSubmitting) return;
    setIsSubmitting(true);
    const payload = buildPayload(status);
    try {
      if (props.slug) {
        await fetch(`/api/invitations/${props.slug}/respond`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).catch(async () => {
          await fetch("/api/response", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        });
      }
      if (props.onResponse) props.onResponse(status, payload.metadata);
      setHasSubmitted(true);
    } catch (e) {
      console.warn("Failed to record response:", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAudio = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(effectiveAudioUrl);
      audioRef.current.loop = true;
    }
    if (isAudioActive) {
      audioRef.current.pause();
      setIsAudioActive(false);
    } else {
      audioRef.current.play().then(() => setIsAudioActive(true)).catch(() => { });
    }
  };

  const handleOpenLetter = () => {
    // Softly start audio on first interaction
    if (!isAudioActive) {
      if (!audioRef.current) {
        audioRef.current = new Audio(effectiveAudioUrl);
        audioRef.current.loop = true;
      }
      audioRef.current.play().then(() => setIsAudioActive(true)).catch(() => { });
    }
    setCurrentScreen(2);
  };

  const handleYes = () => {
    submitResponse("STARTED_PLANNING");
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2800);
    setCurrentScreen(5);
  };

  const toggleFood = (id: string) => {
    setSelectedFoods((prev) =>
      prev.includes(id)
        ? prev.length > 1 ? prev.filter((x) => x !== id) : prev
        : [...prev, id]
    );
  };

  // Shared animation variants
  const pv: Variants = {
    initial: { opacity: 0, y: reducedMotion ? 0 : 18 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, y: reducedMotion ? 0 : -12, transition: { duration: 0.32 } },
  };

  // Stagger variant for letter text
  const letterContainer: Variants = {
    animate: { transition: { staggerChildren: 0.08 } },
  };
  const letterLine: Variants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  // ─── Shared button styles ───
  const btnPrimary =
    "w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#E8791A] to-[#C05B4A] text-white font-semibold text-sm tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-[#E8791A]/25 hover:shadow-[#E8791A]/40 transition-all hover:scale-[1.02] active:scale-[0.98]";
  const btnOutline =
    "w-full py-3.5 px-6 rounded-2xl border border-[#2C1A0E]/20 text-[#5C3D2E] font-medium text-sm tracking-wide flex items-center justify-center gap-2 hover:border-[#E8791A]/50 hover:text-[#E8791A] transition-all";
  const btnSmallBack =
    "py-3 px-4 rounded-xl border border-[#2C1A0E]/15 text-xs text-[#5C3D2E]/70 hover:text-[#5C3D2E] transition-colors";

  const selectedDayLabel = DEFAULT_PUJA_DAYS.find((d) => d.id === selectedDay)?.subtitle || selectedDay;
  const selectedVibeLabel = DEFAULT_PUJA_VIBE_OPTIONS.find((v) => v.id === selectedVibe)?.title || selectedVibe;
  const selectedFoodLabels = foodChoices
    .filter((f: any) => selectedFoods.includes(f.id))
    .map((f: any) => f.name)
    .join(", ") || "good food";

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden flex flex-col bg-[#FFF1DC]"
    >
      {/* Cinematic Mandap Background with Ken Burns Effect */}
      <motion.div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-[0.45] mix-blend-multiply"
        style={{ backgroundImage: "url('/images/vibes/rajbari.jpg')" }}
        animate={reducedMotion ? {} : { scale: [1.02, 1.15, 1.02] }}
        transition={{ duration: 45, ease: "linear", repeat: Infinity }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#FFF1DC]/40 via-transparent to-[#FFD9AD]/80" />
      {/* Petals layer */}
      <ShiuliBrightPetals reducedMotion={reducedMotion} />

      {/* Confetti on YES */}
      <ConfettiBurst active={showConfetti} reducedMotion={reducedMotion} />

      {/* Top bar */}
      <header className="relative z-30 flex items-center justify-between px-4 sm:px-6 py-4 max-w-lg mx-auto w-full">
        <div className="flex items-center gap-1.5 opacity-60 text-xs tracking-widest uppercase text-[#5C3D2E]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E8791A]" />
          <span>Sharodiya 2026</span>
        </div>
        <button
          onClick={toggleAudio}
          type="button"
          aria-label={isAudioActive ? "Mute music" : "Play music"}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-white/60 backdrop-blur-md border border-[#E8791A]/25 text-[#5C3D2E] shadow-sm hover:border-[#E8791A]/60 transition-all"
        >
          {isAudioActive ? (
            <>
              <Volume2 className="w-3.5 h-3.5 text-[#E8791A] animate-pulse" />
              <span className="text-[#E8791A]">Sound on</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5 opacity-40" />
              <span className="opacity-60">Sound off</span>
            </>
          )}
        </button>
      </header>

      {/* Main */}
      <main className="relative z-20 flex-1 flex flex-col justify-center items-center px-4 sm:px-6 py-6 max-w-lg mx-auto w-full">
        <AnimatePresence mode="wait">

          {/* ================================================================ */}
          {/* SCREEN 1 — The Letter Arrives                                    */}
          {/* ================================================================ */}
          {currentScreen === 1 && (
            <motion.div
              key="s1"
              variants={pv}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full flex flex-col items-center text-center gap-7"
            >
              {/* ambient glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-[#E8791A]/10 blur-3xl pointer-events-none" />

              {/* Floating envelope */}
              <motion.div
                animate={reducedMotion ? {} : { y: [0, -10, 0] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
              >
                <EnvelopeSVG />
              </motion.div>

              <div className="space-y-2">
                <h1
                  className="text-3xl sm:text-4xl font-bold text-[#2C1A0E] tracking-wide"
                  style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
                >
                  তোমার জন্য একটা চিঠি এসেছে
                </h1>
                <p
                  className="text-base sm:text-lg text-[#5C3D2E]/80 italic"
                  style={{ fontFamily: "Lora, Georgia, serif" }}
                >
                  {recipientName}, someone made this for you.
                </p>
              </div>

              <p className="text-xs text-[#5C3D2E]/55 tracking-wider">
                Tap below to open your letter
              </p>

              <div className="w-full max-w-xs pt-2">
                <button onClick={handleOpenLetter} id="open-letter-btn" className={btnPrimary}>
                  <span>Open the letter</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ================================================================ */}
          {/* SCREEN 2 — The Memory (Reciprocity)                              */}
          {/* ================================================================ */}
          {currentScreen === 2 && (
            <motion.div
              key="s2"
              variants={pv}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-[#F4B942]/30 overflow-hidden"
            >
              {/* Garland header */}
              <div className="bg-gradient-to-r from-[#FFF1DC] to-[#FFE4B5] px-6 pt-5 pb-3">
                <MarigoldGarlandBorder className="h-5 opacity-80" />
              </div>

              <div className="p-6 sm:p-8 space-y-5">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-widest text-[#E8791A] font-semibold">
                    A letter for you
                  </span>
                  <h2
                    className="text-2xl sm:text-3xl font-bold text-[#2C1A0E]"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    {recipientName}
                  </h2>
                </div>

                <motion.div
                  variants={letterContainer}
                  initial="initial"
                  animate="animate"
                  className="space-y-3"
                  style={{ fontFamily: "Lora, Georgia, serif" }}
                >
                  <motion.p variants={letterLine} className="text-sm sm:text-base text-[#5C3D2E] leading-relaxed">
                    There&apos;s a Puja memory I&apos;ve kept with me for a long time.
                  </motion.p>
                  <motion.div
                    variants={letterLine}
                    className="px-4 py-3.5 rounded-2xl bg-[#FFF8F0] border-l-4 border-[#E8791A]/60 text-sm text-[#5C3D2E] italic leading-relaxed"
                  >
                    &ldquo;{memoryMessage}&rdquo;
                  </motion.div>
                  <motion.p variants={letterLine} className="text-sm sm:text-base text-[#5C3D2E]/80 leading-relaxed">
                    I don&apos;t know when autumn started feeling like you.
                  </motion.p>
                  <motion.p variants={letterLine} className="text-sm font-medium text-[#2C1A0E] leading-relaxed">
                    But it does now.
                  </motion.p>
                  <motion.p
                    variants={letterLine}
                    className="text-right text-xs italic text-[#5C3D2E]/70 pt-1"
                    style={{ fontFamily: "Lora, Georgia, serif" }}
                  >
                    — {creatorName}
                  </motion.p>
                </motion.div>

                <div className="pt-2">
                  <p className="text-xs text-[#5C3D2E]/55 text-center mb-3">
                    So I wanted to ask you something...
                  </p>
                  <button
                    onClick={() => setCurrentScreen(3)}
                    className={btnPrimary}
                    id="continue-reading-btn"
                  >
                    <span>Continue reading</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ================================================================ */}
          {/* SCREEN 3 — This Autumn (Scarcity)                               */}
          {/* ================================================================ */}
          {currentScreen === 3 && (
            <motion.div
              key="s3"
              variants={pv}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full space-y-4"
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-[#F4B942]/30 overflow-hidden">
                <div className="grid grid-cols-[1fr_1.5fr]">
                  {/* Left saffron panel */}
                  <div
                    className="flex flex-col items-center justify-center py-8 gap-4"
                    style={{ background: "linear-gradient(160deg,#F4B942,#E8791A)" }}
                  >
                    <p
                      className="text-white text-4xl font-bold opacity-90"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      ২০২৬
                    </p>
                    {/* 5 Puja day dots as mini marigolds */}
                    <div className="flex flex-col gap-2 items-center">
                      {DEFAULT_PUJA_DAYS.map((day, i) => {
                        const isHl = i === 2; // Ashtami highlighted
                        return (
                          <motion.div
                            key={day.id}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: i * 0.12, type: "spring", stiffness: 300 }}
                            className={`flex items-center gap-2 ${isHl ? "scale-110" : "opacity-60"}`}
                          >
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isHl
                                  ? "bg-white border-white"
                                  : "border-white/60"
                                }`}
                            >
                              {isHl && <div className="w-2.5 h-2.5 rounded-full bg-[#E8791A]" />}
                            </div>
                            <span className="text-[10px] text-white/90 font-medium">{day.subtitle}</span>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right text */}
                  <div
                    className="p-5 flex flex-col justify-center space-y-3"
                    style={{ fontFamily: "Lora, Georgia, serif" }}
                  >
                    <h2
                      className="text-lg sm:text-xl font-bold text-[#2C1A0E] leading-snug"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      Durga Puja only comes once a year.
                    </h2>
                    <p className="text-xs sm:text-sm text-[#5C3D2E] leading-relaxed">
                      And within those five days, there are maybe 48 hours that actually feel like magic.
                    </p>
                    <p className="text-xs sm:text-sm font-semibold text-[#E8791A] leading-relaxed">
                      I want to spend some of those hours with you.
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <p className="text-xs text-[#5C3D2E]/60 italic mb-4" style={{ fontFamily: "Lora, serif" }}>
                  There&apos;s a question waiting for you on the next page.
                </p>
                <button
                  onClick={() => setCurrentScreen(4)}
                  id="to-question-btn"
                  className={btnPrimary}
                >
                  <span>See the question</span>
                  <motion.span
                    animate={reducedMotion ? {} : { y: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    ↓
                  </motion.span>
                </button>
              </div>
            </motion.div>
          )}

          {/* ================================================================ */}
          {/* SCREEN 4 — The Question                                         */}
          {/* ================================================================ */}
          {currentScreen === 4 && (
            <motion.div
              key="s4"
              variants={pv}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full flex flex-col items-center text-center gap-8"
            >
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <LotusWatermark className="w-72 h-72 opacity-100" />
              </div>

              <motion.div
                className="space-y-4 relative z-10"
                initial="initial"
                animate="animate"
                variants={{ animate: { transition: { staggerChildren: 0.1 } } }}
              >
                <motion.h2
                  variants={letterLine}
                  className="text-4xl sm:text-5xl font-bold text-[#2C1A0E] leading-tight"
                  style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
                >
                  আমার সাথে পুজোয় যাবে?
                </motion.h2>
                <motion.p
                  variants={letterLine}
                  className="text-lg sm:text-xl italic text-[#E8791A]"
                  style={{ fontFamily: "Lora, Georgia, serif" }}
                >
                  Will you come to Puja with me?
                </motion.p>
                <motion.p variants={letterLine} className="text-xs text-[#5C3D2E]/60 tracking-wide">
                  — {creatorName}
                </motion.p>
              </motion.div>

              <div className="w-full max-w-xs space-y-3 relative z-10">
                {/* YES */}
                <motion.button
                  onClick={handleYes}
                  id="yes-btn"
                  className={btnPrimary}
                  animate={reducedMotion ? {} : { scale: [1, 1.02, 1] }}
                  transition={{ duration: 2.2, repeat: Infinity }}
                >
                  <Heart className="w-4 h-4 fill-white text-white" />
                  <span>হ্যাঁ, যাবো 🌺</span>
                </motion.button>

                {/* Soft decline */}
                <button
                  onClick={() => { submitResponse("THINKING"); setCurrentScreen(4.5); }}
                  id="thinking-btn"
                  className={btnOutline}
                >
                  <span>আমাকে একটু ভাবতে দাও…</span>
                </button>
              </div>

              <p className="text-[11px] text-[#5C3D2E]/40 relative z-10">
                Purely your choice. No rush, no pressure.
              </p>
            </motion.div>
          )}

          {/* ================================================================ */}
          {/* SCREEN 4.5 — Soft Decline                                       */}
          {/* ================================================================ */}
          {currentScreen === 3.5 || currentScreen === 4.5 ? (
            <motion.div
              key="s4-5"
              variants={pv}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full bg-white/75 backdrop-blur-sm rounded-3xl shadow-lg border border-[#F4B942]/20 p-6 sm:p-8 text-center space-y-6"
            >
              <div className="w-12 h-12 rounded-full bg-[#E8791A]/10 border border-[#E8791A]/25 mx-auto flex items-center justify-center">
                <span className="text-2xl">🌸</span>
              </div>
              <div className="space-y-2">
                <h3
                  className="text-2xl font-bold text-[#2C1A0E]"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Of course. No rush.
                </h3>
                <p
                  className="text-sm text-[#5C3D2E] leading-relaxed"
                  style={{ fontFamily: "Lora, serif" }}
                >
                  The invitation stays here, whenever you&apos;re ready.
                </p>
              </div>
              <p className="text-xs text-[#5C3D2E]/50 italic" style={{ fontFamily: "Lora, serif" }}>
                You can always come back to this page.
              </p>
              <div className="pt-2 space-y-2.5">
                <button
                  onClick={handleYes}
                  id="actually-yes-btn"
                  className={btnPrimary}
                >
                  <span>Actually, yes — let&apos;s go 🌺</span>
                </button>
                <button
                  onClick={() => setCurrentScreen(1)}
                  className="text-xs text-[#5C3D2E]/60 hover:text-[#E8791A] transition-colors underline underline-offset-2"
                >
                  Back to the beginning
                </button>
              </div>
            </motion.div>
          ) : null}

          {/* ================================================================ */}
          {/* SCREEN 5 — Celebration (Post-YES)                               */}
          {/* ================================================================ */}
          {currentScreen === 5 && (
            <motion.div
              key="s5"
              variants={pv}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full text-center space-y-6 relative"
            >
              <LotusWatermark className="w-64 h-64 opacity-100" />

              <div className="relative z-10 space-y-6">
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.15, type: "spring", stiffness: 250 }}
                  className="w-16 h-16 rounded-full bg-white/80 border-2 border-[#F4B942] mx-auto flex items-center justify-center shadow-xl shadow-[#E8791A]/20"
                >
                  <Heart className="w-8 h-8 fill-rose-500 text-rose-500" />
                </motion.div>

                <div className="space-y-2">
                  <h2
                    className="text-3xl sm:text-4xl font-bold text-[#2C1A0E]"
                    style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
                  >
                    তাহলে ঠিক রইলো! 🌺
                  </h2>
                  <p
                    className="text-base sm:text-lg italic text-[#5C3D2E]"
                    style={{ fontFamily: "Lora, serif" }}
                  >
                    This Puja is going to be something special.
                  </p>
                  <p className="text-xs text-[#E8791A]">— {creatorName}</p>
                </div>

                <div className="p-4 rounded-2xl bg-white/70 border border-[#F4B942]/40 max-w-sm mx-auto shadow-sm">
                  <p className="text-sm italic text-[#5C3D2E]" style={{ fontFamily: "Lora, serif" }}>
                    Let&apos;s make a little plan together.
                  </p>
                </div>

                <button
                  onClick={() => setCurrentScreen(6)}
                  id="plan-day-btn"
                  className={btnPrimary}
                >
                  <span>Plan the day →</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* ================================================================ */}
          {/* SCREEN 6 — Which Day? (Plan Step 1)                             */}
          {/* ================================================================ */}
          {currentScreen === 6 && (
            <motion.div
              key="s6"
              variants={pv}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full space-y-4"
            >
              <PlanningProgressBar step={1} />
              <div className="text-center space-y-1">
                <h2
                  className="text-2xl sm:text-3xl font-bold text-[#2C1A0E]"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Which day feels right?
                </h2>
                <p className="text-xs text-[#5C3D2E]/60 italic" style={{ fontFamily: "Lora, serif" }}>
                  There&apos;s no wrong answer — just yours.
                </p>
              </div>

              <div className="space-y-2.5 max-h-[52vh] overflow-y-auto pr-1">
                {DEFAULT_PUJA_DAYS.map((day) => {
                  const isSel = selectedDay === day.id;
                  return (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => setSelectedDay(day.id)}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-start gap-3.5 ${isSel
                          ? "bg-white border-[#E8791A] shadow-md shadow-[#E8791A]/15 ring-1 ring-[#E8791A]/40"
                          : "bg-white/60 border-[#2C1A0E]/10 hover:border-[#E8791A]/40"
                        }`}
                    >
                      <span className="text-2xl mt-0.5">{day.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4
                            className="text-sm font-semibold text-[#2C1A0E]"
                            style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
                          >
                            {day.title}
                          </h4>
                          {isSel && (
                            <Heart className="w-4 h-4 fill-rose-400 text-rose-400 shrink-0" />
                          )}
                        </div>
                        <p className="text-[10px] text-[#5C3D2E]/70 mt-0.5">{day.subtitle} — {day.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <button onClick={() => setCurrentScreen(7)} id="day-next-btn" className={btnPrimary}>
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* ================================================================ */}
          {/* SCREEN 7 — Our Vibe (Plan Step 2)                               */}
          {/* ================================================================ */}
          {currentScreen === 7 && (
            <motion.div
              key="s7"
              variants={pv}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full space-y-4"
            >
              <PlanningProgressBar step={2} />
              <div className="text-center space-y-1">
                <h2
                  className="text-2xl sm:text-3xl font-bold text-[#2C1A0E]"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  What kind of day are we having?
                </h2>
                <p className="text-xs text-[#5C3D2E]/60 italic" style={{ fontFamily: "Lora, serif" }}>
                  Pick the vibe that feels like you.
                </p>
              </div>

              <div className="space-y-2.5 max-h-[40vh] overflow-y-auto pr-1">
                {DEFAULT_PUJA_VIBE_OPTIONS.map((opt) => {
                  const isSel = selectedVibe === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedVibe(opt.id)}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-start gap-3.5 ${isSel
                          ? "bg-white border-[#E8791A] shadow-md shadow-[#E8791A]/15 ring-1 ring-[#E8791A]/40"
                          : "bg-white/60 border-[#2C1A0E]/10 hover:border-[#E8791A]/40"
                        }`}
                    >
                      <span className="text-2xl mt-0.5">{opt.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-[#2C1A0E]">{opt.title}</h4>
                          {opt.subtitle && <span className="text-[10px] text-[#E8791A]/70" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>{opt.subtitle}</span>}
                        </div>
                        <p className="text-[10px] text-[#5C3D2E]/70 mt-0.5">{opt.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Creator vibe hint */}
              {vibeHint && (
                <div className="p-3 rounded-xl bg-[#FFF8F0] border border-[#F4B942]/40 text-xs text-[#5C3D2E] italic" style={{ fontFamily: "Lora, serif" }}>
                  💛 {creatorName} says: &ldquo;{vibeHint}&rdquo;
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button onClick={() => setCurrentScreen(6)} className={btnSmallBack}>Back</button>
                <button onClick={() => setCurrentScreen(8)} id="vibe-next-btn" className={`${btnPrimary} flex-1`}>
                  <span>Continue</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ================================================================ */}
          {/* SCREEN 8 — Food Journey (Plan Step 3)                           */}
          {/* ================================================================ */}
          {currentScreen === 8 && (
            <motion.div
              key="s8"
              variants={pv}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full space-y-4"
            >
              <PlanningProgressBar step={3} />
              <div className="text-center space-y-1">
                <h2
                  className="text-2xl sm:text-3xl font-bold text-[#2C1A0E]"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  What are we eating? 🤤
                </h2>
                <p className="text-xs text-[#5C3D2E]/60 italic" style={{ fontFamily: "Lora, serif" }}>
                  Pick all your Puja favorites
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 max-h-[48vh] overflow-y-auto pr-1">
                {foodChoices.map((food: any) => {
                  const isSel = selectedFoods.includes(food.id);
                  const isCreatorFav = food.id === creatorFavFood;
                  return (
                    <button
                      key={food.id}
                      type="button"
                      onClick={() => toggleFood(food.id)}
                      className={`relative text-left p-3 rounded-2xl border transition-all flex flex-col gap-2.5 ${isSel
                          ? "bg-white border-[#E8791A] shadow-md shadow-[#E8791A]/15 ring-1 ring-[#E8791A]/40"
                          : "bg-white/60 border-[#2C1A0E]/10 hover:border-[#E8791A]/30"
                        }`}
                    >
                      {/* Creator fav badge */}
                      {isCreatorFav && (
                        <span className="absolute top-1.5 right-1.5 text-[9px] bg-[#F4B942] text-[#2C1A0E] font-bold px-1.5 py-0.5 rounded-full leading-tight">
                          {creatorName}&apos;s fav 💛
                        </span>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-[#E8791A]/20 bg-[#FFF8F0] flex items-center justify-center shrink-0 shadow-sm">
                          {food.image ? (
                            <img src={food.image} alt={food.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xl">{food.icon}</span>
                          )}
                        </div>
                        {isSel && (
                          <span className="w-5 h-5 rounded-full bg-[#E8791A] text-white flex items-center justify-center text-[10px] font-bold">
                            ✓
                          </span>
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-semibold text-[#2C1A0E]">{food.name}</h4>
                        <p className="text-[10px] text-[#5C3D2E]/60 line-clamp-1 mt-0.5">{food.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-3 pt-1">
                <button onClick={() => setCurrentScreen(7)} className={btnSmallBack}>Back</button>
                <button onClick={() => setCurrentScreen(9)} id="food-next-btn" className={`${btnPrimary} flex-1`}>
                  <span>Continue</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ================================================================ */}
          {/* SCREEN 9 — One Last Thing / Secret (Plan Step 4)                */}
          {/* ================================================================ */}
          {currentScreen === 9 && (
            <motion.div
              key="s9"
              variants={pv}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full space-y-4"
            >
              <PlanningProgressBar step={4} />

              <motion.div
                className="rounded-3xl overflow-hidden shadow-xl"
                style={{ background: "linear-gradient(135deg,#F4B942 0%,#E8791A 60%,#C05B7A 100%)" }}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="p-7 sm:p-9 text-center space-y-5">
                  <h2
                    className="text-2xl sm:text-3xl font-bold text-white"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    One last thing...
                  </h2>

                  <p
                    className="text-sm sm:text-base text-white/90 leading-relaxed"
                    style={{ fontFamily: "Lora, serif" }}
                  >
                    {creatorName} wants to show you something.
                    <br />
                    It&apos;s a secret they&apos;ve been keeping.
                    <br />
                    They only want to share it with you.
                  </p>

                  {/* Sealed mini envelope */}
                  <motion.div
                    className="mx-auto w-24 h-16"
                    animate={reducedMotion ? {} : { y: [0, -6, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <svg viewBox="0 0 96 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <rect x="2" y="10" width="92" height="52" rx="6" fill="white" fillOpacity={0.9} />
                      <path d="M2 18 L48 40 L94 18" stroke="#F4B942" strokeWidth="1.5" fill="none" />
                      <circle cx="48" cy="30" r="9" fill="#E8791A" />
                      {[0, 72, 144, 216, 288].map((a, i) => (
                        <ellipse key={i} cx={48} cy={30 - 3} rx={1.2} ry={2.8} fill="white" transform={`rotate(${a} 48 30)`} />
                      ))}
                      <circle cx="48" cy="30" r="1.5" fill="#FFF8F0" />
                    </svg>
                  </motion.div>

                  <button
                    onClick={() => {
                      submitResponse("PLANNING_COMPLETE", true);
                      setCurrentScreen(10);
                    }}
                    id="show-secret-btn"
                    className="w-full py-3.5 px-6 rounded-2xl bg-white/20 hover:bg-white/30 border border-white/50 text-white font-semibold text-sm tracking-wide flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                  >
                    <span>Show me 💌</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>

              <button onClick={() => setCurrentScreen(8)} className={btnSmallBack + " w-full text-center"}>
                ← Back
              </button>
            </motion.div>
          )}

          {/* ================================================================ */}
          {/* SCREEN 10 — The Final Letter (Peak-End)                         */}
          {/* ================================================================ */}
          {currentScreen === 10 && (
            <motion.div
              key="s10"
              variants={pv}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full space-y-5 relative"
            >
              {/* Background lotus watermark */}
              <LotusWatermark className="w-72 h-72 opacity-100" />

              {/* Top garland */}
              <div className="bg-gradient-to-r from-[#FFF1DC] to-[#FFE4B5] px-4 py-3 rounded-2xl">
                <MarigoldGarlandBorder className="h-5 opacity-80" />
              </div>

              {/* The Letter */}
              <motion.div
                className="bg-white/85 backdrop-blur-sm rounded-3xl shadow-xl border border-[#F4B942]/30 p-6 sm:p-8 space-y-4 relative overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {/* Paper shimmer */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none"
                  initial={{ x: "-100%" }}
                  animate={{ x: "200%" }}
                  transition={{ delay: 0.4, duration: 1.2, ease: "easeInOut" }}
                />

                <motion.div
                  className="space-y-3.5"
                  variants={{ animate: { transition: { staggerChildren: 0.35 } } }}
                  initial="initial"
                  animate="animate"
                  style={{ fontFamily: "Lora, Georgia, serif" }}
                >
                  <motion.p variants={letterLine} className="text-xs text-[#5C3D2E]/60">
                    Dear {recipientName},
                  </motion.p>

                  <motion.p variants={letterLine} className="text-base sm:text-lg font-bold text-[#2C1A0E]" style={{ fontFamily: "'Playfair Display', serif" }}>
                    So it&apos;s decided. 🌺
                  </motion.p>

                  <motion.p variants={letterLine} className="text-sm text-[#5C3D2E] leading-relaxed">
                    We&apos;re going on{" "}
                    <strong className="text-[#E8791A]">{selectedDayLabel}</strong>.{" "}
                    {creatorName} will be waiting.
                  </motion.p>

                  <motion.p variants={letterLine} className="text-sm text-[#5C3D2E] leading-relaxed">
                    Our vibe will be{" "}
                    <strong className="text-[#E8791A]">{selectedVibeLabel}</strong>,
                    with{" "}
                    <strong className="text-[#E8791A]">{selectedFoodLabels}</strong> along the way.
                  </motion.p>

                  {/* Secret reveal */}
                  <motion.div
                    variants={letterLine}
                    className="p-4 rounded-2xl bg-gradient-to-r from-[#FFF8F0] to-[#FFEED5] border border-[#F4B942]/40"
                  >
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#E8791A] mb-1.5">
                      The Secret 🤫
                    </p>
                    <p className="text-sm text-[#5C3D2E] italic leading-relaxed">
                      &ldquo;{secretMessage}&rdquo;
                    </p>
                    <p className="text-right text-xs text-[#5C3D2E]/60 mt-2 not-italic">
                      — {creatorName}
                    </p>
                  </motion.div>

                  <motion.p variants={letterLine} className="text-sm font-medium text-[#E8791A] text-center">
                    And somewhere between the dhaker taal and the pandal lights, we&apos;ll make a memory that neither of us forgets.
                  </motion.p>
                </motion.div>
              </motion.div>

              {/* Names badge */}
              <div className="flex justify-center">
                <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/70 border border-[#F4B942]/50 text-xs tracking-wider shadow-sm">
                  <span className="font-semibold text-[#2C1A0E]">{creatorName}</span>
                  <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
                  <span className="font-semibold text-[#2C1A0E]">{recipientName}</span>
                </div>
              </div>

              <p
                className="text-center text-base text-[#E8791A] font-semibold"
                style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
              >
                শুভ শারদীয়া ২০২৬ 🌺
              </p>

              {/* Bottom garland */}
              <div className="bg-gradient-to-r from-[#FFF1DC] to-[#FFE4B5] px-4 py-3 rounded-2xl">
                <MarigoldGarlandBorder className="h-5 opacity-80" />
              </div>

              {/* Recipient note */}
              <div className="space-y-2">
                <label className="text-[11px] text-[#5C3D2E]/60 block">
                  Write {creatorName} a note back:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={recipientNote}
                    onChange={(e) => setRecipientNote(e.target.value)}
                    placeholder={`e.g. Can't wait! See you then ❤️`}
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-white/80 border border-[#E8791A]/20 text-xs text-[#2C1A0E] placeholder-[#5C3D2E]/40 focus:outline-none focus:border-[#E8791A]/60 transition-colors"
                  />
                  <button
                    onClick={async () => {
                      if (!recipientNote.trim()) return;
                      await submitResponse("ACCEPTED", true);
                    }}
                    disabled={isSubmitting}
                    className="px-3 py-2.5 rounded-xl bg-[#E8791A] text-white hover:bg-[#D06A10] text-xs flex items-center justify-center transition-all disabled:opacity-70"
                    title="Send note"
                  >
                    {isSubmitting ? (
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                {hasSubmitted && (
                  <p className="text-[11px] text-emerald-600 text-center pt-1">
                    ✓ Your plan is saved & shared with {creatorName}
                  </p>
                )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="relative z-30 p-4 text-center text-[10px] text-[#5C3D2E]/40 tracking-wider">
        <span>Curated with warmth • Sharodiya Whisper</span>
      </footer>
    </div>
  );
}
