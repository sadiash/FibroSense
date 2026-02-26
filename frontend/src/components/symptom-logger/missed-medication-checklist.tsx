"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useMedications } from "@/lib/hooks/use-medications";
import { PillIcon } from "@phosphor-icons/react";

interface MissedMedicationChecklistProps {
  missedIds: number[];
  onChange: (ids: number[]) => void;
}

export function MissedMedicationChecklist({
  missedIds,
  onChange,
}: MissedMedicationChecklistProps) {
  const { data: medications = [] } = useMedications();
  const [expanded, setExpanded] = useState(false);

  function toggleMissed(id: number) {
    if (missedIds.includes(id)) {
      onChange(missedIds.filter((mid) => mid !== id));
    } else {
      onChange([...missedIds, id]);
    }
  }

  if (medications.length === 0) {
    return null;
  }

  const hasMissed = missedIds.length > 0;

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className={`flex items-center gap-2.5 rounded-xl border px-3 py-2 transition-all w-full text-left ${
          hasMissed
            ? "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
            : "border-border/50 bg-muted/30 text-muted-foreground hover:border-border hover:bg-muted/50"
        }`}
      >
        <PillIcon
          className="h-4 w-4 shrink-0"
          weight={hasMissed ? "fill" : "duotone"}
        />
        <span className="text-sm font-medium flex-1">
          {hasMissed
            ? `Missed ${missedIds.length} medication${missedIds.length > 1 ? "s" : ""}`
            : "Did you miss any medications?"}
        </span>
        <span className="text-xs text-muted-foreground">
          {expanded ? "Hide" : "Show"}
        </span>
      </button>

      {expanded && (
        <div className="rounded-xl border border-border/50 bg-muted/10 p-3 space-y-2.5">
          <Label className="text-xs text-muted-foreground uppercase tracking-wider">
            Check any you missed today
          </Label>
          {medications.map((med) => (
            <label
              key={med.id}
              htmlFor={`missed-${med.id}`}
              className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 cursor-pointer transition-colors ${
                missedIds.includes(med.id)
                  ? "bg-amber-500/10"
                  : "hover:bg-muted/50"
              }`}
            >
              <Checkbox
                id={`missed-${med.id}`}
                checked={missedIds.includes(med.id)}
                onCheckedChange={() => toggleMissed(med.id)}
              />
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium">{med.name}</span>
                {med.dosage && (
                  <span className="ml-1.5 text-xs text-muted-foreground">
                    {med.dosage}
                  </span>
                )}
              </div>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
