"use client";

import { motion } from "framer-motion";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis,
} from "recharts";

interface ScatterPlotProps {
  metricA: string;
  metricB: string;
  data: Array<{ x: number; y: number }>;
  correlation?: number;
}

const metricLabels: Record<string, string> = {
  pain_severity: "Pain",
  fatigue_severity: "Fatigue",
  brain_fog: "Brain Fog",
  mood: "Mood",
  sleep_duration: "Sleep (hrs)",
  sleep_efficiency: "Sleep Eff. (%)",
  hrv_rmssd: "HRV (ms)",
  resting_hr: "Resting HR",
  barometric_pressure: "Pressure (hPa)",
  temperature: "Temp (\u00B0C)",
  humidity: "Humidity (%)",
};

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { x: number; y: number } }> }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="glass-strong rounded-lg p-2.5 shadow-lg border border-border/50">
      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs">
        <span className="text-muted-foreground">X:</span>
        <span className="font-medium tabular-nums">{d.x}</span>
        <span className="text-muted-foreground">Y:</span>
        <span className="font-medium tabular-nums">{d.y}</span>
      </div>
    </div>
  );
}

export function ScatterPlot({ metricA, metricB, data, correlation }: ScatterPlotProps) {
  if (!metricA || !metricB) {
    return null;
  }

  const labelA = metricLabels[metricA] ?? metricA;
  const labelB = metricLabels[metricB] ?? metricB;
  const dotColor =
    correlation !== undefined
      ? correlation > 0
        ? "#10b981"
        : "#f43f5e"
      : "#8b5cf6";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring" as const, stiffness: 300, damping: 24 }}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="text-xs font-semibold">
            {labelA} vs {labelB}
          </h4>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {data.length} data points
          </p>
        </div>
        {correlation !== undefined && (
          <div
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold border ${
              correlation > 0
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
            }`}
          >
            r = {correlation.toFixed(3)}
          </div>
        )}
      </div>

      {data.length === 0 ? (
        <div className="h-52 rounded-xl bg-muted/20 flex items-center justify-center">
          <p className="text-xs text-muted-foreground">No overlapping data</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={180} className="sm:!h-[220px]">
          <ScatterChart margin={{ top: 8, right: 8, bottom: 4, left: -12 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              strokeOpacity={0.5}
            />
            <XAxis
              dataKey="x"
              name={labelA}
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
              label={{
                value: labelA,
                position: "insideBottom",
                offset: 0,
                style: {
                  fontSize: 9,
                  fill: "hsl(var(--muted-foreground))",
                },
              }}
            />
            <YAxis
              dataKey="y"
              name={labelB}
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
              label={{
                value: labelB,
                angle: -90,
                position: "insideLeft",
                offset: 20,
                style: {
                  fontSize: 9,
                  fill: "hsl(var(--muted-foreground))",
                },
              }}
            />
            <ZAxis range={[30, 30]} />
            <Tooltip content={<CustomTooltip />} />
            <Scatter data={data} fill={dotColor} fillOpacity={0.6} />
          </ScatterChart>
        </ResponsiveContainer>
      )}
    </motion.div>
  );
}
