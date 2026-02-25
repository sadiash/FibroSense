"use client";

import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { SeveritySlider } from "./severity-slider";
import {
  PAIN_DESCRIPTORS,
  PAIN_DESCRIPTOR_LABELS,
  PAIN_LOCATION_LABELS,
  type PainDescriptor,
  type PainLocation,
  type PainLocationEntry,
} from "@/lib/types";
import { cn } from "@/lib/utils";

interface PainLocationDetailCardProps {
  entry: PainLocationEntry;
  onChange: (entry: PainLocationEntry) => void;
  onRemove: () => void;
  onDone?: () => void;
}

export function PainLocationDetailCard({
  entry,
  onChange,
  onRemove,
  onDone,
}: PainLocationDetailCardProps) {
  function toggleDescriptor(descriptor: string) {
    const current = entry.descriptors;
    const next = current.includes(descriptor)
      ? current.filter((d) => d !== descriptor)
      : [...current, descriptor];
    onChange({ ...entry, descriptors: next });
  }

  return (
    <div className="rounded-lg border bg-card p-3 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">
          {PAIN_LOCATION_LABELS[entry.location as PainLocation] ??
            entry.location}
        </span>
        <div className="flex items-center gap-1">
          {onDone && (
            <button
              type="button"
              onClick={onDone}
              className="rounded-md bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              aria-label={`Done editing ${entry.location}`}
            >
              Done
            </button>
          )}
          <button
            type="button"
            onClick={onRemove}
            className="text-muted-foreground hover:text-foreground text-lg leading-none px-1"
            aria-label={`Remove ${entry.location}`}
          >
            &times;
          </button>
        </div>
      </div>

      <SeveritySlider
        label="Severity"
        value={entry.severity}
        onChange={(severity) => onChange({ ...entry, severity })}
        min={1}
        max={10}
      />

      <div className="space-y-1.5">
        <span className="text-xs text-muted-foreground">Pain Type</span>
        <div className="flex flex-wrap gap-1.5">
          {PAIN_DESCRIPTORS.map((desc) => (
            <Badge
              key={desc}
              variant={
                entry.descriptors.includes(desc) ? "default" : "outline"
              }
              className={cn(
                "cursor-pointer select-none px-2 py-0.5 text-xs transition-colors",
                entry.descriptors.includes(desc) &&
                  "bg-primary text-primary-foreground"
              )}
              onClick={() => toggleDescriptor(desc)}
            >
              {PAIN_DESCRIPTOR_LABELS[desc as PainDescriptor]}
            </Badge>
          ))}
        </div>
      </div>

      <Textarea
        placeholder="Optional note for this area..."
        value={entry.note ?? ""}
        onChange={(e) =>
          onChange({ ...entry, note: e.target.value || null })
        }
        className="min-h-[60px] text-sm"
      />
    </div>
  );
}
