"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { SymptomLog, BiometricReading, ContextualData } from "@/lib/types";
import { format, parseISO } from "date-fns";
import { ArrowsDownUpIcon } from "@phosphor-icons/react";

interface BestWorstDaysProps {
  logs: SymptomLog[];
  biometrics: BiometricReading[];
  contextual: ContextualData[];
}

interface DaySnapshot {
  date: string;
  pain: number;
  fatigue: number;
  mood: number;
  sleep?: number;
  hrv?: number;
  pressure?: number;
}

function MetricPill({
  label,
  value,
  unit,
  good,
}: {
  label: string;
  value: string;
  unit: string;
  good?: boolean;
}) {
  return (
    <div
      className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] ${
        good === undefined
          ? "bg-muted/50 text-muted-foreground"
          : good
            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
      }`}
    >
      <span className="font-medium">{label}</span>
      <span className="font-bold tabular-nums">
        {value}
        {unit}
      </span>
    </div>
  );
}

function DayRow({
  day,
  rank,
  type,
}: {
  day: DaySnapshot;
  rank: number;
  type: "best" | "worst";
}) {
  const isBest = type === "best";
  return (
    <motion.div
      className="flex items-center gap-2 py-1.5"
      initial={{ opacity: 0, x: isBest ? -8 : 8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.05 }}
    >
      <span
        className={`text-[10px] font-bold w-4 text-center rounded ${
          isBest
            ? "text-emerald-500"
            : "text-rose-500"
        }`}
      >
        {rank + 1}
      </span>
      <span className="text-[10px] text-muted-foreground w-16 shrink-0">
        {format(parseISO(day.date), "MMM d")}
      </span>
      <div className="flex flex-wrap gap-1 flex-1">
        <MetricPill
          label="Pain"
          value={day.pain.toString()}
          unit=""
          good={day.pain <= 3}
        />
        <MetricPill
          label="Fatigue"
          value={day.fatigue.toString()}
          unit=""
          good={day.fatigue <= 3}
        />
        {day.sleep !== undefined && (
          <MetricPill
            label="Sleep"
            value={day.sleep.toFixed(1)}
            unit="h"
            good={day.sleep >= 7}
          />
        )}
        {day.hrv !== undefined && (
          <MetricPill
            label="HRV"
            value={Math.round(day.hrv).toString()}
            unit=""
            good={day.hrv >= 40}
          />
        )}
      </div>
    </motion.div>
  );
}

export function BestWorstDays({
  logs,
  biometrics,
  contextual,
}: BestWorstDaysProps) {
  const { best, worst } = useMemo(() => {
    if (logs.length < 4) return { best: [], worst: [] };

    const bioMap = new Map<string, BiometricReading>();
    biometrics.forEach((b) => bioMap.set(b.date, b));
    const ctxMap = new Map<string, ContextualData>();
    contextual.forEach((c) => ctxMap.set(c.date, c));

    const snapshots: DaySnapshot[] = logs.map((l) => {
      const bio = bioMap.get(l.date);
      const ctx = ctxMap.get(l.date);
      return {
        date: l.date,
        pain: l.pain_severity,
        fatigue: l.fatigue_severity,
        mood: l.mood,
        sleep: bio?.sleep_duration,
        hrv: bio?.hrv_rmssd,
        pressure: ctx?.barometric_pressure ?? undefined,
      };
    });

    // Score: lower pain + lower fatigue + higher mood = better day
    const scored = snapshots.map((s) => ({
      ...s,
      score: s.pain + s.fatigue - s.mood,
    }));
    scored.sort((a, b) => a.score - b.score);

    return {
      best: scored.slice(0, 5),
      worst: scored.slice(-5).reverse(),
    };
  }, [logs, biometrics, contextual]);

  if (!best.length) {
    return (
      <div className="rounded-2xl bg-card border border-border/50 p-6 text-center">
        <p className="text-xs text-muted-foreground">
          Need more data to identify patterns
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-card border border-border/50 overflow-hidden">
      <div className="p-5 pb-0">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
            <ArrowsDownUpIcon className="h-4 w-4 text-indigo-500" weight="duotone" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Best vs Worst Days</h3>
            <p className="text-xs text-muted-foreground">
              What was different on your best and worst days?
            </p>
          </div>
        </div>
      </div>
      <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Best days */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Best Days
            </span>
          </div>
          <div className="divide-y divide-border/30">
            {best.map((day, i) => (
              <DayRow key={day.date} day={day} rank={i} type="best" />
            ))}
          </div>
        </div>
        {/* Worst days */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <div className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
              Worst Days
            </span>
          </div>
          <div className="divide-y divide-border/30">
            {worst.map((day, i) => (
              <DayRow key={day.date} day={day} rank={i} type="worst" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
