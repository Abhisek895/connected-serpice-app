"use client";

import { useState, useEffect } from "react";
import OnboardingProgressBar from "@/components/ui/OnboardingProgressBar";
import OnboardingTourEngine from "@/components/ui/OnboardingTourEngine";
import { Sparkles, HelpCircle } from "lucide-react";

export default function DashboardTourClient({ children }: { children: React.ReactNode }) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isTourActive, setIsTourActive] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    const hasSeenTour = localStorage.getItem("ourstory_onboarding_completed");
    if (!hasSeenTour) {
      // Record completed flag IMMEDIATELY so it will NEVER auto-launch again in the user's lifetime!
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
      {/* Quick Launch Guidance Banner if tour is inactive */}
      {!isTourActive && (
        <div className="flex justify-end mb-4">
          <button
            onClick={handleStartTour}
            className="px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white rounded-2xl text-xs font-extrabold shadow-md shadow-rose-200 transition flex items-center gap-2 group"
          >
            <Sparkles className="w-4 h-4 text-white group-hover:rotate-12 transition-transform" />
            <span>🎓 Launch New User Guidance Tour</span>
          </button>
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
