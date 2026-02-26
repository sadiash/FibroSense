"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { subDays, parseISO, isWithinInterval } from "date-fns";
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { DateRangePicker } from "@/components/shared/date-range-picker";
import { SymptomLog, BiometricReading, ContextualData } from "@/lib/types";
import { ChartLineUpIcon } from "@phosphor-icons/react";

interface UnifiedTimelineProps {
  logs: SymptomLog[];
  biometrics: BiometricReading[];
  contextual: ContextualData[];
  isLoading?: boolean;
}

interface MetricConfig {
  key: string;
  label: string;
  color: string;
  category: "symptoms" | "biometrics" | "weather";
  yAxisId: "left" | "right";
}

const METRICS: MetricConfig[] = [
  { key: "pain_severity", label: "Pain", color: "#f43f5e", category: "symptoms", yAxisId: "left" },
  { key: "fatigue_severity", label: "Fatigue", color: "#f97316", category: "symptoms", yAxisId: "left" },
  { key: "brain_fog", label: "Brain Fog", color: "#6366f1", category: "symptoms", yAxisId: "left" },
  { key: "mood", label: "Mood", color: "#10b981", category: "symptoms", yAxisId: "left" },
  { key: "sleep_duration", label: "Sleep", color: "#818cf8", category: "biometrics", yAxisId: "right" },
  { key: "hrv_rmssd", label: "HRV", color: "#14b8a6", category: "biometrics", yAxisId: "right" },
  { key: "temperature", label: "Temp", color: "#f59e0b", category: "weather", yAxisId: "right" },
  { key: "humidity", label: "Humidity", color: "#38bdf8", category: "weather", yAxisId: "right" },
];

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-xl p-3 shadow-lg border border-border/50">
      <p className="text-xs font-medium text-muted-foreground mb-2">{label}</p>
      <div className="space-y-1">
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-xs text-foreground">{entry.name}</span>
            <span className="text-xs font-bold ml-auto tabular-nums">
              {typeof entry.value === "number" ? entry.value.toFixed(1) : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function UnifiedTimeline({ logs, biometrics, contextual, isLoading }: UnifiedTimelineProps) {
  const [selected, setSelected] = useState<string[]>(["pain_severity", "sleep_duration"]);
  const [startDate, setStartDate] = useState(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState(new Date());

  function toggleMetric(key: string) {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

  const data = useMemo(() => {
    const dateMap = new Map<string, Record<string, number>>();

    logs.forEach((l) => {
      if (!isWithinInterval(parseISO(l.date), { start: startDate, end: endDate })) return;
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
      if (!isWithinInterval(parseISO(b.date), { start: startDate, end: endDate })) return;
      const existing = dateMap.get(b.date) ?? {};
      dateMap.set(b.date, {
        ...existing,
        sleep_duration: b.sleep_duration,
        hrv_rmssd: b.hrv_rmssd,
      });
    });

    contextual.forEach((c) => {
      if (!isWithinInterval(parseISO(c.date), { start: startDate, end: endDate })) return;
      const existing = dateMap.get(c.date) ?? {};
      dateMap.set(c.date, {
        ...existing,
        ...(c.temperature != null ? { temperature: c.temperature } : {}),
        ...(c.humidity != null ? { humidity: c.humidity } : {}),
      });
    });

    return Array.from(dateMap.entries())
      .map(([date, values]) => ({ date, ...values }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [logs, biometrics, contextual, startDate, endDate]);

  const selectedMetrics = METRICS.filter((m) => selected.includes(m.key));
  const hasLeftAxis = selectedMetrics.some((m) => m.yAxisId === "left");
  const hasRightAxis = selectedMetrics.some((m) => m.yAxisId === "right");

  return (
    <motion.div
      className="rounded-2xl bg-card border border-border/50 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 pb-0 gap-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
            <ChartLineUpIcon className="h-4 w-4 text-violet-500" weight="duotone" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Unified Timeline</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Overlay multiple metrics on one axis
            </p>
          </div>
        </div>
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onRangeChange={(s, e) => { setStartDate(s); setEndDate(e); }}
        />
      </div>

      {/* Metric toggle pills */}
      <div className="flex flex-wrap gap-1.5 px-5 pt-3">
        {METRICS.map((m) => {
          const isActive = selected.includes(m.key);
          return (
            <button
              key={m.key}
              type="button"
              onClick={() => toggleMetric(m.key)}
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium border transition-all ${
                isActive
                  ? "border-current bg-current/10"
                  : "border-border/50 text-muted-foreground hover:border-border"
              }`}
              style={isActive ? { color: m.color } : undefined}
            >
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: isActive ? m.color : "currentColor", opacity: isActive ? 1 : 0.3 }}
              />
              {m.label}
            </button>
          );
        })}
      </div>

      <div className="p-3 sm:p-5 pt-3">
        {data.length === 0 ? (
          <div className="h-52 rounded-xl bg-muted/20 flex items-center justify-center">
            <p className="text-xs text-muted-foreground">No data in selected range</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220} className="sm:!h-[280px]">
            <ComposedChart data={data}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="hsl(var(--border))"
                strokeOpacity={0.5}
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                tickMargin={8}
              />
              {hasLeftAxis && (
                <YAxis
                  yAxisId="left"
                  domain={[0, 10]}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                  tickMargin={8}
                  label={{
                    value: "Symptoms (0-10)",
                    angle: -90,
                    position: "insideLeft",
                    offset: 15,
                    style: { fontSize: 9, fill: "hsl(var(--muted-foreground))" },
                  }}
                />
              )}
              {hasRightAxis && (
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                  tickMargin={8}
                  label={{
                    value: "Biometrics / Weather",
                    angle: 90,
                    position: "insideRight",
                    offset: 15,
                    style: { fontSize: 9, fill: "hsl(var(--muted-foreground))" },
                  }}
                />
              )}
              <Tooltip content={<CustomTooltip />} />
              {selectedMetrics.map((m) => (
                <Line
                  key={m.key}
                  yAxisId={m.yAxisId}
                  type="monotone"
                  dataKey={m.key}
                  name={m.label}
                  stroke={m.color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 2, fill: "hsl(var(--card))" }}
                  connectNulls
                />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
}
