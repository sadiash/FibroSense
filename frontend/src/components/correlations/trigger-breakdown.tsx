"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { SymptomLog, ContextualData, STRESS_EVENT_LABELS, StressEvent, DIET_FLAG_LABELS, DietFlag } from "@/lib/types";
import { LightningIcon } from "@phosphor-icons/react";

interface TriggerBreakdownProps {
  logs: SymptomLog[];
  contextual?: ContextualData[];
}

interface TriggerStat {
  label: string;
  category: "stress" | "menstrual" | "exercise" | "diet";
  avgPain: number;
  avgFatigue: number;
  count: number;
  delta: number; // vs baseline
}

const categoryStyle = {
  stress: { bg: "bg-rose-500/10", text: "text-rose-500", dot: "bg-rose-500" },
  menstrual: { bg: "bg-violet-500/10", text: "text-violet-500", dot: "bg-violet-500" },
  exercise: { bg: "bg-teal-500/10", text: "text-teal-500", dot: "bg-teal-500" },
  diet: { bg: "bg-orange-500/10", text: "text-orange-500", dot: "bg-orange-500" },
};

const phaseLabels: Record<string, string> = {
  menstrual: "Period",
  follicular: "Follicular",
  ovulatory: "Ovulatory",
  luteal: "Luteal",
};

export function TriggerBreakdown({ logs, contextual }: TriggerBreakdownProps) {
  const { triggers, baseline } = useMemo(() => {
    if (!logs.length) return { triggers: [], baseline: 0 };

    // Build a date->contextual lookup so we can merge contextual factors into logs
    const ctxByDate = new Map<string, ContextualData>();
    if (contextual) {
      for (const c of contextual) {
        ctxByDate.set(c.date, c);
      }
    }

    const base =
      logs.reduce((s, l) => s + l.pain_severity, 0) / logs.length;

    const stressMap = new Map<string, { pain: number[]; fatigue: number[] }>();
    const phaseMap = new Map<string, { pain: number[]; fatigue: number[] }>();
    const dietMap = new Map<string, { pain: number[]; fatigue: number[] }>();
    const exerciseYes: { pain: number[]; fatigue: number[] } = { pain: [], fatigue: [] };
    const exerciseNo: { pain: number[]; fatigue: number[] } = { pain: [], fatigue: [] };

    for (const log of logs) {
      const ctx = ctxByDate.get(log.date);
      const stressEvent = log.stress_event ?? ctx?.stress_event;
      const menstrualPhase = log.menstrual_phase ?? ctx?.menstrual_phase;
      const exerciseType = log.exercise_type ?? ctx?.exercise_type;
      const dietFlags = ctx?.diet_flags;

      if (stressEvent) {
        const existing = stressMap.get(stressEvent) ?? { pain: [], fatigue: [] };
        existing.pain.push(log.pain_severity);
        existing.fatigue.push(log.fatigue_severity);
        stressMap.set(stressEvent, existing);
      }
      if (menstrualPhase && menstrualPhase !== "not_applicable") {
        const existing = phaseMap.get(menstrualPhase) ?? { pain: [], fatigue: [] };
        existing.pain.push(log.pain_severity);
        existing.fatigue.push(log.fatigue_severity);
        phaseMap.set(menstrualPhase, existing);
      }
      if (dietFlags) {
        for (const flag of dietFlags.split(",")) {
          const trimmed = flag.trim();
          if (!trimmed) continue;
          const existing = dietMap.get(trimmed) ?? { pain: [], fatigue: [] };
          existing.pain.push(log.pain_severity);
          existing.fatigue.push(log.fatigue_severity);
          dietMap.set(trimmed, existing);
        }
      }
      if (exerciseType) {
        exerciseYes.pain.push(log.pain_severity);
        exerciseYes.fatigue.push(log.fatigue_severity);
      } else {
        exerciseNo.pain.push(log.pain_severity);
        exerciseNo.fatigue.push(log.fatigue_severity);
      }
    }

    const result: TriggerStat[] = [];

    stressMap.forEach((data, key) => {
      if (data.pain.length < 2) return;
      const avg = data.pain.reduce((s, v) => s + v, 0) / data.pain.length;
      const avgF = data.fatigue.reduce((s, v) => s + v, 0) / data.fatigue.length;
      result.push({
        label: STRESS_EVENT_LABELS[key as StressEvent] ?? key,
        category: "stress",
        avgPain: avg,
        avgFatigue: avgF,
        count: data.pain.length,
        delta: avg - base,
      });
    });

    phaseMap.forEach((data, key) => {
      if (data.pain.length < 2) return;
      const avg = data.pain.reduce((s, v) => s + v, 0) / data.pain.length;
      const avgF = data.fatigue.reduce((s, v) => s + v, 0) / data.fatigue.length;
      result.push({
        label: phaseLabels[key] ?? key,
        category: "menstrual",
        avgPain: avg,
        avgFatigue: avgF,
        count: data.pain.length,
        delta: avg - base,
      });
    });

    dietMap.forEach((data, key) => {
      if (data.pain.length < 2) return;
      const avg = data.pain.reduce((s, v) => s + v, 0) / data.pain.length;
      const avgF = data.fatigue.reduce((s, v) => s + v, 0) / data.fatigue.length;
      result.push({
        label: DIET_FLAG_LABELS[key as DietFlag] ?? key,
        category: "diet",
        avgPain: avg,
        avgFatigue: avgF,
        count: data.pain.length,
        delta: avg - base,
      });
    });

    if (exerciseYes.pain.length >= 2) {
      const avg = exerciseYes.pain.reduce((s, v) => s + v, 0) / exerciseYes.pain.length;
      const avgF = exerciseYes.fatigue.reduce((s, v) => s + v, 0) / exerciseYes.fatigue.length;
      result.push({
        label: "Exercise days",
        category: "exercise",
        avgPain: avg,
        avgFatigue: avgF,
        count: exerciseYes.pain.length,
        delta: avg - base,
      });
    }
    if (exerciseNo.pain.length >= 2) {
      const avg = exerciseNo.pain.reduce((s, v) => s + v, 0) / exerciseNo.pain.length;
      const avgF = exerciseNo.fatigue.reduce((s, v) => s + v, 0) / exerciseNo.fatigue.length;
      result.push({
        label: "Rest days",
        category: "exercise",
        avgPain: avg,
        avgFatigue: avgF,
        count: exerciseNo.pain.length,
        delta: avg - base,
      });
    }

    // Filter out triggers with no meaningful difference from baseline
    const meaningful = result.filter((t) => Math.abs(t.delta) >= 0.1);
    meaningful.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
    return { triggers: meaningful.slice(0, 8), baseline: base };
  }, [logs, contextual]);

  if (!triggers.length) {
    return (
      <div className="rounded-2xl bg-card border border-border/50 overflow-hidden">
        <div className="p-5 pb-0">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-rose-500/10 flex items-center justify-center">
              <LightningIcon className="h-4 w-4 text-rose-500" weight="duotone" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Trigger Breakdown</h3>
              <p className="text-xs text-muted-foreground">
                How contextual factors affect your pain
              </p>
            </div>
          </div>
        </div>
        <div className="p-5">
          <div className="rounded-xl bg-muted/20 p-4 text-center">
            <p className="text-xs text-muted-foreground">
              Start logging stress events, exercise, diet, and menstrual phase in your daily entries to see how they affect your symptoms.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const maxAbsDelta = Math.max(...triggers.map((t) => Math.abs(t.delta)), 1);

  return (
    <div className="rounded-2xl bg-card border border-border/50 overflow-hidden">
      <div className="p-5 pb-0">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-rose-500/10 flex items-center justify-center">
            <LightningIcon className="h-4 w-4 text-rose-500" weight="duotone" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Trigger Breakdown</h3>
            <p className="text-xs text-muted-foreground">
              How contextual factors affect your pain (vs {baseline.toFixed(1)} avg)
            </p>
          </div>
        </div>
      </div>
      <div className="p-5 space-y-2">
        {triggers.map((t, i) => {
          const style = categoryStyle[t.category];
          const isWorse = t.delta > 0;
          const barPct = (Math.abs(t.delta) / maxAbsDelta) * 100;

          return (
            <motion.div
              key={t.label}
              className="flex items-center gap-2.5"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${style.dot}`} />
              <span className="text-xs w-20 sm:w-28 truncate shrink-0">{t.label}</span>
              <div className="flex-1 h-5 flex items-center relative">
                {/* Center baseline */}
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border" />
                {/* Bar */}
                <div
                  className="absolute top-0.5 bottom-0.5 rounded-sm transition-all"
                  style={{
                    left: isWorse ? "50%" : `${50 - barPct / 2}%`,
                    width: `${barPct / 2}%`,
                    background: isWorse
                      ? "hsl(350, 70%, 55%)"
                      : "hsl(160, 60%, 45%)",
                    opacity: 0.6,
                  }}
                />
              </div>
              <span
                className={`text-[10px] font-bold tabular-nums w-10 sm:w-12 text-right ${
                  isWorse
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {isWorse ? "+" : ""}
                {t.delta.toFixed(1)}
              </span>
              <span className="text-[9px] text-muted-foreground w-6 text-right tabular-nums">
                {t.count}x
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
