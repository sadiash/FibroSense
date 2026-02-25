"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { SeveritySlider } from "./severity-slider";
import { PainLocationSelector } from "./pain-location-selector";
import { FlareToggle } from "./flare-toggle";
import { ContextualFactors } from "./contextual-factors";
import { MissedMedicationChecklist } from "./missed-medication-checklist";
import type { PainLocationEntry, SymptomLogCreate } from "@/lib/types";

interface SymptomLogFormProps {
  onSubmit: (data: SymptomLogCreate) => void;
  isSubmitting?: boolean;
}

export function SymptomLogForm({ onSubmit, isSubmitting }: SymptomLogFormProps) {
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [painLocations, setPainLocations] = useState<PainLocationEntry[]>([]);
  const [fatigueSeverity, setFatigueSeverity] = useState(0);
  const [brainFog, setBrainFog] = useState(0);
  const [mood, setMood] = useState(5);
  const [isFlare, setIsFlare] = useState(false);
  const [flareSeverity, setFlareSeverity] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [missedMedications, setMissedMedications] = useState<number[]>([]);
  const [menstrualPhase, setMenstrualPhase] = useState<string | null>(null);
  const [stressEvent, setStressEvent] = useState<string | null>(null);
  const [medicationChange, setMedicationChange] = useState<string | null>(null);
  const [exerciseType, setExerciseType] = useState<string | null>(null);
  const [exerciseRpe, setExerciseRpe] = useState<number | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const painSeverity =
      painLocations.length > 0
        ? Math.max(...painLocations.map((e) => e.severity))
        : 0;
    onSubmit({
      date,
      pain_severity: painSeverity,
      pain_locations: painLocations,
      fatigue_severity: fatigueSeverity,
      brain_fog: brainFog,
      mood,
      is_flare: isFlare,
      flare_severity: isFlare ? flareSeverity : null,
      notes: notes || null,
      missed_medications:
        missedMedications.length > 0 ? missedMedications : null,
      menstrual_phase: menstrualPhase,
      stress_event: stressEvent,
      medication_change: medicationChange,
      exercise_type: exerciseType,
      exercise_rpe: exerciseType ? exerciseRpe : null,
    });
    // Reset form
    setPainLocations([]);
    setFatigueSeverity(0);
    setBrainFog(0);
    setMood(5);
    setIsFlare(false);
    setFlareSeverity(null);
    setNotes("");
    setMissedMedications([]);
    setMenstrualPhase(null);
    setStressEvent(null);
    setMedicationChange(null);
    setExerciseType(null);
    setExerciseRpe(null);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log Symptoms</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <PainLocationSelector
            entries={painLocations}
            onChange={setPainLocations}
          />

          <SeveritySlider
            label="Fatigue"
            value={fatigueSeverity}
            onChange={setFatigueSeverity}
          />

          <SeveritySlider
            label="Brain Fog"
            value={brainFog}
            onChange={setBrainFog}
          />

          <SeveritySlider
            label="Mood"
            value={mood}
            onChange={setMood}
          />

          <Separator />

          <FlareToggle
            isFlare={isFlare}
            flareSeverity={flareSeverity}
            onFlareChange={setIsFlare}
            onSeverityChange={setFlareSeverity}
          />

          <Separator />

          <MissedMedicationChecklist
            missedIds={missedMedications}
            onChange={setMissedMedications}
          />

          <Separator />

          <ContextualFactors
            menstrualPhase={menstrualPhase}
            stressEvent={stressEvent}
            medicationChange={medicationChange}
            exerciseType={exerciseType}
            exerciseRpe={exerciseRpe}
            onMenstrualPhaseChange={setMenstrualPhase}
            onStressEventChange={setStressEvent}
            onMedicationChangeChange={setMedicationChange}
            onExerciseTypeChange={setExerciseType}
            onExerciseRpeChange={setExerciseRpe}
          />

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Input
              id="notes"
              placeholder="Anything else to note..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Entry"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
