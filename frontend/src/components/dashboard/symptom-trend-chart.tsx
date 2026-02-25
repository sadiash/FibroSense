"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SymptomLog } from "@/lib/types";
import { ChartSkeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { DateRangePicker } from "@/components/shared/date-range-picker";
import { subDays, parseISO, isWithinInterval } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface SymptomTrendChartProps {
  logs: SymptomLog[];
  isLoading?: boolean;
}

export function SymptomTrendChart({ logs, isLoading }: SymptomTrendChartProps) {
  const [startDate, setStartDate] = useState(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState(new Date());

  if (isLoading) return <ChartSkeleton />;
  if (!logs.length)
    return <EmptyState title="No symptom data" description="Log symptoms to see trends" />;

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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Symptom Trends</CardTitle>
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onRangeChange={(s, e) => {
            setStartDate(s);
            setEndDate(e);
          }}
        />
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="Pain"
              stroke="hsl(0, 80%, 60%)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="Fatigue"
              stroke="hsl(30, 80%, 55%)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="Brain Fog"
              stroke="hsl(220, 70%, 55%)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="Mood"
              stroke="hsl(150, 60%, 45%)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
