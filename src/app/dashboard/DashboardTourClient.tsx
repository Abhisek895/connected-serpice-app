"use client";

import { useState, useEffect } from "react";
import OnboardingProgressBar from "@/components/ui/OnboardingProgressBar";
import OnboardingTourEngine from "@/components/ui/OnboardingTourEngine";
import { Compass, ArrowRight, X } from "lucide-react";

export default function DashboardTourClient({ children }: { children: React.ReactNode }) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isTourActive, setIsTourActive] = useState<boolean>(false);
  const [bannerDismissed, setBannerDismissed] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    const hasSeenTour = localStorage.getItem("ourstory_onboarding_completed");
    if (!hasSeenTour) {
      localStorage.setItem("ourstory_onboarding_completed", "true");
      setIsTourActive(true);
      setCurrentStep(1);
    }
  }, []);

  const handleNextStep = () => {
    if (currentStep >= 6) {
      localStorage.setItem("ourstory_onboarding_completed", "true");
      setIsTourActive(false);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSkipTour = () => {
    localStorage.setItem("ourstory_onboarding_completed", "true");
    setIsTourActive(false);
  };

  const handleStartTour = () => {
    localStorage.setItem("ourstory_onboarding_completed", "true");
    setIsTourActive(true);
    setCurrentStep(1);
  };

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Quick Launch Guidance Banner if tour is inactive — Full width responsive card */}
      {!isTourActive && !bannerDismissed && (
        <div
          onClick={handleStartTour}
          className="flex items-center justify-between gap-3 sm:gap-4 w-full px-4 sm:px-5 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-rose-500/10 via-pink-500/10 to-purple-500/10 border border-rose-400/20 hover:border-rose-400/40 hover:from-rose-500/15 hover:via-pink-500/15 hover:to-purple-500/15 transition-all group cursor-pointer mb-6"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-md shadow-rose-400/30 shrink-0 group-hover:scale-105 transition-transform">
              <Compass className="w-5 h-5 text-white group-hover:rotate-45 transition-transform" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">
                🎓 Launch New User Guidance Tour
              </p>
              <p className="text-xs text-slate-500 truncate sm:whitespace-normal">
                1-minute interactive tour to master creating, customizing & sharing proposals
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-500 group-hover:text-rose-600">
              <span className="hidden sm:inline">Start Tour</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setBannerDismissed(true);
              }}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-rose-100/60 rounded-xl transition cursor-pointer"
              title="Dismiss tour banner"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Onboarding Checklist & Spotlight Tour */}
      {isTourActive && (
        <>
          <OnboardingProgressBar
            currentStep={currentStep}
            totalSteps={6}
            onReplayTour={handleStartTour}
            onCloseTour={handleSkipTour}
          />

          <OnboardingTourEngine
            currentStep={currentStep}
            onNextStep={handleNextStep}
            onPrevStep={handlePrevStep}
            onSkipTour={handleSkipTour}
          />
        </>
      )}

      {children}
    </>
  );
}
