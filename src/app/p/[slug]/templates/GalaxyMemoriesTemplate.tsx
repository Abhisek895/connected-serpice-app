"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { recordResponseAction } from "../actions";
import { Heart, Sparkles, X, Volume2, VolumeX, MailOpen, RotateCcw } from "lucide-react";
import OurStoryWatermark from "./OurStoryWatermark";
import Script from "next/script";

export type ProposalClientProps = {
  slug: string;
  themeName?: string;
  title?: string;
  question?: string;
  acceptBtn?: string;
  rejectBtn?: string;
  loveMessage?: string;
  photoUrl?: string;
  audioUrl?: string;
  _photo?: string;
  _audio?: string;
  demoId?: string;
  recipientName?: string;
  dodgeMessages?: string;
  patternText?: string;
  media?: any[];
};

export default function GalaxyMemoriesTemplate({
  slug,
  title,
  loveMessage,
  recipientName,
  photoUrl: propPhotoUrl,
  audioUrl: propAudioUrl,
  _photo,
  _audio,
  media = [],
}: ProposalClientProps) {
  const [mounted, setMounted] = useState(false);
  const [threeLoaded, setThreeLoaded] = useState(false);
  const [blastState, setBlastState] = useState<"IDLE" | "EXPLODED">("IDLE");
  const [showLetterModal, setShowLetterModal] = useState(false);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);

  const [typedText, setTypedText] = useState("");
  const [isTypingDone, setIsTypingDone] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasViewedRef = useRef(false);

  const partnerName = recipientName || "My Love 💜";
  const headerTitle = title || `For ${partnerName} 💖`;
  const fullLoveMessage =
    loveMessage ||
    `Every single star in this 3D universe represents a moment I spent loving you.\n\nYou brought magic, warmth, and light into my life. I love you to infinity and beyond! ✨💜`;

  const uploadedImages = media?.filter((m: any) => m.type === "IMAGE")?.map((m: any) => m.url) || [];
  const uploadedAudio = media?.find((m: any) => m.type === "AUDIO")?.url;

  const audioTrack = propAudioUrl || _audio || uploadedAudio || "/demos/surprise/loveSong.mp3";

  useEffect(() => {
    setMounted(true);

    if (!hasViewedRef.current) {
      recordResponseAction(slug, "VIEWED");
      hasViewedRef.current = true;
    }

    audioRef.current = new Audio(audioTrack);
    if (audioRef.current) {
      audioRef.current.loop = true;
      audioRef.current.volume = 0.5;
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [slug, audioTrack]);

  useEffect(() => {
    if (!threeLoaded || !canvasRef.current) return;
    const THREE = (window as any).THREE;
    if (!THREE) return;

    const canvas = canvasRef.current;
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x02000b, 0.0015);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(0, 30, 110);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const starCount = 2500;
    const starsGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    const colors = [new THREE.Color(0xff7597), new THREE.Color(0xa855f7), new THREE.Color(0x38bdf8)];

    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 600;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 600;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 600;

      const c = colors[i % colors.length];
      starColors[i * 3] = c.r;
      starColors[i * 3 + 1] = c.g;
      starColors[i * 3 + 2] = c.b;
    }

    starsGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    starsGeo.setAttribute("color", new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({ size: 1.5, vertexColors: true, transparent: true, opacity: 0.8 });
    const starPoints = new THREE.Points(starsGeo, starMat);
    scene.add(starPoints);

    const heartCount = 2200;
    const heartGeo = new THREE.BufferGeometry();
    const heartPositions = new Float32Array(heartCount * 3);

    for (let i = 0; i < heartCount; i++) {
      const t = Math.random() * Math.PI * 2;
      const u = (Math.random() - 0.5) * Math.PI;

      const x = 16 * Math.pow(Math.sin(t), 3);
      const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
      const z = u * 12;

      heartPositions[i * 3] = x * 1.2;
      heartPositions[i * 3 + 1] = y * 1.2;
      heartPositions[i * 3 + 2] = z * 1.2;
    }

    heartGeo.setAttribute("position", new THREE.BufferAttribute(heartPositions, 3));
    const heartMat = new THREE.PointsMaterial({
      size: 2.2,
      color: 0xff4d6d,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
    });
    const heartOrb = new THREE.Points(heartGeo, heartMat);
    scene.add(heartOrb);

    const galaxyCount = 5000;
    const galaxyGeo = new THREE.BufferGeometry();
    const galaxyPos = new Float32Array(galaxyCount * 3);
    const galaxyCols = new Float32Array(galaxyCount * 3);

    for (let i = 0; i < galaxyCount; i++) {
      const r = Math.random() * 90 + 15;
      const spin = r * 0.15;
      const branch = ((i % 3) * (2 * Math.PI)) / 3;

      galaxyPos[i * 3] = Math.cos(branch + spin) * r + (Math.random() - 0.5) * 8;
      galaxyPos[i * 3 + 1] = (Math.random() - 0.5) * 6;
      galaxyPos[i * 3 + 2] = Math.sin(branch + spin) * r + (Math.random() - 0.5) * 8;

      const c = new THREE.Color(0xff4d6d).lerp(new THREE.Color(0x9333ea), r / 100);
      galaxyCols[i * 3] = c.r;
      galaxyCols[i * 3 + 1] = c.g;
      galaxyCols[i * 3 + 2] = c.b;
    }

    galaxyGeo.setAttribute("position", new THREE.BufferAttribute(galaxyPos, 3));
    galaxyGeo.setAttribute("color", new THREE.BufferAttribute(galaxyCols, 3));

    const galaxyMat = new THREE.PointsMaterial({
      size: 1.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const galaxyDisk = new THREE.Points(galaxyGeo, galaxyMat);
    scene.add(galaxyDisk);

    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };

    const handleStart = (x: number, y: number) => {
      isDragging = true;
      prevMouse = { x, y };
    };

    const handleMove = (x: number, y: number) => {
      if (!isDragging) return;
      const dx = x - prevMouse.x;
      const dy = y - prevMouse.y;

      scene.rotation.y += dx * 0.008;
      scene.rotation.x += dy * 0.005;

      prevMouse = { x, y };
    };

    const onMouseDown = (e: MouseEvent) => handleStart(e.clientX, e.clientY);
    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const onMouseUp = () => { isDragging = false; };

    const onTouchStart = (e: TouchEvent) => handleStart(e.touches[0].clientX, e.touches[0].clientY);
    const onTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX, e.touches[0].clientY);
    const onTouchEnd = () => { isDragging = false; };

    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("touchstart", onTouchStart);
    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("touchend", onTouchEnd);

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      heartOrb.rotation.y += 0.008;
      galaxyDisk.rotation.y += 0.003;
      starPoints.rotation.y += 0.0005;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [threeLoaded]);

  useEffect(() => {
    if (!showLetterModal) return;

    setTypedText("");
    setIsTypingDone(false);
    let i = 0;

    const interval = setInterval(() => {
      if (i < fullLoveMessage.length) {
        setTypedText(fullLoveMessage.slice(0, i + 1));
        i++;
      } else {
        setIsTypingDone(true);
        clearInterval(interval);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [showLetterModal, fullLoveMessage]);

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlayingMusic) {
      audioRef.current.pause();
      setIsPlayingMusic(false);
    } else {
      audioRef.current.play().then(() => setIsPlayingMusic(true)).catch(() => {});
    }
  };

  const handleTriggerBlast = () => {
    setBlastState("EXPLODED");
    if (audioRef.current && !isPlayingMusic) {
      audioRef.current.play().then(() => setIsPlayingMusic(true)).catch(() => {});
    }
  };

  const handleCloseAndAdvance = () => {
    setShowLetterModal(false);
    if (blastState === "IDLE") {
      handleTriggerBlast();
    }
  };

  const handleSendLoveBack = () => {
    handleCloseAndAdvance();
    recordResponseAction(slug, "ACCEPTED");

    if (typeof window !== "undefined" && (window as any).confetti) {
      (window as any).confetti({
        particleCount: 160,
        spread: 100,
        origin: { y: 0.6 },
        colors: ["#ff7597", "#a855f7", "#38bdf8", "#fbbf24"],
      });
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen w-full bg-[#02000b] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-pink-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#02000b] text-[#f3e8ff] flex flex-col items-center justify-between p-4 relative font-sans overflow-hidden selection:bg-pink-500 selection:text-white">
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"
        onLoad={() => setThreeLoaded(true)}
      />

      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-1" />

      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-10 text-center pointer-events-none w-11/12 max-w-lg">
        <h1 className="font-serif font-bold text-3xl sm:text-4xl text-[#ff7597] drop-shadow-[0_0_20px_rgba(255,117,151,0.8)] tracking-wide">
          {headerTitle}
        </h1>
        <p className="text-xs font-black uppercase tracking-widest text-purple-200/90 mt-1">
          Our 3D Galaxy of Memories 🌌
        </p>
      </div>

      <div className="fixed top-24 left-1/2 -translate-x-1/2 z-10 bg-purple-950/60 border border-white/15 px-4 py-1.5 rounded-full text-[11px] font-bold text-purple-300 tracking-wider uppercase pointer-events-none backdrop-blur-md">
        ✨ Drag / Swipe to rotate 3D Galaxy ✨
      </div>

      <div className="fixed bottom-9 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-3 w-11/12 max-w-sm">
        {blastState === "IDLE" ? (
          <button
            onClick={handleTriggerBlast}
            className="w-full py-4 px-8 bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:scale-105 active:scale-95 text-white font-black text-xs uppercase tracking-widest rounded-full shadow-[0_0_40px_rgba(236,72,153,0.8)] border border-white/30 transition flex items-center justify-center gap-2 cursor-pointer animate-pulse"
          >
            <Sparkles className="w-4 h-4 fill-white" />
            <span>Tap to Trigger Big Bang 🌌</span>
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowLetterModal(true)}
              className="px-6 py-3 bg-purple-950/80 hover:bg-purple-900 border border-pink-500/40 rounded-full text-xs font-black uppercase tracking-wider text-pink-200 backdrop-blur-md shadow-lg transition flex items-center gap-2 cursor-pointer"
            >
              <MailOpen className="w-4 h-4 text-pink-400" />
              <span>Love Letter</span>
            </button>
            <button
              onClick={toggleMusic}
              className="px-6 py-3 bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 rounded-full text-xs font-black uppercase tracking-wider text-purple-200 backdrop-blur-md shadow-lg transition flex items-center gap-2 cursor-pointer"
            >
              {isPlayingMusic ? <Volume2 className="w-4 h-4 text-purple-300 animate-pulse" /> : <VolumeX className="w-4 h-4 text-purple-400" />}
              <span>{isPlayingMusic ? "Playing" : "Music"}</span>
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showLetterModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/88 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              className="bg-gradient-to-br from-purple-950 via-slate-950 to-pink-950 border border-pink-500/50 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-white relative overflow-hidden"
            >
              <div className="flex justify-between items-center mb-4">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-pink-400">Cosmic Love Letter 🌟</span>
                  <h3 className="text-lg font-serif font-bold text-purple-100">Written In The Stars 💌</h3>
                </div>
                <button
                  onClick={() => setShowLetterModal(false)}
                  className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-purple-300 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-black/50 p-5 rounded-2xl border border-pink-500/30 mb-6 max-h-64 overflow-y-auto font-serif text-sm text-purple-100 leading-relaxed whitespace-pre-wrap shadow-inner">
                {typedText}
                {!isTypingDone && <span className="animate-pulse">|</span>}
              </div>

              <div className="flex justify-between items-center gap-3">
                <button
                  onClick={handleCloseAndAdvance}
                  className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-purple-200 font-bold text-xs rounded-full border border-purple-500/30 transition cursor-pointer"
                >
                  Close Letter & Next ✨
                </button>
                <button
                  onClick={handleSendLoveBack}
                  className="px-6 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:scale-105 active:scale-95 text-white font-extrabold text-xs uppercase tracking-widest rounded-full shadow-[0_0_30px_rgba(236,72,153,0.7)] transition border border-white/30 flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 fill-white" />
                  <span>Send Love Back 💫</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <OurStoryWatermark variant="dark" templateId="galaxy-memories" />
    </div>
  );
}
