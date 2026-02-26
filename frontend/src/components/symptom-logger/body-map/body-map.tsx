"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import type { PainLocationEntry } from "@/lib/types";
import { BodyMapSvg } from "./body-map-svg";
import { PainLocationDetailCard } from "../pain-location-detail-card";
import { PainLocationChip } from "../pain-location-chip";
import {
  PersonIcon,
  CaretDownIcon,
} from "@phosphor-icons/react";

interface BodyMapProps {
  entries: PainLocationEntry[];
  onChange: (entries: PainLocationEntry[]) => void;
}

export function BodyMap({ entries, onChange }: BodyMapProps) {
  const [open, setOpen] = useState(false);
  const [activeLocation, setActiveLocation] = useState<string | null>(null);

  const selectedKeys = entries.map((e) => e.location);
  const hasPain = entries.length > 0;

  const effectiveActive =
    activeLocation !== null && selectedKeys.includes(activeLocation)
      ? activeLocation
      : null;

  const activeEntry = entries.find((e) => e.location === effectiveActive) ?? null;
  const activeIndex = entries.findIndex((e) => e.location === effectiveActive);
  const inactiveEntries = entries.filter((e) => e.location !== effectiveActive);

  function handleRegionClick(key: string) {
    if (selectedKeys.includes(key)) {
      if (key === effectiveActive) {
        onChange(entries.filter((e) => e.location !== key));
        setActiveLocation(null);
      } else {
        setActiveLocation(key);
      }
    } else if (key === "widespread") {
      onChange([{ location: "widespread", severity: 5, descriptors: [], note: null }]);
      setActiveLocation("widespread");
    } else {
      const withoutWidespread = entries.filter((e) => e.location !== "widespread");
      const newEntries = [
        ...withoutWidespread,
        { location: key, severity: 5, descriptors: [], note: null },
      ];
      onChange(newEntries);
      setActiveLocation(key);
    }
  }

  function updateEntry(index: number, updated: PainLocationEntry) {
    const next = [...entries];
    next[index] = updated;
    onChange(next);
  }

  function removeEntry(index: number) {
    const removed = entries[index];
    onChange(entries.filter((_, i) => i !== index));
    if (removed && removed.location === effectiveActive) {
      setActiveLocation(null);
    }
  }

  function removeByLocation(location: string) {
    onChange(entries.filter((e) => e.location !== location));
    if (location === effectiveActive) {
      setActiveLocation(null);
    }
  }

  const isWidespread = selectedKeys.includes("widespread");

  const severityMap: Record<string, number> = {};
  for (const e of entries) {
    severityMap[e.location] = e.severity;
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2.5 rounded-xl border px-3 py-2 transition-all w-full text-left ${
          hasPain
            ? "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400"
            : "border-border/50 bg-muted/30 text-muted-foreground hover:border-border hover:bg-muted/50"
        }`}
      >
        <PersonIcon
          className="h-4 w-4 shrink-0"
          weight={hasPain ? "fill" : "duotone"}
        />
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium">
            {hasPain
              ? isWidespread
                ? "Widespread pain"
                : `${entries.length} pain location${entries.length > 1 ? "s" : ""} logged`
              : "Are you in pain today?"}
          </span>
          {!open && !hasPain && (
            <span className="block text-[11px] text-muted-foreground mt-0.5">
              Tap body regions to log where it hurts
            </span>
          )}
        </div>
        <CaretDownIcon
          className={`h-3.5 w-3.5 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          weight="bold"
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl border border-border/50 bg-muted/10 p-3 space-y-3">
              {/* Front + Back side by side */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground text-center block">Front</Label>
                  <BodyMapSvg
                    view="front"
                    selected={selectedKeys}
                    severityMap={severityMap}
                    isWidespread={isWidespread}
                    onToggle={handleRegionClick}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground text-center block">Back</Label>
                  <BodyMapSvg
                    view="back"
                    selected={selectedKeys}
                    severityMap={severityMap}
                    isWidespread={isWidespread}
                    onToggle={handleRegionClick}
                  />
                </div>
              </div>

              {/* Widespread toggle */}
              <div className="flex justify-center">
                <Badge
                  variant={isWidespread ? "default" : "outline"}
                  className={`cursor-pointer select-none px-3 py-1.5 text-sm transition-colors ${
                    isWidespread ? "bg-rose-500 hover:bg-rose-600" : ""
                  }`}
                  onClick={() => handleRegionClick("widespread")}
                >
                  Widespread
                </Badge>
              </div>

              {/* Active detail card */}
              {activeEntry && activeIndex !== -1 && (
                <PainLocationDetailCard
                  entry={activeEntry}
                  onChange={(updated) => updateEntry(activeIndex, updated)}
                  onRemove={() => removeEntry(activeIndex)}
                  onDone={() => setActiveLocation(null)}
                />
              )}

              {/* Inactive chips */}
              {inactiveEntries.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs text-muted-foreground">Selected locations</span>
                  <div className="flex flex-wrap gap-1.5">
                    {inactiveEntries.map((entry) => (
                      <PainLocationChip
                        key={entry.location}
                        entry={entry}
                        onClick={() => setActiveLocation(entry.location)}
                        onRemove={() => removeByLocation(entry.location)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
