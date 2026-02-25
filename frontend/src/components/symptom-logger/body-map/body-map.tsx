"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { PainLocationEntry } from "@/lib/types";
import { BodyMapSvg } from "./body-map-svg";
import { PainLocationDetailCard } from "../pain-location-detail-card";
import { PainLocationChip } from "../pain-location-chip";

interface BodyMapProps {
  entries: PainLocationEntry[];
  onChange: (entries: PainLocationEntry[]) => void;
}

export function BodyMap({ entries, onChange }: BodyMapProps) {
  const [view, setView] = useState<"front" | "back">("front");
  const [activeLocation, setActiveLocation] = useState<string | null>(null);

  const selectedKeys = entries.map((e) => e.location);

  // Ensure activeLocation is still valid (entry might have been removed externally)
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
        // Clicking the already-active region → deselect (remove)
        onChange(entries.filter((e) => e.location !== key));
        setActiveLocation(null);
      } else {
        // Selected but not active → just activate it for editing
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
      <Label className="text-sm font-medium">Pain Locations</Label>

      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4">
        {/* LEFT COLUMN: Body map SVG + tabs + widespread */}
        <div className="space-y-3">
          <Tabs value={view} onValueChange={(v) => setView(v as "front" | "back")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="front">Front</TabsTrigger>
              <TabsTrigger value="back">Back</TabsTrigger>
            </TabsList>

            <TabsContent value="front">
              <BodyMapSvg
                view="front"
                selected={selectedKeys}
                severityMap={severityMap}
                onToggle={handleRegionClick}
              />
            </TabsContent>

            <TabsContent value="back">
              <BodyMapSvg
                view="back"
                selected={selectedKeys}
                severityMap={severityMap}
                onToggle={handleRegionClick}
              />
            </TabsContent>
          </Tabs>

          <div className="flex justify-center">
            <Badge
              variant={isWidespread ? "default" : "outline"}
              className="cursor-pointer select-none px-3 py-1.5 text-sm transition-colors"
              onClick={() => handleRegionClick("widespread")}
            >
              Widespread
            </Badge>
          </div>
        </div>

        {/* RIGHT COLUMN: Active detail card + inactive chips */}
        <div className="space-y-3">
          {activeEntry && activeIndex !== -1 ? (
            <PainLocationDetailCard
              entry={activeEntry}
              onChange={(updated) => updateEntry(activeIndex, updated)}
              onRemove={() => removeEntry(activeIndex)}
              onDone={() => setActiveLocation(null)}
            />
          ) : (
            entries.length === 0 && (
              <div className="flex h-full items-center justify-center rounded-lg border border-dashed p-6">
                <p className="text-sm text-muted-foreground text-center">
                  Click a body region to log pain details
                </p>
              </div>
            )
          )}

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
      </div>
    </div>
  );
}
