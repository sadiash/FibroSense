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
import {
  TrendUpIcon,
  TrendDownIcon,
  ArrowRightIcon,
  LightbulbIcon,
  MagnifyingGlassIcon,
  XIcon,
} from "@phosphor-icons/react";

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

  const sigLabel = corr.p_value < 0.05
    ? "Significant"
    : corr.p_value < 0.1
      ? "Suggestive"
      : null;
  const sigColor = corr.p_value < 0.05
    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
    : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";

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
            <TrendUpIcon className="h-3.5 w-3.5" weight="bold" />
          ) : (
            <TrendDownIcon className="h-3.5 w-3.5" weight="bold" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-semibold">
              {metricLabels[corr.metric_a] ?? corr.metric_a}
            </span>
            <ArrowRightIcon className="h-3 w-3 text-muted-foreground shrink-0" weight="bold" />
            <span className="text-xs font-semibold">
              {metricLabels[corr.metric_b] ?? corr.metric_b}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
            {description}
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            {sigLabel && (
              <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-medium border ${sigColor}`}>
                {sigLabel}
              </span>
            )}
            <span className="text-[9px] text-muted-foreground tabular-nums">
              n={corr.sample_size}
            </span>
            {corr.sample_size < 14 && (
              <span className="text-[9px] text-amber-500">
                Log 14+ days for reliable patterns
              </span>
            )}
          </div>
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

  const selectedCorrelationResult = useMemo(() => {
    if (!selectedA || !selectedB || !correlations) return undefined;
    return correlations.find(
      (c) =>
        (c.metric_a === selectedA && c.metric_b === selectedB) ||
        (c.metric_a === selectedB && c.metric_b === selectedA)
    );
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
        <TriggerBreakdown logs={logs ?? []} contextual={contextual ?? []} />
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
                <LightbulbIcon className="h-3 w-3 text-amber-500" weight="duotone" />
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
            <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed">
              Correlation values range from -1 to +1. Values closer to |1| indicate stronger relationships.
              {" "}&quot;Significant&quot; means the pattern is unlikely due to chance (p&lt;0.05).
            </p>
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
                    <MagnifyingGlassIcon className="h-4 w-4" weight="duotone" />
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
                  <XIcon className="h-3.5 w-3.5 text-muted-foreground" weight="bold" />
                </button>
              </div>
              <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <ScatterPlot
                  metricA={selectedA}
                  metricB={selectedB}
                  data={scatterData}
                  correlation={selectedCorrelationResult?.correlation_coefficient}
                  pValue={selectedCorrelationResult?.p_value}
                  sampleSize={selectedCorrelationResult?.sample_size}
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
