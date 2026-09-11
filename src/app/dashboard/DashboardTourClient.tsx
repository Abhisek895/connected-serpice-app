"use client";

import { useState, useEffect } from "react";
import OnboardingProgressBar from "@/components/ui/OnboardingProgressBar";
import OnboardingTourEngine from "@/components/ui/OnboardingTourEngine";

export default function DashboardTourClient({ children }: { children: React.ReactNode }) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isTourActive, setIsTourActive] = useState<boolean>(false);
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
