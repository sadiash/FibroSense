"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { SunIcon, MoonIcon } from "@phosphor-icons/react";
import { FibroSenseLogo } from "./fibrosense-logo";

export function Header() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("theme");
    if (stored === "dark") {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  const today = format(new Date(), "EEEE, MMMM d");
  const greeting = getGreeting();
  const affirmation = getAffirmation();

  return (
    <header className="sticky top-0 z-40 glass-strong">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        {/* Mobile: Logo */}
        <div className="md:hidden flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[hsl(var(--gradient-start))] to-[hsl(var(--gradient-end))] flex items-center justify-center">
            <FibroSenseLogo className="h-5 w-5 text-white" />
          </div>
          <span className="text-base font-bold gradient-text">FibroSense</span>
        </div>

        {/* Desktop: Date & greeting */}
        <div className="hidden md:block">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-sm font-medium text-foreground">{greeting} — <span className="text-primary/80 font-normal italic">{affirmation}</span></p>
            <p className="text-xs text-muted-foreground">{today}</p>
          </motion.div>
        </div>

        {/* Theme toggle */}
        {mounted && (
          <motion.button
            onClick={toggleTheme}
            className="relative h-9 w-9 rounded-xl glass flex items-center justify-center hover:bg-accent transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Toggle theme"
          >
            <AnimatePresence mode="wait" initial={false}>
              {isDark ? (
                <motion.div
                  key="sun"
                  initial={{ rotate: -90, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  exit={{ rotate: 90, scale: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <SunIcon className="h-4 w-4 text-amber-400" weight="duotone" />
                </motion.div>
              ) : (
                <motion.div
                  key="moon"
                  initial={{ rotate: 90, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  exit={{ rotate: -90, scale: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <MoonIcon className="h-4 w-4 text-violet-500" weight="duotone" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        )}
      </div>
    </header>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

const affirmations = [
  "You're doing amazing — one day at a time.",
  "Your strength is greater than any flare.",
  "Every small step forward counts.",
  "Be gentle with yourself today.",
  "You are so much more than your pain.",
  "Progress isn't always linear — and that's okay.",
  "Tracking today helps tomorrow feel lighter.",
  "You deserve compassion, especially from yourself.",
  "Rest is not giving up — it's recharging.",
  "Your feelings are valid, always.",
];

function getAffirmation(): string {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  return affirmations[seed % affirmations.length];
}
