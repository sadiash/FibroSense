"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ScatterPlotProps {
  metricA: string;
  metricB: string;
  data: Array<{ x: number; y: number }>;
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
  temperature: "Temp (C)",
  humidity: "Humidity (%)",
};

export function ScatterPlot({ metricA, metricB, data }: ScatterPlotProps) {
  if (!metricA || !metricB) {
    return (
      <EmptyState
        title="Select a cell"
        description="Click a cell in the heatmap to view the scatter plot"
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {metricLabels[metricA] || metricA} vs{" "}
          {metricLabels[metricB] || metricB}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="x"
              name={metricLabels[metricA] || metricA}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              dataKey="y"
              name={metricLabels[metricB] || metricB}
              tick={{ fontSize: 12 }}
            />
            <Tooltip cursor={{ strokeDasharray: "3 3" }} />
            <Scatter data={data} fill="hsl(220, 70%, 55%)" />
          </ScatterChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
