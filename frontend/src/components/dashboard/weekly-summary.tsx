"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { subDays, parseISO, isWithinInterval, format, startOfWeek, endOfWeek } from "date-fns";
import { SymptomLog, BiometricReading } from "@/lib/types";
import { CalendarCheckIcon } from "@phosphor-icons/react";

interface WeeklySummaryProps {
  logs: SymptomLog[];
  biometrics: BiometricReading[];
  isLoading?: boolean;
}

interface WeekStats {
  avgPain: number;
  avgFatigue: number;
  avgSleep: number | null;
  avgHrv: number | null;
  flareCount: number;
  bestDay: { date: string; score: number } | null;
  worstDay: { date: string; score: number } | null;
  dayCount: number;
}

function computeWeekStats(
  logs: SymptomLog[],
  biometrics: BiometricReading[],
  start: Date,
  end: Date
): WeekStats {
  const weekLogs = logs.filter((l) =>
    isWithinInterval(parseISO(l.date), { start, end })
  );
  const weekBio = biometrics.filter((b) =>
    isWithinInterval(parseISO(b.date), { start, end })
  );

  if (weekLogs.length === 0) {
    return { avgPain: 0, avgFatigue: 0, avgSleep: null, avgHrv: null, flareCount: 0, bestDay: null, worstDay: null, dayCount: 0 };
  }

  const avgPain = weekLogs.reduce((s, l) => s + l.pain_severity, 0) / weekLogs.length;
  const avgFatigue = weekLogs.reduce((s, l) => s + l.fatigue_severity, 0) / weekLogs.length;
  const avgSleep = weekBio.length > 0
    ? weekBio.reduce((s, b) => s + b.sleep_duration, 0) / weekBio.length
    : null;
  const avgHrv = weekBio.length > 0
    ? weekBio.reduce((s, b) => s + b.hrv_rmssd, 0) / weekBio.length
    : null;
  const flareCount = weekLogs.filter((l) => l.is_flare).length;

  // Score: pain + fatigue - mood (lower = better)
  const scored = weekLogs.map((l) => ({
    date: l.date,
    score: l.pain_severity + l.fatigue_severity - l.mood,
  }));
  scored.sort((a, b) => a.score - b.score);

  return {
    avgPain,
    avgFatigue,
    avgSleep,
    avgHrv,
    flareCount,
    bestDay: scored[0] ?? null,
    worstDay: scored[scored.length - 1] ?? null,
    dayCount: weekLogs.length,
  };
}

function ComparisonBar({
  label,
  thisWeek,
  lastWeek,
  max,
  higherIsBetter,
}: {
  label: string;
  thisWeek: number;
  lastWeek: number | null;
  max: number;
  higherIsBetter: boolean;
}) {
  const thisPct = Math.min((thisWeek / max) * 100, 100);
  const lastPct = lastWeek != null ? Math.min((lastWeek / max) * 100, 100) : 0;
  const delta = lastWeek != null ? thisWeek - lastWeek : null;
  const isGood = delta != null
    ? higherIsBetter ? delta > 0 : delta < 0
    : undefined;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium text-muted-foreground">{label}</span>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold tabular-nums">{thisWeek.toFixed(1)}</span>
          {delta != null && (
            <span className={`text-[9px] font-medium tabular-nums ${isGood ? "text-emerald-500" : "text-rose-500"}`}>
              {delta > 0 ? "+" : ""}{delta.toFixed(1)}
            </span>
          )}
        </div>
      </div>
      <div className="relative h-2 bg-muted/20 rounded-full overflow-hidden">
        {lastWeek != null && (
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-muted/30"
            style={{ width: `${lastPct}%` }}
          />
        )}
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-violet-500 to-purple-500"
          initial={{ width: 0 }}
          animate={{ width: `${thisPct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

export function WeeklySummary({ logs, biometrics, isLoading }: WeeklySummaryProps) {
  const { thisWeek, lastWeek, observations } = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const lastWeekStart = subDays(weekStart, 7);
    const lastWeekEnd = subDays(weekStart, 1);

    const tw = computeWeekStats(logs, biometrics, weekStart, weekEnd);
    const lw = computeWeekStats(logs, biometrics, lastWeekStart, lastWeekEnd);

    // Generate observations
    const obs: string[] = [];

    if (tw.dayCount > 0 && lw.dayCount > 0) {
      const painDelta = tw.avgPain - lw.avgPain;
      if (Math.abs(painDelta) >= 0.5) {
        obs.push(
          painDelta > 0
            ? `Pain is up ${painDelta.toFixed(1)} pts from last week`
            : `Pain improved by ${Math.abs(painDelta).toFixed(1)} pts vs last week`
        );
      }

      if (tw.flareCount > 0) {
        obs.push(
          `${tw.flareCount} flare${tw.flareCount > 1 ? "s" : ""} this week${
            lw.flareCount > 0 ? ` (${lw.flareCount} last week)` : ""
          }`
        );
      } else if (lw.flareCount > 0) {
        obs.push("No flares this week — an improvement!");
      }

      if (tw.avgSleep != null && lw.avgSleep != null) {
        const sleepDelta = tw.avgSleep - lw.avgSleep;
        if (Math.abs(sleepDelta) >= 0.3) {
          obs.push(
            sleepDelta > 0
              ? `Getting ${sleepDelta.toFixed(1)}h more sleep on average`
              : `Sleep decreased by ${Math.abs(sleepDelta).toFixed(1)}h — consider earlier bedtime`
          );
        }
      }
    } else if (tw.dayCount > 0) {
      if (tw.flareCount > 0) {
        obs.push(`${tw.flareCount} flare${tw.flareCount > 1 ? "s" : ""} recorded this week`);
      }
      if (tw.avgPain <= 3) {
        obs.push("Pain levels are looking manageable this week");
      }
    }

    return { thisWeek: tw, lastWeek: lw.dayCount > 0 ? lw : null, observations: obs };
  }, [logs, biometrics]);

  if (isLoading) return null;

  if (thisWeek.dayCount < 1) {
    return (
      <div className="rounded-2xl bg-card border border-border/50 overflow-hidden">
        <div className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-8 w-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
              <CalendarCheckIcon className="h-4 w-4 text-violet-500" weight="duotone" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Your Week at a Glance</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Weekly reflection</p>
            </div>
          </div>
          <div className="rounded-xl bg-muted/20 p-4 text-center">
            <p className="text-xs text-muted-foreground">
              Keep logging! Your first weekly summary appears after you log this week.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="rounded-2xl bg-card border border-border/50 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="p-5 pb-0">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
            <CalendarCheckIcon className="h-4 w-4 text-violet-500" weight="duotone" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Your Week at a Glance</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {thisWeek.dayCount} day{thisWeek.dayCount !== 1 ? "s" : ""} logged
              {lastWeek ? " — comparing to last week" : ""}
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Comparison bars */}
        <div className="space-y-3">
          <ComparisonBar
            label="Pain"
            thisWeek={thisWeek.avgPain}
            lastWeek={lastWeek?.avgPain ?? null}
            max={10}
            higherIsBetter={false}
          />
          <ComparisonBar
            label="Fatigue"
            thisWeek={thisWeek.avgFatigue}
            lastWeek={lastWeek?.avgFatigue ?? null}
            max={10}
            higherIsBetter={false}
          />
          {thisWeek.avgSleep != null && (
            <ComparisonBar
              label="Sleep"
              thisWeek={thisWeek.avgSleep}
              lastWeek={lastWeek?.avgSleep ?? null}
              max={12}
              higherIsBetter={true}
            />
          )}
          {thisWeek.avgHrv != null && (
            <ComparisonBar
              label="HRV"
              thisWeek={thisWeek.avgHrv}
              lastWeek={lastWeek?.avgHrv ?? null}
              max={Math.max(thisWeek.avgHrv, lastWeek?.avgHrv ?? 0, 80)}
              higherIsBetter={true}
            />
          )}
        </div>

        {/* Best & Worst day */}
        {(thisWeek.bestDay || thisWeek.worstDay) && thisWeek.dayCount >= 2 && (
          <div className="flex gap-3">
            {thisWeek.bestDay && (
              <div className="flex-1 rounded-lg bg-emerald-500/5 border border-emerald-500/15 p-2.5">
                <div className="flex items-center gap-1 mb-0.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    Best Day
                  </span>
                </div>
                <span className="text-xs font-medium">
                  {format(parseISO(thisWeek.bestDay.date), "EEEE, MMM d")}
                </span>
              </div>
            )}
            {thisWeek.worstDay && thisWeek.bestDay?.date !== thisWeek.worstDay?.date && (
              <div className="flex-1 rounded-lg bg-rose-500/5 border border-rose-500/15 p-2.5">
                <div className="flex items-center gap-1 mb-0.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                  <span className="text-[9px] font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                    Worst Day
                  </span>
                </div>
                <span className="text-xs font-medium">
                  {format(parseISO(thisWeek.worstDay.date), "EEEE, MMM d")}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Observations */}
        {observations.length > 0 && (
          <div className="space-y-1.5 pt-1 border-t border-border/30">
            {observations.map((obs, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="h-1 w-1 rounded-full bg-violet-400 mt-1.5 shrink-0" />
                <p className="text-[11px] text-muted-foreground leading-relaxed">{obs}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
