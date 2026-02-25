"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContextualData } from "@/lib/types";
import { CardSkeleton } from "@/components/shared/loading-skeleton";
import {
  LineChart,
  Line,
  YAxis,
  ResponsiveContainer,
} from "recharts";

interface WeatherCardProps {
  data: ContextualData[];
  isLoading?: boolean;
}

export function WeatherCard({ data, isLoading }: WeatherCardProps) {
  if (isLoading) return <CardSkeleton />;

  const latest = data[0];
  const sparkline = [...data]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-7)
    .map((d) => ({ pressure: d.barometric_pressure }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Weather</CardTitle>
      </CardHeader>
      <CardContent>
        {latest ? (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-xs text-muted-foreground">Pressure</p>
                <p className="text-lg font-bold">
                  {latest.barometric_pressure?.toFixed(0)}
                </p>
                <p className="text-xs text-muted-foreground">hPa</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Temp</p>
                <p className="text-lg font-bold">
                  {latest.temperature?.toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">&deg;C</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Humidity</p>
                <p className="text-lg font-bold">
                  {latest.humidity?.toFixed(0)}
                </p>
                <p className="text-xs text-muted-foreground">%</p>
              </div>
            </div>
            <div className="h-12">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparkline}>
                  <YAxis domain={["dataMin - 2", "dataMax + 2"]} hide />
                  <Line
                    type="monotone"
                    dataKey="pressure"
                    stroke="hsl(220, 70%, 55%)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-center text-muted-foreground">
              7-day pressure trend
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No weather data</p>
        )}
      </CardContent>
    </Card>
  );
}
