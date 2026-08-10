"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

interface AnalyticsTourEngineProps {
  onCompleteTour: () => void;
}

export default function AnalyticsTourEngine({ onCompleteTour }: AnalyticsTourEngineProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const selectors: Record<number, string> = {
    1: '[data-tour="analytics-metrics"]',
    2: '[data-tour="analytics-log-list"]',
  };

  const badgeTexts: Record<number, string> = {
    1: "1. Real-time Views & YES! Counter 👇",
    2: "2. Live Session & Reaction Log 👇",
  };

  const targetSelector = selectors[currentStep];

  useEffect(() => {
    if (!targetSelector) {
      setTargetRect(null);
      return;
    }

    const updateRect = () => {
      const el = document.querySelector(targetSelector);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        setTargetRect(el.getBoundingClientRect());
      } else {
        setTargetRect(null);
      }
    };

    updateRect();
    const timer = setTimeout(updateRect, 300);

    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect);

    const handleTargetClick = (e: MouseEvent) => {
      const el = document.querySelector(targetSelector);
      if (el && el.contains(e.target as Node)) {
        if (currentStep < 2) {
          setCurrentStep((prev) => prev + 1);
        } else {
          onCompleteTour();
        }
      }
    };

    window.addEventListener("click", handleTargetClick, true);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect);
      window.removeEventListener("click", handleTargetClick, true);
    };
  }, [currentStep, targetSelector, onCompleteTour]);

  if (!targetSelector || currentStep > 2) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
        {/* Spotlight Cutout Overlay */}
        {targetRect && (
          <div
            className="fixed rounded-3xl pointer-events-none z-50 transition-all duration-300 border-4 border-rose-500 shadow-[0_0_0_9999px_rgba(15,23,42,0.85)] ring-4 ring-rose-500/50"
            style={{
              top: targetRect.top - 6,
              left: targetRect.left - 6,
              width: targetRect.width + 12,
              height: targetRect.height + 12,
            }}
          />
        )}

        {/* Bouncing Hand Cursor 👇 */}
        {targetRect && (
          <motion.div
            animate={{ y: [0, -14, 0] }}
            transition={{ repeat: Infinity, duration: 0.75, ease: "easeInOut" }}
            className="fixed z-[60] pointer-events-none text-5xl sm:text-6xl flex items-center justify-center filter drop-shadow-[0_8px_20px_rgba(244,63,94,1)]"
            style={{
              top: Math.max(10, targetRect.top - 58),
              left: targetRect.left + targetRect.width / 2 - 24,
            }}
          >
            👇
          </motion.div>
        )}

        {/* Floating Label Badge */}
        {targetRect && badgeTexts[currentStep] && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed z-[60] pointer-events-none bg-rose-600 text-white text-xs font-black uppercase px-4 py-2 rounded-full shadow-2xl tracking-wider flex items-center gap-2 border border-rose-300 ring-4 ring-rose-500/30"
            style={{
              top: targetRect.top + targetRect.height + 12,
              left: Math.max(16, targetRect.left + targetRect.width / 2 - 120),
            }}
          >
            <Sparkles className="w-4 h-4 fill-white" />
            {badgeTexts[currentStep]}
          </motion.div>
        )}
      </div>
    </AnimatePresence>
  );
}
