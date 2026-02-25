"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SeveritySlider } from "./severity-slider";

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
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label htmlFor="flare-toggle" className="text-sm font-medium">
          Flare Day
        </Label>
        <Switch
          id="flare-toggle"
          checked={isFlare}
          onCheckedChange={onFlareChange}
        />
      </div>
      {isFlare && (
        <SeveritySlider
          label="Flare Severity"
          value={flareSeverity ?? 5}
          onChange={onSeverityChange}
          min={1}
          max={10}
        />
      )}
    </div>
  );
}
