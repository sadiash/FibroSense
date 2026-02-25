"use client";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface SeveritySliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

function getSeverityColor(value: number, max: number): string {
  const ratio = value / max;
  if (ratio <= 0.3) return "text-green-500";
  if (ratio <= 0.6) return "text-yellow-500";
  if (ratio <= 0.8) return "text-orange-500";
  return "text-red-500";
}

export function SeveritySlider({
  label,
  value,
  onChange,
  min = 0,
  max = 10,
}: SeveritySliderProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        <span
          className={cn(
            "text-lg font-bold tabular-nums min-w-[2ch] text-right",
            getSeverityColor(value, max)
          )}
        >
          {value}
        </span>
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(Math.min(max, Math.max(min, v)))}
        min={min}
        max={max}
        step={1}
        className="touch-none"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
