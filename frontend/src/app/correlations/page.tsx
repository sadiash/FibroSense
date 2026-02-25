"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { stagger, fadeUp } from "@/lib/animations";
import { CorrelationHeatmap } from "@/components/correlations/correlation-heatmap";
import { ScatterPlot } from "@/components/correlations/scatter-plot";
import { LaggedCorrelationPanel } from "@/components/correlations/lagged-correlation-panel";
import { useCorrelationMatrix } from "@/lib/hooks/use-correlations";
import { useSymptomLogs } from "@/lib/hooks/use-symptom-logs";
import { useBiometrics, useContextualData } from "@/lib/hooks/use-biometrics";

export default function CorrelationsPage() {
  const { data: correlations, isLoading } = useCorrelationMatrix();
  const { data: logs } = useSymptomLogs();
  const { data: biometrics } = useBiometrics();
  const { data: contextual } = useContextualData();

  const [selectedA, setSelectedA] = useState("");
  const [selectedB, setSelectedB] = useState("");

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

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Page header */}
      <motion.div variants={fadeUp}>
        <h2 className="text-lg font-bold">Insights & Correlations</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Discover patterns between your symptoms, biometrics, and environment
        </p>
      </motion.div>

      <motion.div variants={fadeUp}>
        <CorrelationHeatmap
          correlations={correlations ?? []}
          isLoading={isLoading}
          onCellClick={(a, b) => {
            setSelectedA(a);
            setSelectedB(b);
          }}
        />
      </motion.div>

      <motion.div variants={fadeUp} className="grid md:grid-cols-2 gap-4">
        <ScatterPlot
          metricA={selectedA}
          metricB={selectedB}
          data={scatterData}
        />
        <LaggedCorrelationPanel />
      </motion.div>
    </motion.div>
  );
}
