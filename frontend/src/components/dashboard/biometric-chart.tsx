"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Legend,
  ResponsiveContainer,
} from "recharts";

interface BiometricChartProps {
  biometrics: BiometricReading[];
  isLoading?: boolean;
}

export function BiometricChart({ biometrics, isLoading }: BiometricChartProps) {
  if (isLoading) return <ChartSkeleton />;
  if (!biometrics.length)
    return (
      <EmptyState
        title="No biometric data"
        description="Sync your Oura Ring to see biometrics"
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
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Sleep & HRV</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis
              yAxisId="left"
              label={{ value: "Hours", angle: -90, position: "insideLeft", style: { fontSize: 12 } }}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              label={{ value: "HRV (ms)", angle: 90, position: "insideRight", style: { fontSize: 12 } }}
              tick={{ fontSize: 12 }}
            />
            <Tooltip />
            <Legend />
            <Bar
              yAxisId="left"
              dataKey="Sleep"
              fill="hsl(220, 70%, 55%)"
              opacity={0.7}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="HRV"
              stroke="hsl(150, 60%, 45%)"
              strokeWidth={2}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
