"use client";

import { useState } from "react";
import { format, parse } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SeveritySlider } from "./severity-slider";
import { PainLocationSelector } from "./pain-location-selector";
import { FlareToggle } from "./flare-toggle";
import { ContextualFactors } from "./contextual-factors";
import { MissedMedicationChecklist } from "./missed-medication-checklist";
import {
  CalendarBlankIcon,
  HeartbeatIcon,
  NoteBlankIcon,
} from "@phosphor-icons/react";
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
  const [dietFlags, setDietFlags] = useState<string | null>(null);

  // Derive pain severity from body map locations
  const painSeverity = painLocations.length > 0
    ? Math.max(...painLocations.map((e) => e.severity))
    : 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
      diet_flags: dietFlags,
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
    setDietFlags(null);
  }

  return (
    <Card>
      <CardContent className="pt-5">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* ── Date + Flare ── */}
          <div className="flex items-center gap-2.5">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="max-w-[180px] justify-start gap-2 font-normal"
                >
                  <CalendarBlankIcon className="h-4 w-4 text-muted-foreground" weight="duotone" />
                  {format(parse(date, "yyyy-MM-dd", new Date()), "MMM d, yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={parse(date, "yyyy-MM-dd", new Date())}
                  onSelect={(day) => {
                    if (day) setDate(format(day, "yyyy-MM-dd"));
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <FlareToggle
              isFlare={isFlare}
              flareSeverity={flareSeverity}
              onFlareChange={setIsFlare}
              onSeverityChange={setFlareSeverity}
            />
          </div>

          {/* ── How are you feeling? ── */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <HeartbeatIcon className="h-4 w-4 text-rose-500" weight="duotone" />
              <h3 className="text-sm font-semibold">How are you feeling?</h3>
            </div>

            <div className="grid grid-cols-3 gap-x-4 gap-y-3">
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
            </div>
          </div>

          {/* ── Pain locations (collapsible body map) ── */}
          <PainLocationSelector
            entries={painLocations}
            onChange={setPainLocations}
          />

          {/* ── Divider ── */}
          <div className="border-t border-border/50" />

          {/* ── Medications & Context ── */}
          <MissedMedicationChecklist
            missedIds={missedMedications}
            onChange={setMissedMedications}
          />

          <ContextualFactors
            menstrualPhase={menstrualPhase}
            stressEvent={stressEvent}
            medicationChange={medicationChange}
            exerciseType={exerciseType}
            exerciseRpe={exerciseRpe}
            dietFlags={dietFlags}
            onMenstrualPhaseChange={setMenstrualPhase}
            onStressEventChange={setStressEvent}
            onMedicationChangeChange={setMedicationChange}
            onExerciseTypeChange={setExerciseType}
            onExerciseRpeChange={setExerciseRpe}
            onDietFlagsChange={setDietFlags}
          />

          {/* ── Notes ── */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <NoteBlankIcon className="h-4 w-4 text-muted-foreground" weight="duotone" />
              <Label htmlFor="notes" className="text-sm font-medium">Notes</Label>
            </div>
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
