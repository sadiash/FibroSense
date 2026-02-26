"use client";

import { motion } from "framer-motion";
import { SymptomLog } from "@/lib/types";
import { format, parseISO } from "date-fns";
import { LightningIcon, CheckCircleIcon } from "@phosphor-icons/react";

interface FlareTimelineProps {
  logs: SymptomLog[];
}

function SeverityBadge({ severity }: { severity: number }) {
  const intensity =
    severity >= 8
      ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/20"
      : severity >= 5
        ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20"
        : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold border ${intensity}`}
    >
      {severity}/10
    </span>
  );
}

export function FlareTimeline({ logs }: FlareTimelineProps) {
  const flares = logs.filter((l) => l.is_flare).slice(0, 8);

  return (
    <motion.div
      className="rounded-2xl bg-card border border-border/50 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="p-5 pb-0">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-rose-500/10 flex items-center justify-center">
            <LightningIcon className="h-4 w-4 text-rose-500" weight="duotone" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Flare Events</h3>
            <p className="text-xs text-muted-foreground">Recent flare-ups</p>
          </div>
        </div>
      </div>

      <div className="p-5">
        {flares.length === 0 ? (
          <div className="text-center py-6">
            <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-2">
              <CheckCircleIcon className="h-5 w-5 text-emerald-500" weight="duotone" />
            </div>
            <p className="text-sm text-muted-foreground">No flare events recorded</p>
            <p className="text-xs text-muted-foreground mt-0.5">Keep tracking to identify patterns</p>
          </div>
        ) : (
          <div className="relative space-y-3">
            {/* Timeline line */}
            <div className="absolute left-[11px] top-3 bottom-3 w-px bg-gradient-to-b from-rose-500/30 via-rose-500/10 to-transparent" />

            {flares.map((flare, i) => (
              <motion.div
                key={flare.id}
                className="relative pl-8 group"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                {/* Dot with pulse */}
                <div className="absolute left-1 top-1.5">
                  <div className="h-[10px] w-[10px] rounded-full bg-rose-500 ring-2 ring-rose-500/20" />
                  {i === 0 && (
                    <div className="absolute inset-0 h-[10px] w-[10px] rounded-full bg-rose-500 animate-ping opacity-30" />
                  )}
                </div>

                <div className="rounded-xl p-2.5 bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium">
                      {format(parseISO(flare.date), "MMM d, yyyy")}
                    </p>
                    <div className="flex gap-1.5">
                      <SeverityBadge severity={flare.flare_severity ?? 0} />
                    </div>
                  </div>
                  {flare.notes && (
                    <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
                      {flare.notes}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
