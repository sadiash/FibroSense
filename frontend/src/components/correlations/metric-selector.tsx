"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MetricSelectorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

const metricGroups = {
  Symptoms: [
    { value: "pain_severity", label: "Pain Severity" },
    { value: "fatigue_severity", label: "Fatigue" },
    { value: "brain_fog", label: "Brain Fog" },
    { value: "mood", label: "Mood" },
  ],
  Biometrics: [
    { value: "sleep_duration", label: "Sleep Duration" },
    { value: "sleep_efficiency", label: "Sleep Efficiency" },
    { value: "hrv_rmssd", label: "HRV (RMSSD)" },
    { value: "resting_hr", label: "Resting HR" },
  ],
  Weather: [
    { value: "barometric_pressure", label: "Barometric Pressure" },
    { value: "temperature", label: "Temperature" },
    { value: "humidity", label: "Humidity" },
  ],
};

export function MetricSelector({ value, onChange, label }: MetricSelectorProps) {
  return (
    <div className="space-y-1">
      {label && <span className="text-xs text-muted-foreground">{label}</span>}
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select metric..." />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(metricGroups).map(([group, metrics]) => (
            <SelectGroup key={group}>
              <SelectLabel>{group}</SelectLabel>
              {metrics.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
