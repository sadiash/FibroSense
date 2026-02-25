"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { SymptomLog, PAIN_LOCATION_LABELS, PainLocation } from "@/lib/types";
import { ChartSkeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { DateRangePicker } from "@/components/shared/date-range-picker";
import { BodyMapSvg } from "@/components/symptom-logger/body-map/body-map-svg";
import { subDays, parseISO, isWithinInterval } from "date-fns";

interface BodyMapHeatmapProps {
  logs: SymptomLog[];
  isLoading?: boolean;
}

function severityDotColor(severity: number): string {
  const t = (severity - 1) / 9;
  const hue = Math.round(60 - 60 * t);
  const opacity = 0.25 + 0.45 * t;
  return `hsla(${hue}, 80%, 50%, ${opacity})`;
}

function SeverityBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="h-1.5 flex-1 rounded-full bg-muted/50 overflow-hidden">
      <motion.div
        className="h-full rounded-full bg-gradient-to-r from-amber-400 to-rose-500"
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
      />
    </div>
  );
}

export function BodyMapHeatmap({ logs, isLoading }: BodyMapHeatmapProps) {
  const [startDate, setStartDate] = useState(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState(new Date());

  const filtered = useMemo(
    () =>
      logs.filter((l) =>
        isWithinInterval(parseISO(l.date), { start: startDate, end: endDate })
      ),
    [logs, startDate, endDate]
  );

  const { frequencyMap, normalizedMap, totalDays } = useMemo(() => {
    const freq: Record<string, number> = {};
    for (const log of filtered) {
      for (const loc of log.pain_locations) {
        freq[loc.location] = (freq[loc.location] ?? 0) + 1;
      }
    }

    const max = Math.max(0, ...Object.values(freq));
    const normalized: Record<string, number> = {};
    for (const [key, count] of Object.entries(freq)) {
      if (max > 0) {
        normalized[key] = Math.max(1, Math.round((count / max) * 10));
      }
    }

    const days = Math.round(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    return { frequencyMap: freq, normalizedMap: normalized, totalDays: days };
  }, [filtered, startDate, endDate]);

  if (isLoading) return <ChartSkeleton />;
  if (!logs.length)
    return (
      <EmptyState
        title="No pain location data"
        description="Log symptoms with body locations to see your heatmap"
        icon={
          <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a4 4 0 014 4v1a4 4 0 01-8 0V6a4 4 0 014-4zM6 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" />
          </svg>
        }
      />
    );

  const selectedKeys = Object.keys(frequencyMap);
  const maxFreq = Math.max(0, ...Object.values(frequencyMap));

  const sortedRegions = Object.entries(frequencyMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  const noop = () => {};

  return (
    <motion.div
      className="rounded-2xl bg-card border border-border/50 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 pb-0 gap-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
            <svg className="h-4 w-4 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a4 4 0 014 4v1a4 4 0 01-8 0V6a4 4 0 014-4zM6 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Pain Location Heatmap</h3>
            <p className="text-xs text-muted-foreground">
              Where you feel it most
            </p>
          </div>
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

      <div className="p-5">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex gap-4 flex-1 min-w-0">
            <div className="flex-1 min-w-0 text-center">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Front
              </p>
              <BodyMapSvg
                view="front"
                selected={selectedKeys}
                severityMap={normalizedMap}
                onToggle={noop}
              />
            </div>
            <div className="flex-1 min-w-0 text-center">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Back
              </p>
              <BodyMapSvg
                view="back"
                selected={selectedKeys}
                severityMap={normalizedMap}
                onToggle={noop}
              />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Most Affected Areas
            </h4>
            {sortedRegions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No locations logged in this period
              </p>
            ) : (
              <ul className="space-y-2.5" data-testid="heatmap-legend">
                {sortedRegions.map(([location, count], i) => (
                  <motion.li
                    key={location}
                    className="flex items-center gap-2.5"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
                      style={{
                        backgroundColor: severityDotColor(
                          normalizedMap[location] ?? 1
                        ),
                        boxShadow: `0 0 0 2px hsl(var(--card)), 0 0 0 3px ${severityDotColor(normalizedMap[location] ?? 1)}`,
                      }}
                    />
                    <span className="text-xs truncate flex-shrink min-w-0">
                      {PAIN_LOCATION_LABELS[location as PainLocation] ??
                        location}
                    </span>
                    <SeverityBar value={count} max={maxFreq} />
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap tabular-nums">
                      {count}/{totalDays}d
                    </span>
                  </motion.li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
