"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { stagger, fadeUp } from "@/lib/animations";
import { CorrelationHeatmap } from "@/components/correlations/correlation-heatmap";
import { ScatterPlot } from "@/components/correlations/scatter-plot";
import { LaggedCorrelationPanel } from "@/components/correlations/lagged-correlation-panel";
import { TriggerBreakdown } from "@/components/correlations/trigger-breakdown";
import { BestWorstDays } from "@/components/correlations/best-worst-days";
import { WeeklyRhythm } from "@/components/correlations/weekly-rhythm";
import { FlareSignals } from "@/components/correlations/flare-signals";
import { useCorrelationMatrix } from "@/lib/hooks/use-correlations";
import { useSymptomLogs } from "@/lib/hooks/use-symptom-logs";
import { useBiometrics, useContextualData } from "@/lib/hooks/use-biometrics";
import { CorrelationResult } from "@/lib/types";
import { ChartSkeleton } from "@/components/shared/loading-skeleton";

const metricLabels: Record<string, string> = {
  pain_severity: "Pain",
  fatigue_severity: "Fatigue",
  brain_fog: "Brain Fog",
  mood: "Mood",
  sleep_duration: "Sleep",
  sleep_efficiency: "Sleep Eff.",
  hrv_rmssd: "HRV",
  resting_hr: "Rest. HR",
  barometric_pressure: "Pressure",
  temperature: "Temperature",
  humidity: "Humidity",
};

function InsightCard({
  corr,
  index,
  isSelected,
  onClick,
}: {
  corr: CorrelationResult;
  index: number;
  isSelected: boolean;
  onClick: () => void;
}) {
  const val = corr.correlation_coefficient;
  const abs = Math.abs(val);
  const isPositive = val > 0;
  const strength = abs > 0.6 ? "Strong" : abs > 0.4 ? "Moderate" : "Notable";

  const description = isPositive
    ? `When ${(metricLabels[corr.metric_a] ?? corr.metric_a).toLowerCase()} is higher, ${(metricLabels[corr.metric_b] ?? corr.metric_b).toLowerCase()} tends to be higher too`
    : `When ${(metricLabels[corr.metric_a] ?? corr.metric_a).toLowerCase()} is higher, ${(metricLabels[corr.metric_b] ?? corr.metric_b).toLowerCase()} tends to be lower`;

  return (
    <motion.button
      className={`text-left w-full rounded-xl p-3 border transition-all ${
        isSelected
          ? "bg-primary/5 border-primary/30 shadow-sm"
          : "bg-card border-border/50 hover:border-border"
      }`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      <div className="flex items-start gap-2.5">
        <div
          className={`mt-0.5 h-7 w-7 shrink-0 rounded-lg flex items-center justify-center ${
            isPositive
              ? "bg-emerald-500/10 text-emerald-500"
              : "bg-rose-500/10 text-rose-500"
          }`}
        >
          {isPositive ? (
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17l5-5 5 5M7 7l5 5 5-5" />
            </svg>
          ) : (
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 7l5 5 5-5M7 17l5-5 5 5" />
            </svg>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-semibold">
              {metricLabels[corr.metric_a] ?? corr.metric_a}
            </span>
            <svg className="h-3 w-3 text-muted-foreground shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-xs font-semibold">
              {metricLabels[corr.metric_b] ?? corr.metric_b}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
            {description}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p
            className={`text-xs font-bold tabular-nums ${
              isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
            }`}
          >
            {val.toFixed(2)}
          </p>
          <p className="text-[9px] text-muted-foreground">{strength}</p>
        </div>
      </div>
    </motion.button>
  );
}

export default function CorrelationsPage() {
  const { data: correlations, isLoading } = useCorrelationMatrix();
  const { data: logs } = useSymptomLogs();
  const { data: biometrics } = useBiometrics();
  const { data: contextual } = useContextualData();

  const [selectedA, setSelectedA] = useState("");
  const [selectedB, setSelectedB] = useState("");

  const topInsights = useMemo(() => {
    if (!correlations) return [];
    return [...correlations]
      .filter(
        (c) =>
          Math.abs(c.correlation_coefficient) > 0.25 &&
          c.metric_a !== c.metric_b
      )
      .sort(
        (a, b) =>
          Math.abs(b.correlation_coefficient) -
          Math.abs(a.correlation_coefficient)
      )
      .slice(0, 6);
  }, [correlations]);

  const selectedCorrelation = useMemo(() => {
    if (!selectedA || !selectedB || !correlations) return undefined;
    const found = correlations.find(
      (c) =>
        (c.metric_a === selectedA && c.metric_b === selectedB) ||
        (c.metric_a === selectedB && c.metric_b === selectedA)
    );
    return found?.correlation_coefficient;
  }, [selectedA, selectedB, correlations]);

  const scatterData = useMemo(() => {
    if (!selectedA || !selectedB || !logs || !biometrics || !contextual)
      return [];

    const dateMap = new Map<string, Record<string, number>>();

    logs.forEach((l) => {
      const existing = dateMap.get(l.date) ?? {};
      dateMap.set(l.date, {
        ...existing,
        pain_severity: l.pain_severity,
        fatigue_severity: l.fatigue_severity,
        brain_fog: l.brain_fog,
        mood: l.mood,
      });
    });

    biometrics.forEach((b) => {
      const existing = dateMap.get(b.date) ?? {};
      dateMap.set(b.date, {
        ...existing,
        sleep_duration: b.sleep_duration,
        sleep_efficiency: b.sleep_efficiency,
        hrv_rmssd: b.hrv_rmssd,
        resting_hr: b.resting_hr,
      });
    });

    contextual.forEach((c) => {
      const existing = dateMap.get(c.date) ?? {};
      dateMap.set(c.date, {
        ...existing,
        barometric_pressure: c.barometric_pressure ?? 0,
        temperature: c.temperature ?? 0,
        humidity: c.humidity ?? 0,
      });
    });

    return Array.from(dateMap.values())
      .filter(
        (row) =>
          row[selectedA] !== undefined && row[selectedB] !== undefined
      )
      .map((row) => ({ x: row[selectedA], y: row[selectedB] }));
  }, [selectedA, selectedB, logs, biometrics, contextual]);

  function handleSelect(a: string, b: string) {
    setSelectedA(a);
    setSelectedB(b);
  }

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-4 sm:space-y-6"
    >
      {/* Page header */}
      <motion.div variants={fadeUp}>
        <h2 className="text-lg font-bold">Insights</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Discover what drives your symptoms
        </p>
      </motion.div>

      {/* === Section 1: At-a-glance patterns === */}
      {/* Trigger Breakdown + Weekly Rhythm side by side */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <TriggerBreakdown logs={logs ?? []} />
        <WeeklyRhythm logs={logs ?? []} />
      </motion.div>

      {/* === Section 2: Flare analysis === */}
      {/* Flare Signals + Best/Worst Days side by side */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <FlareSignals
          logs={logs ?? []}
          biometrics={biometrics ?? []}
          contextual={contextual ?? []}
        />
        <BestWorstDays
          logs={logs ?? []}
          biometrics={biometrics ?? []}
          contextual={contextual ?? []}
        />
      </motion.div>

      {/* === Section 3: Key Findings === */}
      <motion.div variants={fadeUp}>
        {isLoading ? (
          <ChartSkeleton />
        ) : topInsights.length > 0 ? (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-6 w-6 rounded-md bg-amber-500/10 flex items-center justify-center">
                <svg className="h-3 w-3 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xs font-semibold">Strongest Connections</h3>
                <p className="text-[10px] text-muted-foreground">
                  Tap any card to drill into the relationship
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {topInsights.map((corr, i) => (
                <InsightCard
                  key={`${corr.metric_a}-${corr.metric_b}`}
                  corr={corr}
                  index={i}
                  isSelected={
                    (selectedA === corr.metric_a &&
                      selectedB === corr.metric_b) ||
                    (selectedA === corr.metric_b &&
                      selectedB === corr.metric_a)
                  }
                  onClick={() => handleSelect(corr.metric_a, corr.metric_b)}
                />
              ))}
            </div>
          </div>
        ) : null}
      </motion.div>

      {/* === Section 4: Detail drilldown (appears on selection) === */}
      <AnimatePresence>
        {selectedA && selectedB && (
          <motion.div
            key={`${selectedA}-${selectedB}`}
            initial={{ opacity: 0, y: 16, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -12, height: 0 }}
            transition={{ type: "spring" as const, stiffness: 300, damping: 26 }}
          >
            <div className="rounded-2xl bg-card border border-border/50 overflow-hidden">
              <div className="p-4 sm:p-5 pb-0 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" />
                      <path d="M21 21l-4.35-4.35" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">
                      {metricLabels[selectedA] ?? selectedA} &harr;{" "}
                      {metricLabels[selectedB] ?? selectedB}
                    </h3>
                    <p className="text-[10px] text-muted-foreground">
                      Scatter plot + time-lagged correlation
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedA("");
                    setSelectedB("");
                  }}
                  className="h-7 w-7 rounded-lg bg-muted/50 hover:bg-muted flex items-center justify-center transition-colors"
                >
                  <svg className="h-3.5 w-3.5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <ScatterPlot
                  metricA={selectedA}
                  metricB={selectedB}
                  data={scatterData}
                  correlation={selectedCorrelation}
                />
                <LaggedCorrelationPanel
                  initialA={selectedA}
                  initialB={selectedB}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* === Section 5: Full Correlation Matrix === */}
      <motion.div variants={fadeUp}>
        <CorrelationHeatmap
          correlations={correlations ?? []}
          isLoading={isLoading}
          selectedA={selectedA}
          selectedB={selectedB}
          onCellClick={handleSelect}
        />
      </motion.div>
    </motion.div>
  );
}
