"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { ContextualData, SymptomLog, CorrelationResult } from "@/lib/types";
import { CardSkeleton } from "@/components/shared/loading-skeleton";
import {
  ComposedChart,
  Line,
  YAxis,
  XAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  CloudRainIcon,
  ArrowDownRightIcon,
  ArrowUpRightIcon,
  MinusIcon,
  ClockCountdownIcon,
} from "@phosphor-icons/react";

interface WeatherImpactCardProps {
  contextual: ContextualData[];
  logs: SymptomLog[];
  correlations: CorrelationResult[];
  isLoading?: boolean;
}

// --- Pressure Direction ---
type PressureDirection = "rising" | "falling" | "stable";

function usePressureDirection(data: ContextualData[]) {
  return useMemo(() => {
    const sorted = [...data]
      .filter((d) => d.barometric_pressure != null)
      .sort((a, b) => b.date.localeCompare(a.date));

    if (sorted.length === 0) return { direction: null, delta: 0, latest: null, previous: null };
    if (sorted.length === 1) return { direction: null, delta: 0, latest: sorted[0], previous: null };

    const latest = sorted[0];
    const previous = sorted[1];
    const delta = (latest.barometric_pressure ?? 0) - (previous.barometric_pressure ?? 0);
    let direction: PressureDirection = "stable";
    if (delta >= 2) direction = "rising";
    else if (delta <= -2) direction = "falling";

    return { direction, delta, latest, previous };
  }, [data]);
}

// --- Personal Sensitivity ---
interface SensitivityResult {
  level: "high" | "moderate" | "low" | "insufficient";
  strongestR: number | null;
  strongestPair: string | null;
  significant: boolean;
}

const WEATHER_METRICS = ["barometric_pressure", "temperature", "humidity"];
const SYMPTOM_METRICS = ["pain_severity", "fatigue_severity", "brain_fog"];

function useSensitivity(correlations: CorrelationResult[]): SensitivityResult {
  return useMemo(() => {
    const weatherCorrs = correlations.filter(
      (c) =>
        (WEATHER_METRICS.includes(c.metric_a) && SYMPTOM_METRICS.includes(c.metric_b)) ||
        (WEATHER_METRICS.includes(c.metric_b) && SYMPTOM_METRICS.includes(c.metric_a))
    );

    if (weatherCorrs.length === 0) {
      return { level: "insufficient", strongestR: null, strongestPair: null, significant: false };
    }

    // Check if we have enough data
    const maxSample = Math.max(...weatherCorrs.map((c) => c.sample_size));
    if (maxSample < 14) {
      return { level: "insufficient", strongestR: null, strongestPair: null, significant: false };
    }

    // Find strongest correlation
    const strongest = weatherCorrs.reduce((best, c) =>
      Math.abs(c.correlation_coefficient) > Math.abs(best.correlation_coefficient) ? c : best
    );

    const absR = Math.abs(strongest.correlation_coefficient);
    let level: SensitivityResult["level"] = "low";
    if (absR > 0.5) level = "high";
    else if (absR > 0.3) level = "moderate";

    const significant = strongest.p_value < 0.05;
    const pairLabel = formatMetricPair(strongest.metric_a, strongest.metric_b);

    return { level, strongestR: strongest.correlation_coefficient, strongestPair: pairLabel, significant };
  }, [correlations]);
}

function formatMetricName(m: string): string {
  const map: Record<string, string> = {
    barometric_pressure: "pressure",
    temperature: "temperature",
    humidity: "humidity",
    pain_severity: "pain",
    fatigue_severity: "fatigue",
    brain_fog: "brain fog",
  };
  return map[m] ?? m;
}

function formatMetricPair(a: string, b: string): string {
  const wa = WEATHER_METRICS.includes(a) ? a : b;
  const sa = WEATHER_METRICS.includes(a) ? b : a;
  return `${formatMetricName(wa)}\u2194${formatMetricName(sa)}`;
}

// --- Historical Pattern Match ---
interface PatternMatch {
  matchCount: number;
  avgPain: number;
  flareRate: number | null;
}

function useHistoricalPattern(
  contextual: ContextualData[],
  logs: SymptomLog[]
): PatternMatch | null {
  return useMemo(() => {
    const sorted = [...contextual]
      .filter((d) => d.barometric_pressure != null)
      .sort((a, b) => b.date.localeCompare(a.date));

    if (sorted.length < 2) return null;

    const today = sorted[0];
    if (today.barometric_pressure == null) return null;

    const logsByDate = new Map<string, SymptomLog>();
    for (const log of logs) {
      logsByDate.set(log.date, log);
    }

    // Find past days with similar weather (skip today)
    const similarDays: { ctx: ContextualData; log: SymptomLog }[] = [];
    for (let i = 1; i < sorted.length; i++) {
      const d = sorted[i];
      if (d.barometric_pressure == null) continue;

      const pressureClose = Math.abs(d.barometric_pressure - today.barometric_pressure!) <= 5;
      const tempClose =
        today.temperature == null ||
        d.temperature == null ||
        Math.abs(d.temperature - today.temperature) <= 3;
      const humidClose =
        today.humidity == null ||
        d.humidity == null ||
        Math.abs(d.humidity - today.humidity) <= 10;

      if (pressureClose && tempClose && humidClose) {
        const log = logsByDate.get(d.date);
        if (log) {
          similarDays.push({ ctx: d, log });
        }
      }
    }

    if (similarDays.length < 3) return null;

    const avgPain =
      similarDays.reduce((s, d) => s + d.log.pain_severity, 0) / similarDays.length;
    const flareCount = similarDays.filter((d) => d.log.is_flare).length;
    const flareRate = flareCount > 0 ? flareCount / similarDays.length : null;

    return { matchCount: similarDays.length, avgPain, flareRate };
  }, [contextual, logs]);
}

// --- Sparkline Data ---
function useSparklineData(contextual: ContextualData[], logs: SymptomLog[]) {
  return useMemo(() => {
    const last7 = [...contextual]
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-7);

    const logsByDate = new Map<string, SymptomLog>();
    for (const log of logs) {
      logsByDate.set(log.date, log);
    }

    return last7.map((d) => {
      const log = logsByDate.get(d.date);
      return {
        date: d.date.slice(5), // MM-DD
        pressure: d.barometric_pressure,
        pain: log?.pain_severity ?? null,
      };
    });
  }, [contextual, logs]);
}

// --- Direction Icon ---
function DirectionIcon({ direction }: { direction: PressureDirection }) {
  if (direction === "falling") {
    return <ArrowDownRightIcon className="h-5 w-5" weight="bold" />;
  }
  if (direction === "rising") {
    return <ArrowUpRightIcon className="h-5 w-5" weight="bold" />;
  }
  return <MinusIcon className="h-5 w-5" weight="bold" />;
}

// --- Sparkline Tooltip ---
function SparklineTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number | null; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-xl p-2.5 shadow-lg border border-border/50">
      <p className="text-[10px] font-medium text-muted-foreground mb-1.5">{label}</p>
      <div className="space-y-1">
        {payload.map(
          (entry) =>
            entry.value != null && (
              <div key={entry.name} className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-[10px] text-foreground">{entry.name}</span>
                <span className="text-[10px] font-bold ml-auto">
                  {entry.name === "Pain" ? `${entry.value}/10` : `${entry.value} hPa`}
                </span>
              </div>
            )
        )}
      </div>
    </div>
  );
}

// --- Main Component ---
export function WeatherImpactCard({
  contextual,
  logs,
  correlations,
  isLoading,
}: WeatherImpactCardProps) {
  const { direction, delta, latest } = usePressureDirection(contextual);
  const sensitivity = useSensitivity(correlations);
  const pattern = useHistoricalPattern(contextual, logs);
  const sparklineData = useSparklineData(contextual, logs);

  if (isLoading) return <CardSkeleton />;

  const hasLogs = logs.length > 0;
  const hasContextual = contextual.length > 0;

  // --- Empty state ---
  if (!hasContextual) {
    return (
      <motion.div
        className="rounded-2xl bg-card border border-border/50 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="p-5 pb-0">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-sky-500/10 flex items-center justify-center">
              <CloudRainIcon className="h-4 w-4 text-sky-500" weight="duotone" />
            </div>
            <h3 className="text-sm font-semibold">Weather Impact</h3>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
          <div className="h-12 w-12 rounded-xl bg-muted/50 flex items-center justify-center text-muted-foreground mb-3">
            <CloudRainIcon className="h-6 w-6" weight="duotone" />
          </div>
          <p className="text-sm font-medium text-foreground">No weather data</p>
          <p className="mt-1 text-xs text-muted-foreground">Configure location in Settings</p>
        </div>
      </motion.div>
    );
  }

  // Direction color
  const dirBg =
    direction === "falling"
      ? "bg-amber-500/10"
      : direction === "rising"
        ? "bg-teal-500/10"
        : "bg-muted/30";

  const dirText =
    direction === "falling"
      ? "text-amber-500"
      : direction === "rising"
        ? "text-teal-500"
        : "text-muted-foreground";

  const dirLabel =
    direction === "falling"
      ? "Falling"
      : direction === "rising"
        ? "Rising"
        : direction === "stable"
          ? "Stable"
          : null;

  // Sensitivity badge config
  const sensitivityConfig = {
    high: { label: "High sensitivity", className: "bg-rose-500/10 text-rose-500" },
    moderate: { label: "Moderate sensitivity", className: "bg-amber-500/10 text-amber-500" },
    low: { label: "Low sensitivity", className: "bg-emerald-500/10 text-emerald-500" },
    insufficient: { label: "Log 14+ days to unlock insights", className: "bg-muted/30 text-muted-foreground" },
  };

  return (
    <motion.div
      className="rounded-2xl bg-card border border-border/50 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="p-5 pb-0">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-sky-500/10 flex items-center justify-center">
            <CloudRainIcon className="h-4 w-4 text-sky-500" weight="duotone" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Weather Impact</h3>
            <p className="text-xs text-muted-foreground">How weather affects your symptoms</p>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Section A: Pressure Direction Banner */}
        <div className={`rounded-xl ${dirBg} p-3`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {direction && (
                <div className={dirText}>
                  <DirectionIcon direction={direction} />
                </div>
              )}
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-bold">
                    {latest?.barometric_pressure?.toFixed(0) ?? "--"}
                  </span>
                  <span className="text-xs text-muted-foreground">hPa</span>
                </div>
                {dirLabel && (
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs font-medium ${dirText}`}>
                      {dirLabel}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {delta > 0 ? "+" : ""}
                      {delta.toFixed(1)} hPa
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Secondary: temp + humidity */}
            <div className="flex gap-3 text-right">
              <div>
                <p className="text-sm font-semibold">
                  {latest?.temperature?.toFixed(1) ?? "--"}{"\u00B0"}
                </p>
                <p className="text-[10px] text-muted-foreground uppercase">Temp</p>
              </div>
              <div>
                <p className="text-sm font-semibold">
                  {latest?.humidity?.toFixed(0) ?? "--"}%
                </p>
                <p className="text-[10px] text-muted-foreground uppercase">Humid</p>
              </div>
            </div>
          </div>
        </div>

        {/* Section B: Personal Sensitivity Badge */}
        {hasLogs && (
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${sensitivityConfig[sensitivity.level].className}`}
            >
              {sensitivityConfig[sensitivity.level].label}
            </span>
            {sensitivity.significant && sensitivity.strongestR != null && (
              <span className="text-[10px] text-muted-foreground">
                {sensitivity.strongestPair} r={sensitivity.strongestR.toFixed(2)}
              </span>
            )}
          </div>
        )}

        {/* Section C: Historical Pattern Match */}
        {pattern && hasLogs && (
          <div className="rounded-xl bg-muted/20 p-3">
            <div className="flex items-start gap-2">
              <div className="h-5 w-5 rounded-md bg-violet-500/10 flex items-center justify-center mt-0.5 shrink-0">
                <ClockCountdownIcon className="h-3 w-3 text-violet-500" weight="duotone" />
              </div>
              <div>
                <p className="text-xs text-foreground">
                  On <span className="font-semibold">{pattern.matchCount}</span> similar weather days, your avg pain was{" "}
                  <span className="font-semibold">{pattern.avgPain.toFixed(1)}/10</span>
                </p>
                {pattern.flareRate != null && (
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Flare rate: {(pattern.flareRate * 100).toFixed(0)}% of matched days
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Section D: Enhanced Sparkline */}
        {sparklineData.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                7-day pressure & pain
              </p>
              <div className="flex gap-2">
                <div className="flex items-center gap-1">
                  <div className="h-1.5 w-4 rounded-full bg-gradient-to-r from-indigo-400 to-cyan-400" />
                  <span className="text-[9px] text-muted-foreground">Pressure</span>
                </div>
                {hasLogs && (
                  <div className="flex items-center gap-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                    <span className="text-[9px] text-muted-foreground">Pain</span>
                  </div>
                )}
              </div>
            </div>
            <div className="h-20 rounded-lg bg-muted/20 p-1">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={sparklineData}>
                  <defs>
                    <linearGradient id="weather-pressure-line" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" hide />
                  <YAxis
                    yAxisId="pressure"
                    domain={["dataMin - 2", "dataMax + 2"]}
                    hide
                  />
                  <YAxis
                    yAxisId="pain"
                    orientation="right"
                    domain={[0, 10]}
                    hide
                  />
                  <Tooltip content={<SparklineTooltip />} />
                  <Line
                    yAxisId="pressure"
                    type="monotone"
                    dataKey="pressure"
                    stroke="url(#weather-pressure-line)"
                    strokeWidth={2}
                    dot={false}
                    name="Pressure"
                    connectNulls
                  />
                  {hasLogs && (
                    <Line
                      yAxisId="pain"
                      type="monotone"
                      dataKey="pain"
                      stroke="#fb7185"
                      strokeWidth={1.5}
                      strokeDasharray="4 2"
                      dot={{ r: 2.5, fill: "#fb7185", strokeWidth: 0 }}
                      name="Pain"
                      connectNulls
                    />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
