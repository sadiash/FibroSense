"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CorrelationResult } from "@/lib/types";
import { ChartSkeleton } from "@/components/shared/loading-skeleton";
import { cn } from "@/lib/utils";
import { GridFourIcon } from "@phosphor-icons/react";

interface CorrelationHeatmapProps {
  correlations: CorrelationResult[];
  onCellClick?: (metricA: string, metricB: string) => void;
  selectedA?: string;
  selectedB?: string;
  isLoading?: boolean;
}

const metricLabels: Record<string, string> = {
  pain_severity: "Pain",
  fatigue_severity: "Fatigue",
  brain_fog: "Brain Fog",
  mood: "Mood",
  sleep_duration: "Sleep",
  sleep_efficiency: "Sleep Eff.",
  hrv_rmssd: "HRV",
  resting_hr: "Rest. HR",
  barometric_pressure: "Pressure",
  temperature: "Temp",
  humidity: "Humidity",
};

const metricCategories: Record<string, string> = {
  pain_severity: "symptoms",
  fatigue_severity: "symptoms",
  brain_fog: "symptoms",
  mood: "symptoms",
  sleep_duration: "biometrics",
  sleep_efficiency: "biometrics",
  hrv_rmssd: "biometrics",
  resting_hr: "biometrics",
  barometric_pressure: "weather",
  temperature: "weather",
  humidity: "weather",
};

const categoryDotColors: Record<string, string> = {
  symptoms: "bg-rose-500",
  biometrics: "bg-violet-500",
  weather: "bg-sky-500",
};

function cellBg(val: number): string {
  const abs = Math.abs(val);
  if (abs < 0.1) return "bg-muted/20";
  if (val > 0) {
    if (abs > 0.6) return "bg-emerald-500 text-white";
    if (abs > 0.4) return "bg-emerald-500/50";
    if (abs > 0.2) return "bg-emerald-500/25";
    return "bg-emerald-500/10";
  }
  if (abs > 0.6) return "bg-rose-500 text-white";
  if (abs > 0.4) return "bg-rose-500/50";
  if (abs > 0.2) return "bg-rose-500/25";
  return "bg-rose-500/10";
}

// Fixed metric ordering so it's always consistent
const METRIC_ORDER = [
  "pain_severity",
  "fatigue_severity",
  "brain_fog",
  "mood",
  "sleep_duration",
  "sleep_efficiency",
  "hrv_rmssd",
  "resting_hr",
  "barometric_pressure",
  "temperature",
  "humidity",
];

export function CorrelationHeatmap({
  correlations,
  onCellClick,
  selectedA,
  selectedB,
  isLoading,
}: CorrelationHeatmapProps) {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [hoveredCol, setHoveredCol] = useState<string | null>(null);

  const [hoveredData, setHoveredData] = useState<{ val: number; pValue: number; sampleSize: number; x: number; y: number } | null>(null);

  const { metrics, corrMap, fullCorrMap } = useMemo(() => {
    const available = new Set(
      correlations.flatMap((c) => [c.metric_a, c.metric_b])
    );
    const m = METRIC_ORDER.filter((k) => available.has(k));
    const map = new Map<string, number>();
    const fullMap = new Map<string, CorrelationResult>();
    correlations.forEach((c) => {
      map.set(`${c.metric_a}-${c.metric_b}`, c.correlation_coefficient);
      map.set(`${c.metric_b}-${c.metric_a}`, c.correlation_coefficient);
      fullMap.set(`${c.metric_a}-${c.metric_b}`, c);
      fullMap.set(`${c.metric_b}-${c.metric_a}`, c);
    });
    return { metrics: m, corrMap: map, fullCorrMap: fullMap };
  }, [correlations]);

  if (isLoading) return <ChartSkeleton />;

  if (!correlations.length) {
    return (
      <div className="rounded-2xl bg-card border border-border/50 p-8 text-center">
        <p className="text-sm text-muted-foreground">
          No correlation data yet. Log more symptoms to discover patterns.
        </p>
      </div>
    );
  }

  // Group metrics by category for section headers
  let lastCategory = "";

  return (
    <div className="rounded-2xl bg-card border border-border/50 overflow-hidden">
      <div className="p-4 sm:p-5 pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2 sm:gap-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <GridFourIcon className="h-4 w-4 text-indigo-500" weight="duotone" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Correlation Matrix</h3>
              <p className="text-xs text-muted-foreground">
                Click any cell to explore in detail
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-6 rounded-sm bg-emerald-500/50" />
              <span className="text-[10px] text-muted-foreground">Positive</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-6 rounded-sm bg-muted/30" />
              <span className="text-[10px] text-muted-foreground">None</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-6 rounded-sm bg-rose-500/50" />
              <span className="text-[10px] text-muted-foreground">Negative</span>
            </div>
          </div>
        </div>
      </div>

      <div className="pb-5 overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-5">
        <table className="w-full border-collapse min-w-[400px]">
          <thead>
            <tr>
              <th className="w-20 sm:w-28" />
              {metrics.map((col) => {
                const cat = metricCategories[col] ?? "symptoms";
                return (
                  <th
                    key={col}
                    className={cn(
                      "text-center pb-1.5 px-0.5 transition-opacity",
                      hoveredCol && hoveredCol !== col && "opacity-40"
                    )}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <div
                        className={cn(
                          "h-1 w-3 rounded-full",
                          categoryDotColors[cat]
                        )}
                      />
                      <span className="text-[8px] sm:text-[9px] text-muted-foreground font-medium leading-tight block max-w-[36px] sm:max-w-[44px]">
                        {metricLabels[col] ?? col}
                      </span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {metrics.map((row) => {
              const cat = metricCategories[row] ?? "symptoms";
              const showSeparator = cat !== lastCategory && lastCategory !== "";
              lastCategory = cat;

              return (
                <tr
                  key={row}
                  className={cn(
                    "group",
                    hoveredRow && hoveredRow !== row && "opacity-40",
                    showSeparator && "border-t border-border/30"
                  )}
                  style={{ transition: "opacity 0.15s ease" }}
                >
                  <td
                    className="pr-2 py-0.5"
                    onMouseEnter={() => setHoveredRow(row)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    <div className="flex items-center gap-1.5 justify-end">
                      <span className="text-[10px] text-muted-foreground font-medium text-right truncate">
                        {metricLabels[row] ?? row}
                      </span>
                      <div
                        className={cn(
                          "h-1.5 w-1.5 rounded-full shrink-0",
                          categoryDotColors[cat]
                        )}
                      />
                    </div>
                  </td>
                  {metrics.map((col) => {
                    const isDiag = row === col;
                    const val = isDiag ? 1 : (corrMap.get(`${row}-${col}`) ?? 0);
                    const isSelected =
                      (selectedA === row && selectedB === col) ||
                      (selectedA === col && selectedB === row);

                    return (
                      <td
                        key={col}
                        className="p-0.5 relative"
                        onMouseEnter={(e) => {
                          setHoveredRow(row);
                          setHoveredCol(col);
                          if (!isDiag) {
                            const fullCorr = fullCorrMap.get(`${row}-${col}`);
                            if (fullCorr) {
                              const rect = e.currentTarget.getBoundingClientRect();
                              setHoveredData({
                                val,
                                pValue: fullCorr.p_value,
                                sampleSize: fullCorr.sample_size,
                                x: rect.left + rect.width / 2,
                                y: rect.top,
                              });
                            }
                          }
                        }}
                        onMouseLeave={() => {
                          setHoveredRow(null);
                          setHoveredCol(null);
                          setHoveredData(null);
                        }}
                      >
                        {isDiag ? (
                          <div className="h-7 sm:h-9 rounded-md bg-muted/10 flex items-center justify-center">
                            <span className="text-[8px] sm:text-[9px] text-muted-foreground/30">
                              1.0
                            </span>
                          </div>
                        ) : (
                          <motion.button
                            className={cn(
                              "w-full h-7 sm:h-9 rounded-md flex items-center justify-center text-[9px] sm:text-[10px] font-mono font-semibold transition-all cursor-pointer",
                              cellBg(val),
                              isSelected
                                ? "ring-2 ring-primary ring-offset-1 ring-offset-card shadow-md"
                                : "hover:ring-1 hover:ring-primary/30"
                            )}
                            onClick={() => onCellClick?.(row, col)}
                            whileTap={{ scale: 0.92 }}
                          >
                            {val.toFixed(2)}
                          </motion.button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Hover tooltip */}
        {hoveredData && hoveredRow && hoveredCol && (
          <div
            className="fixed z-50 pointer-events-none glass-strong rounded-lg p-2 shadow-lg border border-border/50"
            style={{
              left: hoveredData.x,
              top: hoveredData.y - 8,
              transform: "translate(-50%, -100%)",
            }}
          >
            <div className="text-[10px] space-y-0.5">
              <div className="font-medium">
                {metricLabels[hoveredRow] ?? hoveredRow} &harr; {metricLabels[hoveredCol] ?? hoveredCol}
              </div>
              <div className="flex gap-2 text-muted-foreground">
                <span>r={hoveredData.val.toFixed(3)}</span>
                <span className={hoveredData.pValue < 0.05 ? "text-emerald-500" : ""}>
                  p={hoveredData.pValue.toFixed(3)}
                </span>
                <span>n={hoveredData.sampleSize}</span>
              </div>
            </div>
          </div>
        )}

        {/* Category legend */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/30">
          {[
            { key: "symptoms", label: "Symptoms" },
            { key: "biometrics", label: "Biometrics" },
            { key: "weather", label: "Weather" },
          ].map((c) => (
            <div key={c.key} className="flex items-center gap-1.5">
              <div
                className={cn(
                  "h-2 w-2 rounded-full",
                  categoryDotColors[c.key]
                )}
              />
              <span className="text-[10px] text-muted-foreground">
                {c.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
