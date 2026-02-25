"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface SummaryCardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: "up" | "down" | "stable";
  icon?: React.ReactNode;
  color?: "violet" | "teal" | "rose" | "amber";
}

const colorMap = {
  violet: {
    gradient: "from-violet-500 to-purple-600",
    glow: "shadow-violet-500/20",
    bg: "bg-violet-500/10",
    text: "text-violet-600 dark:text-violet-400",
    icon: "text-violet-500",
  },
  teal: {
    gradient: "from-teal-500 to-emerald-600",
    glow: "shadow-teal-500/20",
    bg: "bg-teal-500/10",
    text: "text-teal-600 dark:text-teal-400",
    icon: "text-teal-500",
  },
  rose: {
    gradient: "from-rose-500 to-pink-600",
    glow: "shadow-rose-500/20",
    bg: "bg-rose-500/10",
    text: "text-rose-600 dark:text-rose-400",
    icon: "text-rose-500",
  },
  amber: {
    gradient: "from-amber-500 to-orange-600",
    glow: "shadow-amber-500/20",
    bg: "bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    icon: "text-amber-500",
  },
};

function AnimatedCounter({ value }: { value: string | number }) {
  const [display, setDisplay] = useState("0");
  const prevRef = useRef(0);

  useEffect(() => {
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(numValue) || value === "\u2014") {
      setDisplay(String(value));
      return;
    }

    const start = prevRef.current;
    const end = numValue;
    const duration = 800;
    const startTime = performance.now();
    const isFloat = String(value).includes(".");

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * eased;

      if (isFloat) {
        setDisplay(current.toFixed(1));
      } else {
        setDisplay(Math.round(current).toString());
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }

    requestAnimationFrame(animate);
    prevRef.current = end;
  }, [value]);

  return <>{display}</>;
}

export function SummaryCard({
  title,
  value,
  unit,
  trend,
  icon,
  color = "violet",
}: SummaryCardProps) {
  const c = colorMap[color];
  const trendIcon =
    trend === "up" ? (
      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 17l5-5 5 5M7 7l5 5 5-5" />
      </svg>
    ) : trend === "down" ? (
      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 7l5 5 5-5M7 17l5-5 5 5" />
      </svg>
    ) : (
      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14" />
      </svg>
    );

  const trendColor =
    trend === "up"
      ? "text-rose-500 bg-rose-500/10"
      : trend === "down"
        ? "text-emerald-500 bg-emerald-500/10"
        : "text-muted-foreground bg-muted";

  return (
    <motion.div
      className="relative rounded-2xl bg-card border border-border/50 p-4 overflow-hidden card-hover group"
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {/* Gradient accent line at top */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${c.gradient} opacity-60`} />

      {/* Subtle background glow */}
      <div className={`absolute -top-12 -right-12 w-24 h-24 rounded-full ${c.bg} blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {title}
          </p>
          {icon && (
            <div className={`h-8 w-8 rounded-lg ${c.bg} flex items-center justify-center ${c.icon}`}>
              {icon}
            </div>
          )}
        </div>

        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold tracking-tight">
            <AnimatedCounter value={value} />
          </span>
          {unit && (
            <span className="text-sm text-muted-foreground mb-1">{unit}</span>
          )}
        </div>

        {trend && (
          <div className="mt-2 flex items-center gap-1">
            <span className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${trendColor}`}>
              {trendIcon}
              {trend === "up" ? "Rising" : trend === "down" ? "Falling" : "Stable"}
            </span>
            <span className="text-[10px] text-muted-foreground">vs last week</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
