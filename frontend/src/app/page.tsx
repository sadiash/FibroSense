"use client";

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
  const avgPain =
    recentLogs.length > 0
      ? (
          recentLogs.reduce((s, l) => s + l.pain_severity, 0) / recentLogs.length
        ).toFixed(1)
      : "—";
  const avgFatigue =
    recentLogs.length > 0
      ? (
          recentLogs.reduce((s, l) => s + l.fatigue_severity, 0) /
          recentLogs.length
        ).toFixed(1)
      : "—";
  const avgSleep =
    biometrics && biometrics.length > 0
      ? (
          biometrics
            .slice(0, 7)
            .reduce((s, b) => s + b.sleep_duration, 0) /
          Math.min(7, biometrics.length)
        ).toFixed(1)
      : "—";
  const avgHrv =
    biometrics && biometrics.length > 0
      ? Math.round(
          biometrics
            .slice(0, 7)
            .reduce((s, b) => s + b.hrv_rmssd, 0) /
            Math.min(7, biometrics.length)
        ).toString()
      : "—";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {logsLoading || bioLoading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          <>
            <SummaryCard title="Avg Pain (7d)" value={avgPain} unit="/10" trend="stable" />
            <SummaryCard title="Avg Fatigue (7d)" value={avgFatigue} unit="/10" trend="up" />
            <SummaryCard title="Avg Sleep (7d)" value={avgSleep} unit="hrs" trend="down" />
            <SummaryCard title="Avg HRV (7d)" value={avgHrv} unit="ms" trend="stable" />
          </>
        )}
      </div>

      <SymptomTrendChart logs={logs ?? []} isLoading={logsLoading} />

      <BodyMapHeatmap logs={logs ?? []} isLoading={logsLoading} />

      <div className="grid md:grid-cols-2 gap-4">
        <BiometricChart biometrics={biometrics ?? []} isLoading={bioLoading} />
        <WeatherCard data={contextual ?? []} isLoading={ctxLoading} />
      </div>

      <FlareTimeline logs={logs ?? []} />
    </div>
  );
}
