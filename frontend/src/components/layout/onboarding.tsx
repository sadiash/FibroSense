"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ClipboardText, Sparkle, Heartbeat, Database } from "@phosphor-icons/react";
import { FibroSenseLogo } from "@/components/layout/fibrosense-logo";

const STORAGE_KEY = "fibrosense-onboarding-complete";

const slides = [
  {
    icon: (
      <FibroSenseLogo className="w-20 h-20 text-primary" />
    ),
    title: "Welcome to FibroSense",
    description:
      "Your personal companion for understanding fibromyalgia patterns. Track symptoms, discover triggers, and take control of your well-being.",
  },
  {
    icon: <ClipboardText size={64} weight="duotone" className="text-primary" />,
    title: "Track Your Symptoms",
    description:
      "Log pain locations on an interactive body map, record fatigue levels, and capture contextual factors like weather, stress, and sleep quality.",
  },
  {
    icon: <Sparkle size={64} weight="duotone" className="text-primary" />,
    title: "Discover Patterns",
    description:
      "Uncover correlations between your symptoms and daily factors. Identify triggers, view weekly rhythms, and gain actionable insights.",
  },
  {
    icon: <Heartbeat size={64} weight="duotone" className="text-primary" />,
    title: "Monitor Biometrics",
    description:
      "Connect your Oura ring to track sleep, HRV, and activity. See everything on a unified timeline alongside your symptom data.",
  },
  {
    icon: <Database size={64} weight="duotone" className="text-primary" />,
    title: "You're All Set!",
    description:
      "The app is loaded with demo data so you can explore every feature right away. When you're ready to start tracking for real, head to Settings and clear the demo data.",
  },
];

export function Onboarding() {
  const [mounted, setMounted] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const completed = localStorage.getItem(STORAGE_KEY);
    if (completed !== "true") {
      setShowOnboarding(true);
    }
    setMounted(true);
  }, []);

  if (!mounted || !showOnboarding) return null;

  const handleComplete = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setShowOnboarding(false);
  };

  const handleNext = () => {
    if (currentStep < slides.length - 1) {
      setDirection(1);
      setCurrentStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep((s) => s - 1);
    }
  };

  const slide = slides[currentStep];
  const isLast = currentStep === slides.length - 1;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-strong rounded-2xl shadow-2xl border border-border/50 w-full max-w-md mx-4 overflow-hidden"
      >
        {/* Skip button */}
        <div className="flex justify-end p-4 pb-0">
          <button
            onClick={handleComplete}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip
          </button>
        </div>

        {/* Slide content */}
        <div className="px-8 pb-2 pt-4 min-h-[280px] flex items-center">
          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={{
                enter: (d: number) => ({ opacity: 0, x: d * 80 }),
                center: { opacity: 1, x: 0 },
                exit: (d: number) => ({ opacity: 0, x: d * -80 }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="flex flex-col items-center text-center w-full"
            >
              <div className="mb-6">{slide.icon}</div>
              <h2 className="text-xl font-bold mb-3">{slide.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {slide.description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Step dots */}
        <div className="flex items-center justify-center gap-2 py-4">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === currentStep
                  ? "w-6 bg-primary"
                  : "w-2 bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between px-8 pb-8">
          <button
            onClick={handleBack}
            className={`text-sm font-medium text-muted-foreground hover:text-foreground transition-colors ${
              currentStep === 0 ? "invisible" : ""
            }`}
          >
            Back
          </button>

          <button
            onClick={isLast ? handleComplete : handleNext}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-primary-foreground bg-gradient-to-r from-[hsl(var(--gradient-start))] to-[hsl(var(--gradient-end))] hover:opacity-90 transition-opacity"
          >
            {isLast ? "Get Started" : "Next"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
