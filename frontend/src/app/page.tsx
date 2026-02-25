"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { stagger, fadeUp } from "@/lib/animations";
import { SummaryCard } from "@/components/dashboard/summary-card";
import { SymptomTrendChart } from "@/components/dashboard/symptom-trend-chart";
import { BiometricChart } from "@/components/dashboard/biometric-chart";
import { WeatherCard } from "@/components/dashboard/weather-card";
import { FlareTimeline } from "@/components/dashboard/flare-timeline";
import { BodyMapHeatmap } from "@/components/dashboard/body-map-heatmap";
import { useSymptomLogs } from "@/lib/hooks/use-symptom-logs";
import { useBiometrics, useContextualData } from "@/lib/hooks/use-biometrics";
import { CardSkeleton } from "@/components/shared/loading-skeleton";

export default function DashboardPage() {
  const { data: logs, isLoading: logsLoading } = useSymptomLogs();
  const { data: biometrics, isLoading: bioLoading } = useBiometrics();
  const { data: contextual, isLoading: ctxLoading } = useContextualData();

  const recentLogs = logs?.slice(0, 7) ?? [];

  const { avgPain, avgFatigue } = useMemo(() => {
    if (recentLogs.length === 0) return { avgPain: "\u2014", avgFatigue: "\u2014" };
    return {
      avgPain: (
        recentLogs.reduce((s, l) => s + l.pain_severity, 0) /
        recentLogs.length
      ).toFixed(1),
      avgFatigue: (
        recentLogs.reduce((s, l) => s + l.fatigue_severity, 0) /
        recentLogs.length
      ).toFixed(1),
    };
  }, [recentLogs]);

  const { avgSleep, avgHrv } = useMemo(() => {
    if (!biometrics || biometrics.length === 0) return { avgSleep: "\u2014", avgHrv: "\u2014" };
    const recent = biometrics.slice(0, 7);
    const count = recent.length;
    return {
      avgSleep: (recent.reduce((s, b) => s + b.sleep_duration, 0) / count).toFixed(1),
      avgHrv: Math.round(recent.reduce((s, b) => s + b.hrv_rmssd, 0) / count).toString(),
    };
  }, [biometrics]);

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-4 sm:space-y-6"
    >
      {/* Summary Cards */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {logsLoading || bioLoading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          <>
            <SummaryCard
              title="Avg Pain"
              value={avgPain}
              unit="/10"
              trend="stable"
              color="rose"
              icon={
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              }
            />
            <SummaryCard
              title="Avg Fatigue"
              value={avgFatigue}
              unit="/10"
              trend="up"
              color="amber"
              icon={
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18.36 6.64a9 9 0 11-12.73 0M12 2v4" />
                </svg>
              }
            />
            <SummaryCard
              title="Avg Sleep"
              value={avgSleep}
              unit="hrs"
              trend="down"
              color="violet"
              icon={
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                </svg>
              }
            />
            <SummaryCard
              title="Avg HRV"
              value={avgHrv}
              unit="ms"
              trend="stable"
              color="teal"
              icon={
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              }
            />
          </>
        )}
      </motion.div>

      {/* Symptom Trends */}
      <motion.div variants={fadeUp}>
        <SymptomTrendChart logs={logs ?? []} isLoading={logsLoading} />
      </motion.div>

      {/* Body Map Heatmap */}
      <motion.div variants={fadeUp}>
        <BodyMapHeatmap logs={logs ?? []} isLoading={logsLoading} />
      </motion.div>

      {/* Biometrics & Weather */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <BiometricChart biometrics={biometrics ?? []} isLoading={bioLoading} />
        <WeatherCard data={contextual ?? []} isLoading={ctxLoading} />
      </motion.div>

      {/* Flare Timeline */}
      <motion.div variants={fadeUp}>
        <FlareTimeline logs={logs ?? []} />
      </motion.div>
    </motion.div>
  );
}
