"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { stagger, fadeUp } from "@/lib/animations";
import { SummaryCard } from "@/components/dashboard/summary-card";
import { UnifiedTimeline } from "@/components/dashboard/unified-timeline";
import { WeeklySummary } from "@/components/dashboard/weekly-summary";
import { BiometricChart } from "@/components/dashboard/biometric-chart";
import { WeatherImpactCard } from "@/components/dashboard/weather-impact-card";
import { FlareTimeline } from "@/components/dashboard/flare-timeline";
import { BodyMapHeatmap } from "@/components/dashboard/body-map-heatmap";
import { useSymptomLogs } from "@/lib/hooks/use-symptom-logs";
import { useBiometrics, useContextualData } from "@/lib/hooks/use-biometrics";
import { useCorrelationMatrix } from "@/lib/hooks/use-correlations";
import { CardSkeleton } from "@/components/shared/loading-skeleton";
import {
  LightningIcon,
  BatteryLowIcon,
  MoonStarsIcon,
  HeartbeatIcon,
} from "@phosphor-icons/react";

export default function DashboardPage() {
  const { data: logs, isLoading: logsLoading } = useSymptomLogs();
  const { data: biometrics, isLoading: bioLoading } = useBiometrics();
  const { data: contextual, isLoading: ctxLoading } = useContextualData();
  const { data: correlations, isLoading: corrLoading } = useCorrelationMatrix();

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

  // Compute 30-day baselines and trend direction
  const baselines = useMemo(() => {
    const allLogs = logs ?? [];
    const allBio = biometrics ?? [];
    const thirtyDayLogs = allLogs.slice(0, 30);
    const thirtyDayBio = allBio.slice(0, 30);

    const painBaseline = thirtyDayLogs.length > 0
      ? thirtyDayLogs.reduce((s, l) => s + l.pain_severity, 0) / thirtyDayLogs.length
      : null;
    const fatigueBaseline = thirtyDayLogs.length > 0
      ? thirtyDayLogs.reduce((s, l) => s + l.fatigue_severity, 0) / thirtyDayLogs.length
      : null;
    const sleepBaseline = thirtyDayBio.length > 0
      ? thirtyDayBio.reduce((s, b) => s + b.sleep_duration, 0) / thirtyDayBio.length
      : null;
    const hrvBaseline = thirtyDayBio.length > 0
      ? thirtyDayBio.reduce((s, b) => s + b.hrv_rmssd, 0) / thirtyDayBio.length
      : null;

    // Compute trends: 7-day avg vs 30-day baseline
    function computeTrend(recent: number, baseline: number | null, higherIsBetter: boolean): "up" | "down" | "stable" {
      if (baseline === null || isNaN(recent)) return "stable";
      const pct = ((recent - baseline) / baseline) * 100;
      if (Math.abs(pct) < 3) return "stable";
      if (higherIsBetter) return pct > 0 ? "down" : "up"; // reversed: "up" arrow means worse
      return pct > 0 ? "up" : "down";
    }

    const numPain = parseFloat(typeof avgPain === "string" ? avgPain : String(avgPain));
    const numFatigue = parseFloat(typeof avgFatigue === "string" ? avgFatigue : String(avgFatigue));
    const numSleep = parseFloat(typeof avgSleep === "string" ? avgSleep : String(avgSleep));
    const numHrv = parseFloat(typeof avgHrv === "string" ? avgHrv : String(avgHrv));

    return {
      pain: painBaseline,
      fatigue: fatigueBaseline,
      sleep: sleepBaseline,
      hrv: hrvBaseline,
      painTrend: computeTrend(numPain, painBaseline, false),
      fatigueTrend: computeTrend(numFatigue, fatigueBaseline, false),
      sleepTrend: computeTrend(numSleep, sleepBaseline, true),
      hrvTrend: computeTrend(numHrv, hrvBaseline, true),
    };
  }, [logs, biometrics, avgPain, avgFatigue, avgSleep, avgHrv]);

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
              trend={baselines.painTrend}
              color="rose"
              icon={<LightningIcon className="h-4 w-4" weight="duotone" />}
              baseline={baselines.pain}
              higherIsBetter={false}
            />
            <SummaryCard
              title="Avg Fatigue"
              value={avgFatigue}
              unit="/10"
              trend={baselines.fatigueTrend}
              color="amber"
              icon={<BatteryLowIcon className="h-4 w-4" weight="duotone" />}
              baseline={baselines.fatigue}
              higherIsBetter={false}
            />
            <SummaryCard
              title="Avg Sleep"
              value={avgSleep}
              unit="hrs"
              trend={baselines.sleepTrend}
              color="violet"
              icon={<MoonStarsIcon className="h-4 w-4" weight="duotone" />}
              baseline={baselines.sleep}
              higherIsBetter={true}
            />
            <SummaryCard
              title="Avg HRV"
              value={avgHrv}
              unit="ms"
              trend={baselines.hrvTrend}
              color="teal"
              icon={<HeartbeatIcon className="h-4 w-4" weight="duotone" />}
              baseline={baselines.hrv}
              higherIsBetter={true}
            />
          </>
        )}
      </motion.div>

      {/* Weekly Summary */}
      <motion.div variants={fadeUp}>
        <WeeklySummary
          logs={logs ?? []}
          biometrics={biometrics ?? []}
          isLoading={logsLoading || bioLoading}
        />
      </motion.div>

      {/* Unified Timeline */}
      <motion.div variants={fadeUp}>
        <UnifiedTimeline
          logs={logs ?? []}
          biometrics={biometrics ?? []}
          contextual={contextual ?? []}
          isLoading={logsLoading || bioLoading || ctxLoading}
        />
      </motion.div>

      {/* Body Map Heatmap */}
      <motion.div variants={fadeUp}>
        <BodyMapHeatmap logs={logs ?? []} isLoading={logsLoading} />
      </motion.div>

      {/* Biometrics & Weather */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <BiometricChart
          biometrics={biometrics ?? []}
          isLoading={bioLoading}
          sleepBaseline={baselines.sleep}
          hrvBaseline={baselines.hrv}
        />
        <WeatherImpactCard
          contextual={contextual ?? []}
          logs={logs ?? []}
          correlations={correlations ?? []}
          isLoading={ctxLoading || corrLoading}
        />
      </motion.div>

      {/* Flare Timeline */}
      <motion.div variants={fadeUp}>
        <FlareTimeline logs={logs ?? []} />
      </motion.div>
    </motion.div>
  );
}
