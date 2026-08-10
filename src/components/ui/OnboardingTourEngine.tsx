"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

interface OnboardingTourEngineProps {
  currentStep: number;
  onNextStep: () => void;
  onPrevStep: () => void;
  onSkipTour: () => void;
}

export default function OnboardingTourEngine({
  currentStep,
  onNextStep,
}: OnboardingTourEngineProps) {
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const selectors: Record<number, string> = {
    1: '[data-tour="preview-demo"]',
    2: '[data-tour="use-as-is"]',
    3: '[data-tour="event-card-root"]',
    4: '[data-tour="event-card-analytics"]',
  };

  const badgeTexts: Record<number, string> = {
    1: "Click '1. Preview Demo' 👇",
    2: "Click '2. Use As-Is' 👇",
    3: "Your Saved Proposal Link 💌",
    4: "View Answers & Log 👀",
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
        // Auto-scroll target smoothly to viewport center
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

    // Auto-advance on user clicking the spotlighted target element
    const handleTargetClick = (e: MouseEvent) => {
      const el = document.querySelector(targetSelector);
      if (el && el.contains(e.target as Node)) {
        onNextStep();
      }
    };

    window.addEventListener("click", handleTargetClick, true);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect);
      window.removeEventListener("click", handleTargetClick, true);
    };
  }, [currentStep, targetSelector, onNextStep]);

  if (!targetSelector || currentStep > 4) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
        {/* Cutout Spotlight Overlay: Dims EVERYTHING except the targeted element */}
        {targetRect && (
          <div
            className="fixed rounded-2xl pointer-events-none z-50 transition-all duration-300 border-4 border-rose-500 shadow-[0_0_0_9999px_rgba(15,23,42,0.85)] ring-4 ring-rose-500/50"
            style={{
              top: targetRect.top - 6,
              left: targetRect.left - 6,
              width: targetRect.width + 12,
              height: targetRect.height + 12,
            }}
          />
        )}

        {/* Animated Bouncing Hand Cursor 👇 Pointing Directly at Target */}
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
              left: Math.max(16, targetRect.left + targetRect.width / 2 - 110),
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
