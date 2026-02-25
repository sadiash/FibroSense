"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useMedications } from "@/lib/hooks/use-medications";

interface MissedMedicationChecklistProps {
  missedIds: number[];
  onChange: (ids: number[]) => void;
}

export function MissedMedicationChecklist({
  missedIds,
  onChange,
}: MissedMedicationChecklistProps) {
  const { data: medications = [] } = useMedications();

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

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Missed Medications</Label>
      <div className="space-y-2">
        {medications.map((med) => (
          <div key={med.id} className="flex items-center gap-2">
            <Checkbox
              id={`missed-${med.id}`}
              checked={missedIds.includes(med.id)}
              onCheckedChange={() => toggleMissed(med.id)}
            />
            <label
              htmlFor={`missed-${med.id}`}
              className="text-sm leading-none cursor-pointer"
            >
              {med.name}
              {med.dosage && (
                <span className="ml-1 text-xs text-muted-foreground">
                  ({med.dosage})
                </span>
              )}
            </label>
          </div>
        ))}
        <p className="text-xs text-muted-foreground">
          Check any medications you missed today.
        </p>
      </div>
    </div>
  );
}
