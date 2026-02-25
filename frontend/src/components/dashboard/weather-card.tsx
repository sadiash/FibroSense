"use client";

import { motion } from "framer-motion";
import { ContextualData } from "@/lib/types";
import { CardSkeleton } from "@/components/shared/loading-skeleton";
import { LineChart, Line, YAxis, ResponsiveContainer } from "recharts";

interface WeatherCardProps {
  data: ContextualData[];
  isLoading?: boolean;
}

function WeatherMetric({
  value,
  unit,
  icon,
  delay,
}: {
  value: string;
  unit: string;
  icon: React.ReactNode;
  delay: number;
}) {
  return (
    <motion.div
      className="flex flex-col items-center p-2 sm:p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
    >
      <div className="text-muted-foreground mb-1">{icon}</div>
      <p className="text-base sm:text-lg font-bold">{value}</p>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
        {unit}
      </p>
    </motion.div>
  );
}

export function WeatherCard({ data, isLoading }: WeatherCardProps) {
  if (isLoading) return <CardSkeleton />;

  const latest = data[0];
  const sparkline = [...data]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-7)
    .map((d) => ({ pressure: d.barometric_pressure }));

  return (
    <motion.div
      className="rounded-2xl bg-card border border-border/50 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="p-5 pb-0">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-sky-500/10 flex items-center justify-center">
            <svg className="h-4 w-4 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Weather</h3>
            <p className="text-xs text-muted-foreground">Environmental factors</p>
          </div>
        </div>
      </div>

      <div className="p-5">
        {latest ? (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              <WeatherMetric
                value={latest.barometric_pressure?.toFixed(0) ?? "--"}
                unit="hPa"
                delay={0.1}
                icon={
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2v20M2 12h20" />
                    <circle cx="12" cy="12" r="4" />
                  </svg>
                }
              />
              <WeatherMetric
                value={latest.temperature?.toFixed(1) ?? "--"}
                unit={"\u00B0C"}
                delay={0.15}
                icon={
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 14.76V3.5a2.5 2.5 0 00-5 0v11.26a4.5 4.5 0 105 0z" />
                  </svg>
                }
              />
              <WeatherMetric
                value={latest.humidity?.toFixed(0) ?? "--"}
                unit="%"
                delay={0.2}
                icon={
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" />
                  </svg>
                }
              />
            </div>

            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
                7-day pressure trend
              </p>
              <div className="h-12 rounded-lg bg-muted/20 p-1">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sparkline}>
                    <defs>
                      <linearGradient id="pressure-line" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                    </defs>
                    <YAxis domain={["dataMin - 2", "dataMax + 2"]} hide />
                    <Line
                      type="monotone"
                      dataKey="pressure"
                      stroke="url(#pressure-line)"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No weather data available
          </p>
        )}
      </div>
    </motion.div>
  );
}
