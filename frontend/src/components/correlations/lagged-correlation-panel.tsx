"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { MetricSelector } from "./metric-selector";
import { useLaggedCorrelations } from "@/lib/hooks/use-correlations";
import { ChartSkeleton } from "@/components/shared/loading-skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

export function LaggedCorrelationPanel() {
  const [metricA, setMetricA] = useState("pain_severity");
  const [metricB, setMetricB] = useState("sleep_duration");
  const [maxLag, setMaxLag] = useState(7);

  const { data: lagged, isLoading } = useLaggedCorrelations(
    metricA,
    metricB,
    maxLag
  );

  const chartData =
    lagged?.map((c) => ({
      lag: `${c.lag_days}d`,
      correlation: c.correlation_coefficient,
    })) ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Lagged Correlation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <MetricSelector value={metricA} onChange={setMetricA} label="Metric A" />
          <MetricSelector value={metricB} onChange={setMetricB} label="Metric B" />
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">
            Max Lag: {maxLag} days
          </Label>
          <Slider
            value={[maxLag]}
            onValueChange={([v]) => setMaxLag(v)}
            min={1}
            max={14}
            step={1}
          />
        </div>

        {isLoading ? (
          <ChartSkeleton />
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="lag" tick={{ fontSize: 12 }} />
              <YAxis domain={[-1, 1]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" />
              <Bar
                dataKey="correlation"
                fill="hsl(220, 70%, 55%)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
