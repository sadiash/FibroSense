"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SeveritySlider } from "./severity-slider";
import { StressMultiSelect } from "./stress-multi-select";
import { MENSTRUAL_PHASE_OPTIONS } from "@/lib/types";
import { useState } from "react";

interface ContextualFactorsProps {
  menstrualPhase: string | null;
  stressEvent: string | null;
  medicationChange: string | null;
  exerciseType: string | null;
  exerciseRpe: number | null;
  onMenstrualPhaseChange: (v: string | null) => void;
  onStressEventChange: (v: string | null) => void;
  onMedicationChangeChange: (v: string | null) => void;
  onExerciseTypeChange: (v: string | null) => void;
  onExerciseRpeChange: (v: number | null) => void;
}

export function ContextualFactors({
  menstrualPhase,
  stressEvent,
  medicationChange,
  exerciseType,
  exerciseRpe,
  onMenstrualPhaseChange,
  onStressEventChange,
  onMedicationChangeChange,
  onExerciseTypeChange,
  onExerciseRpeChange,
}: ContextualFactorsProps) {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" className="w-full justify-between" type="button">
          Contextual Factors
          <span className="text-xs text-muted-foreground">
            {open ? "Hide" : "Show"}
          </span>
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-4 pt-2">
        <div className="space-y-2">
          <Label className="text-sm">Menstrual Phase</Label>
          <Select
            value={menstrualPhase ?? ""}
            onValueChange={(v) =>
              onMenstrualPhaseChange(v === "" ? null : v)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select phase..." />
            </SelectTrigger>
            <SelectContent>
              {MENSTRUAL_PHASE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  <span className="font-medium">{opt.label}</span>
                  {opt.description && (
                    <span className="ml-1 text-xs text-muted-foreground">
                      — {opt.description}
                    </span>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm">Stress Events</Label>
          <StressMultiSelect
            selected={stressEvent ? stressEvent.split(",") : []}
            onChange={(items) =>
              onStressEventChange(items.length > 0 ? items.join(",") : null)
            }
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm">Medication Change</Label>
          <Input
            placeholder="e.g., started new supplement..."
            value={medicationChange ?? ""}
            onChange={(e) =>
              onMedicationChangeChange(e.target.value || null)
            }
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm">Exercise Type</Label>
          <Input
            placeholder="e.g., walking, yoga, swimming..."
            value={exerciseType ?? ""}
            onChange={(e) =>
              onExerciseTypeChange(e.target.value || null)
            }
          />
        </div>

        {exerciseType && (
          <SeveritySlider
            label="Exercise RPE (1-10)"
            value={exerciseRpe ?? 3}
            onChange={(v) => onExerciseRpeChange(v)}
            min={1}
            max={10}
          />
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
