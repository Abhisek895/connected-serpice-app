"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion, type Variants } from "framer-motion";
import {
  Heart,
  Volume2,
  VolumeX,
  ChevronRight,
  MapPin,
  Calendar,
  Clock,
  ExternalLink,
  Check,
  Send,
  Music,
  Compass,
  Smile,
  Flame,
} from "lucide-react";
import {
  DEFAULT_PUJA_DAYS,
  DEFAULT_PUJA_VIBE_OPTIONS,
  DEFAULT_ADVENTURE_OPTIONS,
  DEFAULT_FOOD_OPTIONS,
  DURGA_PUJA_THEME,
} from "@/lib/templates/durga-puja";

// ── Web Audio Dhak Synthesizer ──────────────────────────────────────────────
class DhakSoundEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private loopTimer: any = null;

  private init() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  // Play an authentic Dhak bass hit (Dha)
  private playDhakBass(time: number, accent = false) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    const startFreq = accent ? 130 : 110;
    osc.frequency.setValueAtTime(startFreq, time);
    osc.frequency.exponentialRampToValueAtTime(45, time + 0.18);

    gain.gain.setValueAtTime(accent ? 0.35 : 0.25, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.28);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + 0.3);
  }

  // Play Dhak stick rim click (Taa / Kaa)
  private playDhakRim(time: number, sharp = false) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(sharp ? 620 : 480, time);
    osc.frequency.exponentialRampToValueAtTime(160, time + 0.08);

    gain.gain.setValueAtTime(sharp ? 0.18 : 0.12, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.09);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + 0.1);
  }

  // Play subtle Kanshi shimmer (bell accent)
  private playKanshi(time: number) {
    if (!this.ctx) return;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = "sine";
    osc2.type = "sine";
    osc1.frequency.setValueAtTime(2400, time);
    osc2.frequency.setValueAtTime(2425, time); // slight detune for metallic shimmer

    gain.gain.setValueAtTime(0.04, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.45);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + 0.48);
    osc2.stop(time + 0.48);
  }

  public start() {
    this.init();
    if (!this.ctx || this.isPlaying) return;
    this.isPlaying = true;

    // Traditional Dhak Rhythm Loop (Dha-ki-ta Dha-ki-ta Dha, Taa-Kaa-Taa-Kaa)
    const stepDuration = 0.22; // ~136 BPM
    let step = 0;

    const playPattern = () => {
      if (!this.isPlaying || !this.ctx) return;
      const now = this.ctx.currentTime;

      // 8-step festive cycle
      const mod = step % 8;
      if (mod === 0) {
        this.playDhakBass(now, true);
        this.playKanshi(now);
      } else if (mod === 1) {
        this.playDhakRim(now, false);
      } else if (mod === 2) {
        this.playDhakBass(now, false);
      } else if (mod === 4) {
        this.playDhakBass(now, true);
        this.playKanshi(now);
      } else if (mod === 5) {
        this.playDhakRim(now, true);
      } else if (mod === 6) {
        this.playDhakRim(now, false);
      } else if (mod === 7) {
        this.playDhakRim(now, true);
      }

      step++;
      this.loopTimer = setTimeout(playPattern, stepDuration * 1000);
    };

    playPattern();
  }

  public stop() {
    this.isPlaying = false;
    if (this.loopTimer) {
      clearTimeout(this.loopTimer);
      this.loopTimer = null;
    }
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }
}

// ── Shiuli Flower Particle Canvas ──────────────────────────────────────────
function ShiuliFallingPetals({ reducedMotion = false }: { reducedMotion: boolean }) {
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

    // Shiuli flower particles
    const count = width < 500 ? 18 : 28;
    const flowers = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 7 + Math.random() * 8,
      speedY: 0.5 + Math.random() * 0.9,
      speedX: -0.3 + Math.random() * 0.6,
      angle: Math.random() * Math.PI * 2,
      spinSpeed: (Math.random() - 0.5) * 0.03,
      opacity: 0.35 + Math.random() * 0.5,
    }));

    const drawShiuli = (x: number, y: number, size: number, angle: number, opacity: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.globalAlpha = opacity;

      // 5 White Petals
      ctx.fillStyle = "#FFFFFF";
      for (let i = 0; i < 5; i++) {
        ctx.save();
        ctx.rotate((i * 2 * Math.PI) / 5);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(size * 0.45, -size * 0.75, 0, -size);
        ctx.quadraticCurveTo(-size * 0.45, -size * 0.75, 0, 0);
        ctx.fill();
        ctx.restore();
      }

      // Bright Orange / Coral Center tube (Authentic Shiuli trademark)
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.24, 0, Math.PI * 2);
      ctx.fillStyle = "#E85D35";
      ctx.fill();

      ctx.restore();
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      for (const f of flowers) {
        f.y += f.speedY;
        f.x += f.speedX + Math.sin(f.y * 0.01) * 0.3;
        f.angle += f.spinSpeed;

        if (f.y > height + 20) {
          f.y = -20;
          f.x = Math.random() * width;
        }
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

// ── Subtle Traditional Alpana Motif ────────────────────────────────────────
function AlpanaMotif({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`opacity-35 pointer-events-none ${className}`}
      aria-hidden="true"
    >
      <path
        d="M100 8 C92 24 68 28 50 30 C30 32 12 40 4 50 C22 45 42 42 65 40 C85 38 96 48 100 56 C104 48 115 38 135 40 C158 42 178 45 196 50 C188 40 170 32 150 30 C132 28 108 24 100 8 Z"
        fill="currentColor"
      />
      <circle cx="100" cy="30" r="3" fill="currentColor" />
      <circle cx="80" cy="34" r="2" fill="currentColor" />
      <circle cx="120" cy="34" r="2" fill="currentColor" />
      <circle cx="60" cy="36" r="1.5" fill="currentColor" />
      <circle cx="140" cy="36" r="1.5" fill="currentColor" />
    </svg>
  );
}

// ── Component Props ────────────────────────────────────────────────────────
export interface DurgaPujaTemplateProps {
  slug?: string;
  recipientName?: string;
  title?: string;
  loveMessage?: string;
  customData?: Record<string, any>;
  audioUrl?: string;
  onResponse?: (action: string, data: any) => void;
}

export default function DurgaPujaTemplate(props: DurgaPujaTemplateProps) {
  const custom = props.customData || {};
  const recipientName =
    props.recipientName || custom.recipientName || "Riya";
  const creatorName = custom.creatorName || "Ayan";
  const personalMessage =
    props.loveMessage ||
    custom.personalMessage ||
    "Puja has always been special, but this autumn I couldn't imagine walking under the pandal lights with anyone else.";

  const venueName = custom.venueName || "";
  const address = custom.address || "";
  const googleMapsUrl = custom.googleMapsUrl || "";
  const date = custom.date || "";
  const time = custom.time || "";

  // Food options: either creator customized or defaults
  const foodChoices = useMemo(() => {
    if (Array.isArray(custom.foodOptions) && custom.foodOptions.length > 0) {
      return custom.foodOptions.map((item: string | any) => {
        if (typeof item === "string") {
          const match = DEFAULT_FOOD_OPTIONS.find(
            (f) => f.name.toLowerCase() === item.toLowerCase()
          );
          return {
            id: item.toLowerCase().replace(/\s+/g, "-"),
            name: item,
            icon: match ? match.icon : "🍽️",
            desc: match ? match.desc : "Favorite festival treat",
          };
        }
        return item;
      });
    }
    return DEFAULT_FOOD_OPTIONS;
  }, [custom.foodOptions]);

  // Screen State
  // 1 = Opening ("শুভ শারদীয়া")
  // 2 = Personal Reveal (Warm Ivory, Name + Note)
  // 3 = Main Question ("আমার সাথে পুজোয় যাবে?")
  // 3.5 = Respectful Thinking Screen ("একটু ভাবি...")
  // 4 = After Yes Celebration ("তাহলে ঠিক রইলো!")
  // 5 = The Day
  // 6 = Puja Vibe
  // 7 = Adventure Style
  // 8 = Food Choices
  // 9 = Optional Location
  // 10 = Final Emotional Screen
  const [currentScreen, setCurrentScreen] = useState<number>(1);

  // Selections
  const [selectedDay, setSelectedDay] = useState<string>("ashtami");
  const [selectedVibe, setSelectedVibe] = useState<string>("evening");
  const [selectedAdventure, setSelectedAdventure] = useState<string>("walk");
  const [selectedFoods, setSelectedFoods] = useState<string[]>([
    foodChoices[0]?.id || "phuchka",
  ]);
  const [selectedLocationPref, setSelectedLocationPref] = useState<string>("close");
  const [recipientVenue, setRecipientVenue] = useState<string>("");
  const [recipientNote, setRecipientNote] = useState<string>("");
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Sound Engine
  const soundEngineRef = useRef<DhakSoundEngine | null>(null);
  const [isAudioActive, setIsAudioActive] = useState<boolean>(false);
  const customAudioRef = useRef<HTMLAudioElement | null>(null);

  const reducedMotion = useReducedMotion() ?? false;

  useEffect(() => {
    soundEngineRef.current = new DhakSoundEngine();
    return () => {
      if (soundEngineRef.current) {
        soundEngineRef.current.stop();
      }
      if (customAudioRef.current) {
        customAudioRef.current.pause();
      }
    };
  }, []);

  const effectiveAudioUrl =
    props.audioUrl ||
    custom.audioUrl ||
    "https://k4q9rpuc4cgssyjq.public.blob.vercel-storage.com/audio/mayabono_biharini_horini.mp3";

  const toggleSound = () => {
    if (!customAudioRef.current) {
      customAudioRef.current = new Audio(effectiveAudioUrl);
      customAudioRef.current.loop = true;
    }
    if (isAudioActive) {
      customAudioRef.current.pause();
      setIsAudioActive(false);
    } else {
      customAudioRef.current
        .play()
        .then(() => setIsAudioActive(true))
        .catch(() => {
          // Fallback to synthetic dhak engine if external audio is blocked
          if (soundEngineRef.current) {
            const active = soundEngineRef.current.toggle();
            setIsAudioActive(active);
          }
        });
    }
  };

  const handleOpenInvitation = () => {
    // Start audio softly upon first interaction
    if (!isAudioActive) {
      if (!customAudioRef.current) {
        customAudioRef.current = new Audio(effectiveAudioUrl);
        customAudioRef.current.loop = true;
      }
      customAudioRef.current
        .play()
        .then(() => setIsAudioActive(true))
        .catch(() => {
          if (soundEngineRef.current) {
            soundEngineRef.current.start();
            setIsAudioActive(true);
          }
        });
    }
    setCurrentScreen(2);
  };

  // Submit response to API
  const submitFinalResponse = async (status: "ACCEPTED" | "THINKING" | "STARTED_PLANNING", forceUpdate = false) => {
    if ((hasSubmitted && !forceUpdate) || isSubmitting) return;
    setIsSubmitting(true);

    const payload = {
      eventId: props.slug || custom.eventId || "durga-puja",
      action: status,
      metadata: {
        status,
        recipientName,
        creatorName,
        selectedDay,
        selectedVibe,
        selectedAdventure,
        selectedFoods,
        selectedLocationPref,
        recipientVenue,
        recipientNote,
        submittedAt: new Date().toISOString(),
      },
    };

    try {
      if (props.slug) {
        // Post to /api/invitations/[id]/respond or /api/response
        await fetch(`/api/invitations/${props.slug}/respond`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).catch(async () => {
          // Fallback to standard response API
          await fetch("/api/response", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        });
      }
      if (props.onResponse) {
        props.onResponse(status, payload.metadata);
      }
      setHasSubmitted(true);
    } catch (e) {
      console.warn("Failed to record response:", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendCustomNote = async () => {
    if (!recipientNote.trim()) return;
    await submitFinalResponse("ACCEPTED", true);
  };

  const toggleFoodSelection = (id: string) => {
    setSelectedFoods((prev) =>
      prev.includes(id)
        ? prev.length > 1
          ? prev.filter((item) => item !== id)
          : prev
        : [...prev, id]
    );
  };

  // Screen Transitions
  const pageVariants: Variants = {
    initial: { opacity: 0, y: reducedMotion ? 0 : 16 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const } },
    exit: { opacity: 0, y: reducedMotion ? 0 : -14, transition: { duration: 0.35 } },
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#161413] text-[#FDFBF7] font-sans select-none flex flex-col justify-between">
      {/* Falling Shiuli Petals */}
      <ShiuliFallingPetals reducedMotion={reducedMotion} />

      {/* Floating Sound Toggle */}
      <header className="relative z-30 flex items-center justify-between p-4 sm:p-6 max-w-lg mx-auto w-full">
        <div className="flex items-center gap-1.5 opacity-60 text-xs tracking-widest uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
          <span>Sharodiya 2026</span>
        </div>

        <button
          onClick={toggleSound}
          type="button"
          aria-label={isAudioActive ? "Mute festive sound" : "Enable festive sound"}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-[#24201D]/80 backdrop-blur-md border border-[#D4AF37]/30 text-[#FDFBF7] shadow-sm hover:border-[#D4AF37] transition-all"
        >
          {isAudioActive ? (
            <>
              <Volume2 className="w-3.5 h-3.5 text-[#D4AF37] animate-pulse" />
              <span className="text-[#D4AF37]">Sound on</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5 opacity-50" />
              <span className="opacity-70">Sound off</span>
            </>
          )}
        </button>
      </header>

      {/* Main Experience Container */}
      <main className="relative z-20 flex-1 flex flex-col justify-center items-center px-4 sm:px-6 py-6 max-w-lg mx-auto w-full">
        <AnimatePresence mode="wait">
          {/* =============================================================== */}
          {/* SCREEN 01 — OPENING                                             */}
          {/* =============================================================== */}
          {currentScreen === 1 && (
            <motion.div
              key="screen-1"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full flex flex-col items-center text-center space-y-7"
            >
              {/* Subtle Warm Amber Glow */}
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#C0422B]/15 blur-3xl rounded-full pointer-events-none" />

              <AlpanaMotif className="w-44 text-[#D4AF37]" />

              <div className="space-y-3">
                <h1 className="font-bengali text-4xl sm:text-5xl font-bold tracking-wide text-[#FDFBF7] drop-shadow-sm">
                  শুভ শারদীয়া
                </h1>
                <p className="text-xs uppercase tracking-[0.25em] text-[#D4AF37]/80 font-medium">
                  Autumn • Dhak • Adda
                </p>
              </div>

              <div className="space-y-2 max-w-xs text-sm text-[#FDFBF7]/75 font-editorial text-base sm:text-lg leading-relaxed italic">
                <p>Some invitations are meant to be sent.</p>
                <p className="text-[#FDFBF7]/90 font-medium">Some are meant to be experienced.</p>
              </div>

              <div className="pt-2">
                <p className="text-xs text-[#FDFBF7]/60 tracking-wider">
                  I made something for you.
                </p>
              </div>

              <div className="pt-4 w-full max-w-xs">
                <button
                  onClick={handleOpenInvitation}
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#631726] to-[#8C2337] hover:from-[#751B2E] hover:to-[#9E2840] border border-[#D4AF37]/40 text-[#FDFBF7] font-medium text-sm tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#631726]/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Open your invitation</span>
                  <ChevronRight className="w-4 h-4 text-[#D4AF37]" />
                </button>
              </div>
            </motion.div>
          )}

          {/* =============================================================== */}
          {/* SCREEN 02 — PERSONAL REVEAL                                     */}
          {/* =============================================================== */}
          {currentScreen === 2 && (
            <motion.div
              key="screen-2"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full bg-[#FAF7F0] text-[#161413] rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#D4AF37]/30 flex flex-col space-y-6"
            >
              <div className="flex items-center justify-between border-b border-[#161413]/10 pb-4">
                <span className="text-xs uppercase tracking-widest text-[#C0422B] font-semibold">
                  Personal Invitation
                </span>
                <span className="font-bengali text-sm text-[#D4AF37]">শারদোৎসব</span>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-[#161413]/60">For someone special,</span>
                <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-[#161413] tracking-tight">
                  {recipientName}
                </h2>
              </div>

              <div className="space-y-3 text-sm text-[#161413]/80 leading-relaxed font-editorial text-base sm:text-lg">
                <p>
                  Puja has always been about beautiful places, good food, endless adda, dhaker taal...
                </p>
                <p className="font-medium text-[#631726]">
                  ...and the people we choose to spend it with.
                </p>
              </div>

              {personalMessage && (
                <div className="p-4 rounded-xl bg-[#F2EBE0] border-l-4 border-[#C0422B] text-xs sm:text-sm italic text-[#161413]/90 leading-relaxed">
                  &ldquo;{personalMessage}&rdquo;
                </div>
              )}

              <div className="pt-2 text-center text-xs text-[#161413]/70 font-medium tracking-wide">
                So I wanted to ask you something.
              </div>

              <button
                onClick={() => setCurrentScreen(3)}
                className="w-full py-3.5 px-6 rounded-xl bg-[#161413] hover:bg-[#2A2623] text-[#FDFBF7] font-medium text-sm tracking-wider flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.98]"
              >
                <span>Tell me</span>
                <ChevronRight className="w-4 h-4 text-[#D4AF37]" />
              </button>
            </motion.div>
          )}

          {/* =============================================================== */}
          {/* SCREEN 03 — MAIN QUESTION                                       */}
          {/* =============================================================== */}
          {currentScreen === 3 && (
            <motion.div
              key="screen-3"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full flex flex-col items-center text-center space-y-8"
            >
              <div className="w-12 h-12 rounded-full bg-[#631726]/40 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] mb-2">
                <Flame className="w-6 h-6 text-[#C0422B]" />
              </div>

              <div className="space-y-4 max-w-sm">
                <h2 className="font-bengali text-3xl sm:text-4xl font-bold text-[#FDFBF7] leading-snug">
                  আমার সাথে পুজোয় যাবে?
                </h2>
                <p className="font-editorial text-lg sm:text-xl text-[#D4AF37] italic">
                  Will you come to Puja with me?
                </p>
              </div>

              <div className="w-full max-w-xs space-y-3 pt-4">
                {/* YES Option */}
                <button
                  onClick={() => {
                    submitFinalResponse("STARTED_PLANNING");
                    setCurrentScreen(4);
                  }}
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#631726] to-[#C0422B] hover:from-[#751B2E] hover:to-[#D44E35] border border-[#D4AF37]/50 text-[#FDFBF7] font-semibold text-sm tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-[#631726]/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Heart className="w-4 h-4 fill-white text-white" />
                  <span>হ্যাঁ, যাবো</span>
                </button>

                {/* RESPECTFUL Thinking Option (Non-manipulative UX) */}
                <button
                  onClick={() => {
                    submitFinalResponse("THINKING");
                    setCurrentScreen(3.5);
                  }}
                  className="w-full py-3.5 px-6 rounded-xl bg-[#24201D]/70 hover:bg-[#2A2623] border border-[#FDFBF7]/20 text-[#FDFBF7]/80 hover:text-[#FDFBF7] font-medium text-sm tracking-wider flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                >
                  <span>🌸 একটু ভাবি...</span>
                </button>
              </div>

              <p className="text-[11px] text-[#FDFBF7]/40 pt-2">
                Purely your choice. No rush, no pressure.
              </p>
            </motion.div>
          )}

          {/* =============================================================== */}
          {/* SCREEN 03.5 — RESPECTFUL THINKING SCREEN                         */}
          {/* =============================================================== */}
          {currentScreen === 3.5 && (
            <motion.div
              key="screen-3-5"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full bg-[#1F1C1A] text-[#FDFBF7] rounded-3xl p-6 sm:p-8 border border-[#D4AF37]/30 text-center space-y-6 shadow-2xl"
            >
              <div className="w-12 h-12 rounded-full bg-[#D4AF37]/15 mx-auto flex items-center justify-center text-[#D4AF37]">
                <Heart className="w-6 h-6 text-[#D4AF37]" />
              </div>

              <div className="space-y-2">
                <h3 className="font-editorial text-2xl font-bold text-[#FDFBF7]">
                  No pressure. ❤️
                </h3>
                <p className="text-sm text-[#FDFBF7]/75 font-editorial text-base sm:text-lg">
                  Take all the time you need. Puja is about warmth, smiles, and genuine happiness.
                </p>
              </div>

              <p className="text-xs text-[#D4AF37]/80 italic">
                Whenever you feel ready, the invitation will be waiting here for you.
              </p>

              <div className="pt-4 space-y-2">
                <button
                  onClick={() => {
                    submitFinalResponse("STARTED_PLANNING");
                    setCurrentScreen(4);
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#631726] to-[#8C2337] text-[#FDFBF7] font-medium text-xs tracking-wider flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>Ready now? Let&apos;s go ❤️</span>
                </button>

                <button
                  onClick={() => setCurrentScreen(1)}
                  className="w-full py-2.5 px-4 rounded-xl text-xs text-[#FDFBF7]/60 hover:text-[#FDFBF7] transition-colors"
                >
                  Back to opening
                </button>
              </div>
            </motion.div>
          )}

          {/* =============================================================== */}
          {/* SCREEN 04 — AFTER YES CELEBRATION                               */}
          {/* =============================================================== */}
          {currentScreen === 4 && (
            <motion.div
              key="screen-4"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full text-center space-y-6"
            >
              <div className="w-16 h-16 rounded-full bg-[#C0422B]/20 border border-[#D4AF37] mx-auto flex items-center justify-center text-[#D4AF37] shadow-lg shadow-[#C0422B]/30 animate-pulse">
                <Heart className="w-8 h-8 fill-[#C0422B] text-[#C0422B]" />
              </div>

              <div className="space-y-3">
                <h2 className="font-bengali text-3xl sm:text-4xl font-bold text-[#FDFBF7]">
                  তাহলে ঠিক রইলো! ❤️
                </h2>
                <p className="font-bengali text-base sm:text-lg text-[#D4AF37]">
                  এবার পুজোটা একটু বেশি special হতে চলেছে.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#24201D]/70 border border-[#D4AF37]/30 max-w-sm mx-auto">
                <p className="font-editorial text-lg text-[#FDFBF7]/90 italic">
                  Let&apos;s make a Puja plan together.
                </p>
              </div>

              <div className="pt-4 max-w-xs mx-auto">
                <button
                  onClick={() => setCurrentScreen(5)}
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#631726] to-[#8C2337] hover:from-[#751B2E] hover:to-[#9E2840] border border-[#D4AF37]/40 text-[#FDFBF7] font-medium text-sm tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-[1.02]"
                >
                  <span>Plan the day →</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* =============================================================== */}
          {/* SCREEN 05 — THE DAY                                             */}
          {/* =============================================================== */}
          {currentScreen === 5 && (
            <motion.div
              key="screen-5"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full space-y-5"
            >
              <div className="text-center space-y-1">
                <span className="text-[11px] uppercase tracking-widest text-[#D4AF37] font-medium">
                  Step 1 of 5 • The Day
                </span>
                <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#FDFBF7]">
                  Which day should we go?
                </h2>
                <p className="text-xs text-[#FDFBF7]/60">Select your preferred day</p>
              </div>

              <div className="grid grid-cols-1 gap-2.5 max-h-[50vh] overflow-y-auto pr-1">
                {DEFAULT_PUJA_DAYS.map((opt) => {
                  const isSelected = selectedDay === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedDay(opt.id)}
                      className={`text-left p-3.5 rounded-2xl border transition-all flex items-start gap-3.5 ${
                        isSelected
                          ? "bg-[#2E161C] border-[#D4AF37] shadow-md shadow-[#631726]/30 ring-1 ring-[#D4AF37]"
                          : "bg-[#211E1C]/80 border-[#FDFBF7]/10 hover:border-[#D4AF37]/40 text-[#FDFBF7]/80"
                      }`}
                    >
                      <span className="text-2xl mt-0.5">{opt.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-[#FDFBF7] font-bengali">{opt.title}</h4>
                          {opt.subtitle && (
                            <span className="text-xs text-[#D4AF37]/80">
                              {opt.subtitle}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#FDFBF7]/70 mt-0.5">{opt.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentScreen(6)}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#631726] to-[#8C2337] border border-[#D4AF37]/40 text-[#FDFBF7] font-medium text-sm tracking-wider flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
              >
                <span>Continue</span>
                <ChevronRight className="w-4 h-4 text-[#D4AF37]" />
              </button>
            </motion.div>
          )}

          {/* =============================================================== */}
          {/* SCREEN 06 — PUJA VIBE                                           */}
          {/* =============================================================== */}
          {currentScreen === 6 && (
            <motion.div
              key="screen-6"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full space-y-5"
            >
              <div className="text-center space-y-1">
                <span className="text-[11px] uppercase tracking-widest text-[#D4AF37] font-medium">
                  Step 2 of 5 • The Mood
                </span>
                <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#FDFBF7]">
                  What kind of Puja should we have?
                </h2>
                <p className="text-xs text-[#FDFBF7]/60">Select your favorite vibe</p>
              </div>

              <div className="grid grid-cols-1 gap-2.5 max-h-[50vh] overflow-y-auto pr-1">
                {DEFAULT_PUJA_VIBE_OPTIONS.map((opt) => {
                  const isSelected = selectedVibe === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedVibe(opt.id)}
                      className={`text-left p-3.5 rounded-2xl border transition-all flex items-start gap-3.5 ${
                        isSelected
                          ? "bg-[#2E161C] border-[#D4AF37] shadow-md shadow-[#631726]/30 ring-1 ring-[#D4AF37]"
                          : "bg-[#211E1C]/80 border-[#FDFBF7]/10 hover:border-[#D4AF37]/40 text-[#FDFBF7]/80"
                      }`}
                    >
                      <span className="text-2xl mt-0.5">{opt.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-[#FDFBF7]">{opt.title}</h4>
                          {opt.subtitle && (
                            <span className="font-bengali text-xs text-[#D4AF37]/80">
                              {opt.subtitle}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#FDFBF7]/70 mt-0.5">{opt.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setCurrentScreen(5)}
                  className="py-3.5 px-4 rounded-xl border border-[#FDFBF7]/20 text-xs text-[#FDFBF7]/70"
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentScreen(7)}
                  className="flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#631726] to-[#8C2337] border border-[#D4AF37]/40 text-[#FDFBF7] font-medium text-sm tracking-wider flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-4 h-4 text-[#D4AF37]" />
                </button>
              </div>
            </motion.div>
          )}

          {/* =============================================================== */}
          {/* SCREEN 07 — ADVENTURE STYLE                                     */}
          {/* =============================================================== */}
          {currentScreen === 7 && (
            <motion.div
              key="screen-7"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full space-y-5"
            >
              <div className="text-center space-y-1">
                <span className="text-[11px] uppercase tracking-widest text-[#D4AF37] font-medium">
                  Step 3 of 5 • The Journey
                </span>
                <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#FDFBF7]">
                  What&apos;s our kind of adventure?
                </h2>
                <p className="text-xs text-[#FDFBF7]/60">How should we get around?</p>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {DEFAULT_ADVENTURE_OPTIONS.map((opt) => {
                  const isSelected = selectedAdventure === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedAdventure(opt.id)}
                      className={`text-left p-3.5 rounded-2xl border transition-all flex items-start gap-3.5 ${
                        isSelected
                          ? "bg-[#2E161C] border-[#D4AF37] shadow-md ring-1 ring-[#D4AF37]"
                          : "bg-[#211E1C]/80 border-[#FDFBF7]/10 hover:border-[#D4AF37]/40 text-[#FDFBF7]/80"
                      }`}
                    >
                      <span className="text-2xl mt-0.5">{opt.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-[#FDFBF7]">{opt.title}</h4>
                          {opt.subtitle && (
                            <span className="font-bengali text-xs text-[#D4AF37]/80">
                              {opt.subtitle}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#FDFBF7]/70 mt-0.5">{opt.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setCurrentScreen(6)}
                  className="py-3.5 px-4 rounded-xl border border-[#FDFBF7]/20 text-xs text-[#FDFBF7]/70"
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentScreen(8)}
                  className="flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#631726] to-[#8C2337] border border-[#D4AF37]/40 text-[#FDFBF7] font-medium text-sm tracking-wider flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-4 h-4 text-[#D4AF37]" />
                </button>
              </div>
            </motion.div>
          )}

          {/* =============================================================== */}
          {/* SCREEN 08 — FOOD SELECTION                                      */}
          {/* =============================================================== */}
          {currentScreen === 8 && (
            <motion.div
              key="screen-8"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full space-y-5"
            >
              <div className="text-center space-y-1">
                <span className="text-[11px] uppercase tracking-widest text-[#D4AF37] font-medium">
                  Step 4 of 5 • The Feast
                </span>
                <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#FDFBF7]">
                  What are we eating? 👀
                </h2>
                <p className="text-xs text-[#FDFBF7]/60">Pick all your Puja favorites</p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 max-h-[50vh] overflow-y-auto pr-1">
                {foodChoices.map((food: any) => {
                  const isSelected = selectedFoods.includes(food.id);
                  return (
                    <button
                      key={food.id}
                      type="button"
                      onClick={() => toggleFoodSelection(food.id)}
                      className={`text-left p-3 rounded-2xl border transition-all flex flex-col justify-between ${
                        isSelected
                          ? "bg-[#2E161C] border-[#D4AF37] shadow-md ring-1 ring-[#D4AF37]"
                          : "bg-[#211E1C]/80 border-[#FDFBF7]/10 hover:border-[#D4AF37]/30 text-[#FDFBF7]/80"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[#D4AF37]/20 shrink-0 bg-[#24201D] shadow-sm">
                          {food.image ? (
                            <img src={food.image} alt={food.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-2xl flex items-center justify-center w-full h-full">{food.icon}</span>
                          )}
                        </div>
                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-[#D4AF37] text-[#161413] flex items-center justify-center text-[10px] font-bold shadow-md">
                            ✓
                          </span>
                        )}
                      </div>
                      <div className="mt-3">
                        <h4 className="text-xs sm:text-sm font-semibold text-[#FDFBF7]">
                          {food.name}
                        </h4>
                        <p className="text-[10px] text-[#FDFBF7]/60 line-clamp-1 mt-0.5">
                          {food.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setCurrentScreen(7)}
                  className="py-3.5 px-4 rounded-xl border border-[#FDFBF7]/20 text-xs text-[#FDFBF7]/70"
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentScreen(9)}
                  className="flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#631726] to-[#8C2337] border border-[#D4AF37]/40 text-[#FDFBF7] font-medium text-sm tracking-wider flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-4 h-4 text-[#D4AF37]" />
                </button>
              </div>
            </motion.div>
          )}

          {/* =============================================================== */}
          {/* SCREEN 09 — OPTIONAL LOCATION                                   */}
          {/* =============================================================== */}
          {currentScreen === 9 && (
            <motion.div
              key="screen-9"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full space-y-5"
            >
              <div className="text-center space-y-1">
                <span className="text-[11px] uppercase tracking-widest text-[#D4AF37] font-medium">
                  Step 5 of 5 • The Destination
                </span>
                <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#FDFBF7]">
                  And where are we going?
                </h2>
                <p className="text-xs text-[#FDFBF7]/60">Select your preferred spot</p>
              </div>

              {/* Recipient Preference Choices */}
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { id: "close", label: "📍 Somewhere close", sub: "Nearby & cozy" },
                  { id: "explore", label: "🗺️ Let's explore", sub: "Wander around" },
                  { id: "favourite", label: "❤️ Your favorite place", sub: "Wherever you love" },
                  { id: "surprise", label: "🎁 Keep it a surprise", sub: "Surprise me" },
                ].map((item) => {
                  const isSelected = selectedLocationPref === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedLocationPref(item.id)}
                      className={`text-left p-3 rounded-2xl border transition-all ${
                        isSelected
                          ? "bg-[#2E161C] border-[#D4AF37] shadow-md ring-1 ring-[#D4AF37]"
                          : "bg-[#211E1C]/80 border-[#FDFBF7]/10 hover:border-[#D4AF37]/30 text-[#FDFBF7]/80"
                      }`}
                    >
                      <h4 className="text-xs sm:text-sm font-semibold text-[#FDFBF7]">
                        {item.label}
                      </h4>
                      <p className="text-[10px] text-[#FDFBF7]/60 mt-0.5">{item.sub}</p>
                    </button>
                  );
                })}
              </div>

              {/* Recipient Input for Meeting Point */}
              <div className="p-4 rounded-2xl bg-[#FAF7F0] text-[#161413] shadow-md border border-[#D4AF37]/40 space-y-2.5 text-left">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#C0422B] block">
                  Where should we meet?
                </label>
                <input
                  type="text"
                  value={recipientVenue}
                  onChange={(e) => setRecipientVenue(e.target.value)}
                  placeholder="e.g. Maddox Square, College Square..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#161413]/10 text-xs text-[#161413] placeholder-[#161413]/40 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setCurrentScreen(8)}
                  className="py-3.5 px-4 rounded-xl border border-[#FDFBF7]/20 text-xs text-[#FDFBF7]/70"
                >
                  Back
                </button>
                <button
                  onClick={() => {
                    submitFinalResponse("ACCEPTED", true);
                    setCurrentScreen(10);
                  }}
                  className="flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#631726] to-[#8C2337] border border-[#D4AF37]/40 text-[#FDFBF7] font-medium text-sm tracking-wider flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                >
                  <span>See final invitation</span>
                  <ChevronRight className="w-4 h-4 text-[#D4AF37]" />
                </button>
              </div>
            </motion.div>
          )}

          {/* =============================================================== */}
          {/* SCREEN 10 — FINAL EMOTIONAL SCREEN                              */}
          {/* =============================================================== */}
          {currentScreen === 10 && (
            <motion.div
              key="screen-10"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full text-center space-y-6"
            >
              <AlpanaMotif className="w-40 text-[#D4AF37] mx-auto" />

              {(() => {
                const day = DEFAULT_PUJA_DAYS.find((d) => d.id === selectedDay)?.title || "Puja";
                const vibe = DEFAULT_PUJA_VIBE_OPTIONS.find((v) => v.id === selectedVibe)?.title || "a great vibe";
                const adventure = DEFAULT_ADVENTURE_OPTIONS.find((a) => a.id === selectedAdventure)?.title?.toLowerCase() || "wander around";
                const foods = foodChoices
                  .filter((f: any) => selectedFoods.includes(f.id))
                  .map((f: any) => f.name)
                  .join(", ") || "good food";
                
                const locMap: Record<string, string> = {
                  close: "somewhere close",
                  explore: "to explore the city",
                  favourite: "at your favorite place",
                  surprise: "at a surprise location",
                };
                const venueStr = recipientVenue 
                  ? (recipientVenue.toLowerCase().startsWith("at ") ? recipientVenue : `at ${recipientVenue}`)
                  : (locMap[selectedLocationPref] || "somewhere special");

                return (
                  <div className="space-y-3 font-editorial text-base sm:text-lg text-[#FDFBF7]/85 italic leading-relaxed max-w-sm mx-auto">
                    <p>So it&apos;s decided...</p>
                    <p>
                      We will meet on <strong className="text-[#D4AF37] font-semibold">{day}</strong> and <strong className="text-[#D4AF37] font-semibold">{adventure}</strong>.
                    </p>
                    <p>
                      Our vibe will be <strong className="text-[#D4AF37] font-semibold">{vibe}</strong>, eating <strong className="text-[#D4AF37] font-semibold">{foods}</strong>.
                    </p>
                    <p>
                      And we&apos;ll meet <strong className="text-[#D4AF37] font-semibold">{venueStr}</strong>.
                    </p>
                    <p className="text-[#D4AF37] font-medium pt-1">But most importantly...</p>
                  </div>
                );
              })()}

              <div className="space-y-3 pt-2">
                <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#FDFBF7]">
                  we&apos;ll remember this Puja. ❤️
                </h2>
                <p className="font-bengali text-xl text-[#D4AF37]">শুভ শারদীয়া</p>
              </div>

              {/* Creator × Recipient Tag */}
              <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-[#24201D] border border-[#D4AF37]/40 text-xs tracking-wider shadow-lg">
                <span className="font-semibold text-[#FDFBF7]">{creatorName}</span>
                <span className="text-[#C0422B] text-sm">×</span>
                <span className="font-semibold text-[#FDFBF7]">{recipientName}</span>
              </div>

              <p className="font-bengali text-sm text-[#FDFBF7]/70">
                See you at Puja. 🌺
              </p>

              {/* Optional Recipient Note */}
              <div className="pt-4 max-w-xs mx-auto space-y-2 text-left">
                <label className="text-[11px] text-[#FDFBF7]/60 block">
                  Send a personal note to {creatorName}:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={recipientNote}
                    onChange={(e) => setRecipientNote(e.target.value)}
                    placeholder="e.g. Can't wait! Counting the days..."
                    className="flex-1 px-3.5 py-2 rounded-xl bg-[#24201D] border border-[#FDFBF7]/15 text-xs text-[#FDFBF7] placeholder-[#FDFBF7]/40 focus:outline-none focus:border-[#D4AF37]"
                  />
                  <button
                    onClick={handleSendCustomNote}
                    className="px-3 py-2 rounded-xl bg-[#631726] border border-[#D4AF37]/40 text-[#FDFBF7] hover:bg-[#781C2E] text-xs flex items-center justify-center transition-all"
                    title="Send note"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
                {hasSubmitted && (
                  <p className="text-[11px] text-emerald-400 text-center pt-1">
                    ✓ Your plan is saved & shared with {creatorName}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Branding / Subtle Mark */}
      <footer className="relative z-30 p-4 text-center text-[10px] text-[#FDFBF7]/40 tracking-wider">
        <span>Curated with warmth • Bengal After Dusk</span>
      </footer>
    </div>
  );
}
