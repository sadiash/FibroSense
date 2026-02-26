"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { SymptomLog } from "@/lib/types";
import { parseISO, getDay } from "date-fns";
import { CalendarDotsIcon } from "@phosphor-icons/react";

interface WeeklyRhythmProps {
  logs: SymptomLog[];
}

const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const metricDefs = [
  { key: "pain", label: "Pain", color: "rose" },
  { key: "fatigue", label: "Fatigue", color: "amber" },
  { key: "fog", label: "Brain Fog", color: "violet" },
  { key: "mood", label: "Mood", color: "emerald" },
] as const;

function heatColor(
  value: number,
  min: number,
  max: number,
  color: string,
  invert = false
): string {
  if (max === min) return "hsl(var(--muted) / 0.3)";
  let t = (value - min) / (max - min);
  if (invert) t = 1 - t;

  const colorMap: Record<string, string> = {
    rose: `hsla(350, 70%, 55%, ${0.1 + t * 0.6})`,
    amber: `hsla(35, 80%, 50%, ${0.1 + t * 0.6})`,
    violet: `hsla(262, 70%, 55%, ${0.1 + t * 0.6})`,
    emerald: `hsla(160, 60%, 45%, ${0.1 + t * 0.6})`,
  };
  return colorMap[color] ?? `hsla(0, 0%, 50%, ${0.1 + t * 0.5})`;
}

export function WeeklyRhythm({ logs }: WeeklyRhythmProps) {
  const data = useMemo(() => {
    if (logs.length < 7) return null;

    const buckets: Record<
      number,
      { pain: number[]; fatigue: number[]; fog: number[]; mood: number[] }
    > = {};
    for (let d = 0; d < 7; d++) {
      buckets[d] = { pain: [], fatigue: [], fog: [], mood: [] };
    }

    for (const log of logs) {
      const dow = getDay(parseISO(log.date));
      buckets[dow].pain.push(log.pain_severity);
      buckets[dow].fatigue.push(log.fatigue_severity);
      buckets[dow].fog.push(log.brain_fog);
      buckets[dow].mood.push(log.mood);
    }

    const avg = (arr: number[]) =>
      arr.length > 0 ? arr.reduce((s, v) => s + v, 0) / arr.length : 0;

    const rows = dayLabels.map((label, i) => ({
      label,
      pain: avg(buckets[i].pain),
      fatigue: avg(buckets[i].fatigue),
      fog: avg(buckets[i].fog),
      mood: avg(buckets[i].mood),
      count: buckets[i].pain.length,
    }));

    return rows;
  }, [logs]);

  if (!data) {
    return (
      <div className="rounded-2xl bg-card border border-border/50 p-6 text-center">
        <p className="text-xs text-muted-foreground">
          Need at least a week of data for weekly patterns
        </p>
      </div>
    );
  }

  const allPain = data.map((d) => d.pain);
  const allFatigue = data.map((d) => d.fatigue);
  const allFog = data.map((d) => d.fog);
  const allMood = data.map((d) => d.mood);

  const ranges = {
    pain: { min: Math.min(...allPain), max: Math.max(...allPain) },
    fatigue: { min: Math.min(...allFatigue), max: Math.max(...allFatigue) },
    fog: { min: Math.min(...allFog), max: Math.max(...allFog) },
    mood: { min: Math.min(...allMood), max: Math.max(...allMood) },
  };

  // Find worst and best days
  const worstDay = data.reduce((w, d) =>
    d.pain + d.fatigue > w.pain + w.fatigue ? d : w
  );
  const bestDay = data.reduce((b, d) =>
    d.pain + d.fatigue < b.pain + b.fatigue ? d : b
  );

  return (
    <div className="rounded-2xl bg-card border border-border/50 overflow-hidden">
      <div className="p-5 pb-0">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <CalendarDotsIcon className="h-4 w-4 text-amber-500" weight="duotone" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Weekly Rhythm</h3>
            <p className="text-xs text-muted-foreground">
              Average severity by day of week
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-3 flex-wrap">
          <span className="text-[10px] text-muted-foreground">
            Toughest: <span className="font-semibold text-rose-500">{worstDay.label}s</span>
          </span>
          <span className="text-[10px] text-muted-foreground">
            Easiest: <span className="font-semibold text-emerald-500">{bestDay.label}s</span>
          </span>
        </div>
      </div>

      <div className="p-5">
        {/* Header */}
        <div className="flex items-center gap-1 mb-2">
          <div className="w-10" />
          {metricDefs.map((m) => (
            <div key={m.key} className="flex-1 text-center">
              <span className="text-[9px] text-muted-foreground font-medium">
                {m.label}
              </span>
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="space-y-1">
          {data.map((row, i) => (
            <motion.div
              key={row.label}
              className="flex items-center gap-1"
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <span className="text-[9px] sm:text-[10px] font-medium text-muted-foreground w-8 sm:w-10 shrink-0">
                {row.label}
              </span>
              {metricDefs.map((m) => {
                const val = row[m.key];
                const range = ranges[m.key];
                const invert = m.key === "mood"; // higher mood = better
                return (
                  <div
                    key={m.key}
                    className="flex-1 h-7 sm:h-8 rounded-md flex items-center justify-center transition-colors"
                    style={{
                      backgroundColor: heatColor(
                        val,
                        range.min,
                        range.max,
                        m.color,
                        invert
                      ),
                    }}
                  >
                    <span className="text-[10px] font-bold tabular-nums">
                      {val.toFixed(1)}
                    </span>
                  </div>
                );
              })}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
