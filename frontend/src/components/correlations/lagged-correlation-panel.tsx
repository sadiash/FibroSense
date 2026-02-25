"use client";

import { motion } from "framer-motion";
import { useLaggedCorrelations } from "@/lib/hooks/use-correlations";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";

interface LaggedCorrelationPanelProps {
  initialA?: string;
  initialB?: string;
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;
  return (
    <div className="glass-strong rounded-lg p-2.5 shadow-lg border border-border/50">
      <p className="text-[10px] text-muted-foreground">Lag: {label}</p>
      <p className="text-xs font-bold mt-0.5">r = {val.toFixed(3)}</p>
      <p className="text-[9px] text-muted-foreground mt-0.5">
        {Math.abs(val) > 0.6
          ? "Strong"
          : Math.abs(val) > 0.3
            ? "Moderate"
            : "Weak"}{" "}
        correlation
      </p>
    </div>
  );
}

export function LaggedCorrelationPanel({
  initialA = "pain_severity",
  initialB = "sleep_duration",
}: LaggedCorrelationPanelProps) {
  const metricA = initialA;
  const metricB = initialB;

  const { data: lagged, isLoading } = useLaggedCorrelations(
    metricA,
    metricB,
    7
  );

  const chartData =
    lagged?.map((c) => ({
      lag: `${c.lag_days}d`,
      correlation: c.correlation_coefficient,
    })) ?? [];

  const strongest = chartData.reduce(
    (best, d) =>
      Math.abs(d.correlation) > Math.abs(best.correlation) ? d : best,
    { lag: "0d", correlation: 0 }
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring" as const, stiffness: 300, damping: 24 }}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="text-xs font-semibold">Lagged Correlation</h4>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Does one metric predict the other days later?
          </p>
        </div>
        {strongest.correlation !== 0 && (
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground">Strongest at</p>
            <p className="text-xs font-bold">
              {strongest.lag} (r={strongest.correlation.toFixed(2)})
            </p>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="h-40 shimmer rounded-xl" />
      ) : chartData.length === 0 ? (
        <div className="h-40 rounded-xl bg-muted/20 flex items-center justify-center">
          <p className="text-xs text-muted-foreground">
            Not enough data for lagged analysis
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={160} className="sm:!h-[180px]">
          <BarChart
            data={chartData}
            margin={{ top: 4, right: 4, bottom: 4, left: -16 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              strokeOpacity={0.5}
              vertical={false}
            />
            <XAxis
              dataKey="lag"
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[-1, 1]}
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
              ticks={[-1, -0.5, 0, 0.5, 1]}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={0}
              stroke="hsl(var(--muted-foreground))"
              strokeOpacity={0.3}
            />
            <Bar dataKey="correlation" radius={[4, 4, 0, 0]} maxBarSize={24}>
              {chartData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={
                    entry.correlation >= 0
                      ? "hsl(160, 60%, 45%)"
                      : "hsl(350, 70%, 55%)"
                  }
                  fillOpacity={
                    entry.lag === strongest.lag ? 1 : 0.5
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </motion.div>
  );
}
