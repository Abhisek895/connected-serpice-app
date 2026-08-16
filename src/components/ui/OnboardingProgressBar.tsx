"use client";

import { Sparkles, CheckCircle2, RotateCcw, X } from "lucide-react";

interface OnboardingProgressBarProps {
  currentStep: number; // 1, 2, 3, 4
  totalSteps: number; // 4
  onReplayTour: () => void;
  onCloseTour?: () => void;
}

export default function OnboardingProgressBar({
  currentStep,
  totalSteps,
  onReplayTour,
  onCloseTour,
}: OnboardingProgressBarProps) {
  const percentage = Math.min(100, Math.round(((currentStep - 1) / totalSteps) * 100));
  const isComplete = currentStep > totalSteps;

  const stepLabels = [
    "1. Preview Demo 👁️",
    "2. Create Instant Link ⚡",
    "3. Saved Link Tour 💌",
    "4. View Live Log 👀",
  ];

  return (
    <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 border border-rose-500/30 rounded-2xl p-4 sm:p-5 shadow-xl text-white mb-6 relative overflow-hidden">
      {/* Glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-rose-500/20 rounded-xl text-rose-400 border border-rose-500/30">
            <Sparkles className="w-4 h-4 fill-rose-400" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>First-Time Member Onboarding Checklist</span>
              {isComplete && (
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border border-emerald-500/30">
                  100% Completed 🎉
                </span>
              )}
            </h3>
            <p className="text-xs text-rose-200/80">
              {isComplete
                ? "You've mastered proposal creation & sharing! Click anytime to replay the tour."
                : `Step ${currentStep} of ${totalSteps}: Follow the glowing highlights below!`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={onReplayTour}
            className="text-xs px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-rose-200 font-semibold transition flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Replay
          </button>
          {onCloseTour && (
            <button
              onClick={onCloseTour}
              className="text-xs px-3 py-1.5 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white font-bold transition flex items-center gap-1 cursor-pointer shadow-sm"
              title="Close guidance tour"
            >
              <X className="w-3.5 h-3.5" /> Close
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar Track */}
      <div className="w-full bg-slate-800/80 h-2.5 rounded-full overflow-hidden mb-3 border border-slate-700/50 p-0.5">
        <div
          className="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 h-full rounded-full transition-all duration-500 shadow-sm"
          style={{ width: `${isComplete ? 100 : percentage}%` }}
        />
      </div>

      {/* Step Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-medium">
        {stepLabels.map((label, idx) => {
          const stepNum = idx + 1;
          const isDone = currentStep > stepNum;
          const isCurrent = currentStep === stepNum && !isComplete;

          return (
            <div
              key={idx}
              className={`p-2 rounded-xl border flex items-center justify-between transition ${isDone
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 font-semibold"
                  : isCurrent
                    ? "bg-rose-500/20 border-rose-500/50 text-white font-bold ring-2 ring-rose-500/30 animate-pulse"
                    : "bg-slate-800/40 border-slate-800 text-slate-400"
                }`}
            >
              <span className="truncate">{label}</span>
              {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-1" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
