"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      />
    );

  const selectedKeys = Object.keys(frequencyMap);

  const sortedRegions = Object.entries(frequencyMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  const noop = () => {};

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Pain Location Heatmap</CardTitle>
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
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex gap-4 flex-1 min-w-0">
            <div className="flex-1 min-w-0 text-center">
              <p className="text-xs font-medium text-muted-foreground mb-1">Front</p>
              <BodyMapSvg
                view="front"
                selected={selectedKeys}
                severityMap={normalizedMap}
                onToggle={noop}
              />
            </div>
            <div className="flex-1 min-w-0 text-center">
              <p className="text-xs font-medium text-muted-foreground mb-1">Back</p>
              <BodyMapSvg
                view="back"
                selected={selectedKeys}
                severityMap={normalizedMap}
                onToggle={noop}
              />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-muted-foreground mb-3">
              Most Affected Areas
            </h4>
            {sortedRegions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No locations logged in this period
              </p>
            ) : (
              <ul className="space-y-2" data-testid="heatmap-legend">
                {sortedRegions.map(([location, count]) => (
                  <li key={location} className="flex items-center gap-2 text-sm">
                    <span
                      className="inline-block h-3 w-3 rounded-full shrink-0"
                      style={{
                        backgroundColor: severityDotColor(
                          normalizedMap[location] ?? 1
                        ),
                      }}
                    />
                    <span className="truncate">
                      {PAIN_LOCATION_LABELS[location as PainLocation] ?? location}
                    </span>
                    <span className="ml-auto text-muted-foreground whitespace-nowrap">
                      {count}/{totalDays} days
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
