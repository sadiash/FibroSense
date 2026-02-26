"use client";

import { motion } from "framer-motion";
import { BiometricReading } from "@/lib/types";
import { ChartSkeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { HeartbeatIcon } from "@phosphor-icons/react";

interface BiometricChartProps {
  biometrics: BiometricReading[];
  isLoading?: boolean;
  sleepBaseline?: number | null;
  hrvBaseline?: number | null;
}

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
            <span className="text-xs font-bold ml-auto">
              {entry.name === "Sleep" ? `${entry.value}h` : `${entry.value}ms`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BiometricChart({ biometrics, isLoading, sleepBaseline, hrvBaseline }: BiometricChartProps) {
  if (isLoading) return <ChartSkeleton />;
  if (!biometrics.length)
    return (
      <EmptyState
        title="No biometric data"
        description="Sync your Oura Ring to see biometrics"
        icon={<HeartbeatIcon className="h-10 w-10" weight="duotone" />}
      />
    );

  const data = [...biometrics]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30)
    .map((b) => ({
      date: b.date,
      Sleep: Math.round(b.sleep_duration * 10) / 10,
      HRV: Math.round(b.hrv_rmssd),
    }));

  return (
    <motion.div
      className="rounded-2xl bg-card border border-border/50 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="p-5 pb-0">
        <h3 className="text-sm font-semibold">Sleep & HRV</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Biometric trends from Oura Ring
        </p>
      </div>

      <div className="flex gap-3 px-5 pt-3">
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-6 rounded-full bg-gradient-to-r from-indigo-400 to-indigo-500" />
          <span className="text-[11px] text-muted-foreground">Sleep</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-[11px] text-muted-foreground">HRV</span>
        </div>
      </div>

      <div className="p-3 sm:p-5 pt-3">
        <ResponsiveContainer width="100%" height={200} className="sm:!h-[260px]">
          <ComposedChart data={data}>
            <defs>
              <linearGradient id="grad-sleep" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0.3} />
              </linearGradient>
            </defs>
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
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
              tickMargin={8}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
              tickMargin={8}
            />
            <Tooltip content={<CustomTooltip />} />
            {sleepBaseline != null && (
              <ReferenceLine
                yAxisId="left"
                y={Math.round(sleepBaseline * 10) / 10}
                stroke="#6366f1"
                strokeDasharray="4 4"
                strokeOpacity={0.5}
              />
            )}
            {hrvBaseline != null && (
              <ReferenceLine
                yAxisId="right"
                y={Math.round(hrvBaseline)}
                stroke="#10b981"
                strokeDasharray="4 4"
                strokeOpacity={0.5}
              />
            )}
            <Bar
              yAxisId="left"
              dataKey="Sleep"
              fill="url(#grad-sleep)"
              radius={[4, 4, 0, 0]}
              maxBarSize={12}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="HRV"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, fill: "hsl(var(--card))" }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
