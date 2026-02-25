"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { SymptomLog } from "@/lib/types";
import { ChartSkeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { DateRangePicker } from "@/components/shared/date-range-picker";
import { subDays, parseISO, isWithinInterval } from "date-fns";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface SymptomTrendChartProps {
  logs: SymptomLog[];
  isLoading?: boolean;
}

const metrics = [
  { key: "Pain", color: "#f43f5e", gradient: "pain" },
  { key: "Fatigue", color: "#f97316", gradient: "fatigue" },
  { key: "Brain Fog", color: "#6366f1", gradient: "fog" },
  { key: "Mood", color: "#10b981", gradient: "mood" },
];

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-xl p-3 shadow-lg border border-border/50">
      <p className="text-xs font-medium text-muted-foreground mb-2">{label}</p>
      <div className="space-y-1">
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center gap-2">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs text-foreground">{entry.name}</span>
            <span className="text-xs font-bold ml-auto">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SymptomTrendChart({ logs, isLoading }: SymptomTrendChartProps) {
  const [startDate, setStartDate] = useState(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState(new Date());

  if (isLoading) return <ChartSkeleton />;
  if (!logs.length)
    return (
      <EmptyState
        title="No symptom data"
        description="Log symptoms to see trends"
        icon={
          <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        }
      />
    );

  const filtered = logs
    .filter((l) =>
      isWithinInterval(parseISO(l.date), { start: startDate, end: endDate })
    )
    .sort((a, b) => a.date.localeCompare(b.date));

  const data = filtered.map((l) => ({
    date: l.date,
    Pain: l.pain_severity,
    Fatigue: l.fatigue_severity,
    "Brain Fog": l.brain_fog,
    Mood: l.mood,
  }));

  return (
    <motion.div
      className="rounded-2xl bg-card border border-border/50 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 pb-0 gap-3">
        <div>
          <h3 className="text-sm font-semibold">Symptom Trends</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Track your symptoms over time
          </p>
        </div>
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onRangeChange={(s, e) => {
            setStartDate(s);
            setEndDate(e);
          }}
        />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 px-5 pt-3">
        {metrics.map((m) => (
          <div key={m.key} className="flex items-center gap-1.5">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: m.color }}
            />
            <span className="text-[11px] text-muted-foreground">{m.key}</span>
          </div>
        ))}
      </div>

      <div className="p-3 sm:p-5 pt-3">
        <ResponsiveContainer width="100%" height={220} className="sm:!h-[280px]">
          <AreaChart data={data}>
            <defs>
              {metrics.map((m) => (
                <linearGradient key={m.gradient} id={`grad-${m.gradient}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={m.color} stopOpacity={0.2} />
                  <stop offset="100%" stopColor={m.color} stopOpacity={0} />
                </linearGradient>
              ))}
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
              domain={[0, 10]}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
              tickMargin={8}
            />
            <Tooltip content={<CustomTooltip />} />
            {metrics.map((m) => (
              <Area
                key={m.key}
                type="monotone"
                dataKey={m.key}
                stroke={m.color}
                strokeWidth={2}
                fill={`url(#grad-${m.gradient})`}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2, fill: "hsl(var(--card))" }}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
