"use client";

import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { LightningIcon } from "@phosphor-icons/react";

interface FlareToggleProps {
  isFlare: boolean;
  flareSeverity: number | null;
  onFlareChange: (isFlare: boolean) => void;
  onSeverityChange: (severity: number) => void;
}

export function FlareToggle({
  isFlare,
  flareSeverity,
  onFlareChange,
  onSeverityChange,
}: FlareToggleProps) {
  return (
    <div className="flex items-center gap-2.5 flex-1 min-w-0">
      <button
        type="button"
        onClick={() => onFlareChange(!isFlare)}
        className={`flex items-center gap-2 rounded-xl border px-3 py-2 transition-all shrink-0 ${
          isFlare
            ? "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400"
            : "border-border/50 bg-muted/30 text-muted-foreground hover:border-border hover:bg-muted/50"
        }`}
      >
        <LightningIcon
          className="h-4 w-4 shrink-0"
          weight={isFlare ? "fill" : "duotone"}
        />
        <span className="text-sm font-medium">Flare</span>
        <Switch
          checked={isFlare}
          onCheckedChange={onFlareChange}
          className="ml-1"
          onClick={(e) => e.stopPropagation()}
        />
      </button>

      {isFlare && (
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Slider
            value={[flareSeverity ?? 5]}
            onValueChange={([v]) => onSeverityChange(v)}
            min={1}
            max={10}
            step={1}
            className="flex-1 touch-none"
          />
          <span className="text-sm font-bold tabular-nums text-rose-500 w-5 text-right shrink-0">
            {flareSeverity ?? 5}
          </span>
        </div>
      )}
    </div>
  );
}
