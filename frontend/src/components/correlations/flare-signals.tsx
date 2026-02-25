"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { SymptomLog, BiometricReading, ContextualData } from "@/lib/types";
import { parseISO, subDays, format } from "date-fns";

interface FlareSignalsProps {
  logs: SymptomLog[];
  biometrics: BiometricReading[];
  contextual: ContextualData[];
}

interface Signal {
  metric: string;
  label: string;
  beforeFlare: number;
  baseline: number;
  delta: number;
  unit: string;
}

export function FlareSignals({
  logs,
  biometrics,
  contextual,
}: FlareSignalsProps) {
  const { signals, flareCount } = useMemo(() => {
    const flares = logs.filter((l) => l.is_flare);
    if (flares.length < 2) return { signals: [], flareCount: 0 };

    const bioMap = new Map<string, BiometricReading>();
    biometrics.forEach((b) => bioMap.set(b.date, b));
    const ctxMap = new Map<string, ContextualData>();
    contextual.forEach((c) => ctxMap.set(c.date, c));
    const logMap = new Map<string, SymptomLog>();
    logs.forEach((l) => logMap.set(l.date, l));

    // Collect metrics 1-2 days before each flare
    const preFlareMetrics: Record<string, number[]> = {
      pain_severity: [],
      fatigue_severity: [],
      brain_fog: [],
      sleep_duration: [],
      hrv_rmssd: [],
      resting_hr: [],
      barometric_pressure: [],
    };

    const allMetrics: Record<string, number[]> = {
      pain_severity: [],
      fatigue_severity: [],
      brain_fog: [],
      sleep_duration: [],
      hrv_rmssd: [],
      resting_hr: [],
      barometric_pressure: [],
    };

    // Collect baselines from all days
    for (const log of logs) {
      allMetrics.pain_severity.push(log.pain_severity);
      allMetrics.fatigue_severity.push(log.fatigue_severity);
      allMetrics.brain_fog.push(log.brain_fog);
      const bio = bioMap.get(log.date);
      if (bio) {
        allMetrics.sleep_duration.push(bio.sleep_duration);
        allMetrics.hrv_rmssd.push(bio.hrv_rmssd);
        allMetrics.resting_hr.push(bio.resting_hr);
      }
      const ctx = ctxMap.get(log.date);
      if (ctx?.barometric_pressure) {
        allMetrics.barometric_pressure.push(ctx.barometric_pressure);
      }
    }

    // Collect pre-flare metrics (1-2 days before)
    for (const flare of flares) {
      const flareDate = parseISO(flare.date);
      for (let offset = 1; offset <= 2; offset++) {
        const checkDate = format(subDays(flareDate, offset), "yyyy-MM-dd");
        const log = logMap.get(checkDate);
        if (log) {
          preFlareMetrics.pain_severity.push(log.pain_severity);
          preFlareMetrics.fatigue_severity.push(log.fatigue_severity);
          preFlareMetrics.brain_fog.push(log.brain_fog);
        }
        const bio = bioMap.get(checkDate);
        if (bio) {
          preFlareMetrics.sleep_duration.push(bio.sleep_duration);
          preFlareMetrics.hrv_rmssd.push(bio.hrv_rmssd);
          preFlareMetrics.resting_hr.push(bio.resting_hr);
        }
        const ctx = ctxMap.get(checkDate);
        if (ctx?.barometric_pressure) {
          preFlareMetrics.barometric_pressure.push(ctx.barometric_pressure);
        }
      }
    }

    const avg = (arr: number[]) =>
      arr.length > 0 ? arr.reduce((s, v) => s + v, 0) / arr.length : 0;

    const labelMap: Record<string, { label: string; unit: string }> = {
      pain_severity: { label: "Pain", unit: "/10" },
      fatigue_severity: { label: "Fatigue", unit: "/10" },
      brain_fog: { label: "Brain Fog", unit: "/10" },
      sleep_duration: { label: "Sleep", unit: "hrs" },
      hrv_rmssd: { label: "HRV", unit: "ms" },
      resting_hr: { label: "Resting HR", unit: "bpm" },
      barometric_pressure: { label: "Pressure", unit: "hPa" },
    };

    const results: Signal[] = [];
    for (const [metric, preVals] of Object.entries(preFlareMetrics)) {
      if (preVals.length < 2 || allMetrics[metric].length < 5) continue;
      const before = avg(preVals);
      const base = avg(allMetrics[metric]);
      const delta = before - base;
      if (Math.abs(delta) > 0.01) {
        results.push({
          metric,
          label: labelMap[metric].label,
          beforeFlare: before,
          baseline: base,
          delta,
          unit: labelMap[metric].unit,
        });
      }
    }

    results.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
    return { signals: results, flareCount: flares.length };
  }, [logs, biometrics, contextual]);

  if (!signals.length) {
    return (
      <div className="rounded-2xl bg-card border border-border/50 p-6 text-center">
        <div className="h-10 w-10 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-2">
          <svg className="h-5 w-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>
        <p className="text-xs text-muted-foreground">
          Need at least 2 logged flares to identify early warning signals
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-card border border-border/50 overflow-hidden">
      <div className="p-5 pb-0">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
            <svg className="h-4 w-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <path d="M12 9v4M12 17h.01" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Flare Early Warnings</h3>
            <p className="text-xs text-muted-foreground">
              What shifted 1-2 days before your {flareCount} flares
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-3">
        {signals.map((s, i) => {
          const isWorse =
            s.metric === "sleep_duration" || s.metric === "hrv_rmssd"
              ? s.delta < 0
              : s.delta > 0;

          return (
            <motion.div
              key={s.metric}
              className="rounded-xl bg-muted/20 p-3"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1.5 gap-0.5">
                <span className="text-xs font-semibold">{s.label}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-muted-foreground">
                    Baseline: {s.baseline.toFixed(1)}{s.unit}
                  </span>
                  <svg className="h-3 w-3 text-muted-foreground shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path d="M5 12h14" strokeLinecap="round" />
                  </svg>
                  <span
                    className={`text-[10px] font-bold whitespace-nowrap ${
                      isWorse
                        ? "text-rose-600 dark:text-rose-400"
                        : "text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    Pre-flare: {s.beforeFlare.toFixed(1)}{s.unit}
                  </span>
                </div>
              </div>

              {/* Visual bar comparison */}
              <div className="flex items-center gap-2 h-5">
                <div className="flex-1 h-2 rounded-full bg-muted/50 relative overflow-hidden">
                  {/* Baseline marker */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-muted-foreground/30 z-10"
                    style={{
                      left: `${(s.baseline / 10) * 100}%`,
                    }}
                  />
                  {/* Pre-flare bar */}
                  <motion.div
                    className={`absolute top-0 bottom-0 rounded-full ${
                      isWorse ? "bg-rose-500/60" : "bg-emerald-500/60"
                    }`}
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(s.beforeFlare / Math.max(s.baseline, s.beforeFlare, 10)) * 100}%`,
                    }}
                    transition={{ duration: 0.5, delay: i * 0.06 }}
                  />
                </div>
                <span
                  className={`text-[10px] font-bold tabular-nums w-10 text-right ${
                    isWorse
                      ? "text-rose-600 dark:text-rose-400"
                      : "text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  {s.delta > 0 ? "+" : ""}
                  {s.delta.toFixed(1)}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
