"use client";

import { Badge } from "@/components/ui/badge";
import {
  PAIN_LOCATION_LABELS,
  type PainLocation,
  type PainLocationEntry,
} from "@/lib/types";
import { cn } from "@/lib/utils";

interface PainLocationChipProps {
  entry: PainLocationEntry;
  onClick: () => void;
  onRemove: () => void;
}

function severityColor(severity: number): string {
  if (severity <= 3) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
  if (severity <= 6) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
  return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
}

export function PainLocationChip({ entry, onClick, onRemove }: PainLocationChipProps) {
  const label =
    PAIN_LOCATION_LABELS[entry.location as PainLocation] ?? entry.location;
  const hasExtra = entry.descriptors.length > 0 || entry.note;

  return (
    <Badge
      variant="outline"
      className="cursor-pointer select-none gap-1 px-2 py-1 text-xs transition-colors hover:bg-accent"
      onClick={onClick}
    >
      <span>{label}</span>
      <span
        className={cn(
          "inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold leading-none",
          severityColor(entry.severity)
        )}
      >
        {entry.severity}
      </span>
      {hasExtra && <span className="text-muted-foreground">...</span>}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="ml-0.5 text-muted-foreground hover:text-foreground leading-none"
        aria-label={`Remove ${label}`}
      >
        &times;
      </button>
    </Badge>
  );
}
