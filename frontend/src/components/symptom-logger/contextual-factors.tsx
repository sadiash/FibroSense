"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import { DietMultiSelect } from "./diet-multi-select";
import { MENSTRUAL_PHASE_OPTIONS } from "@/lib/types";
import {
  CaretDownIcon,
  HeartHalfIcon,
  BrainIcon,
  FirstAidIcon,
  PersonSimpleRunIcon,
  ForkKnifeIcon,
} from "@phosphor-icons/react";

interface ContextualFactorsProps {
  menstrualPhase: string | null;
  stressEvent: string | null;
  medicationChange: string | null;
  exerciseType: string | null;
  exerciseRpe: number | null;
  dietFlags: string | null;
  onMenstrualPhaseChange: (v: string | null) => void;
  onStressEventChange: (v: string | null) => void;
  onMedicationChangeChange: (v: string | null) => void;
  onExerciseTypeChange: (v: string | null) => void;
  onExerciseRpeChange: (v: number | null) => void;
  onDietFlagsChange: (v: string | null) => void;
}

export function ContextualFactors({
  menstrualPhase,
  stressEvent,
  medicationChange,
  exerciseType,
  exerciseRpe,
  dietFlags,
  onMenstrualPhaseChange,
  onStressEventChange,
  onMedicationChangeChange,
  onExerciseTypeChange,
  onExerciseRpeChange,
  onDietFlagsChange,
}: ContextualFactorsProps) {
  const [open, setOpen] = useState(false);

  // Count how many factors are filled
  const filledCount = [menstrualPhase, stressEvent, medicationChange, exerciseType, dietFlags].filter(Boolean).length;

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2.5 rounded-xl border px-3 py-2 transition-all w-full text-left ${
          filledCount > 0
            ? "border-violet-500/30 bg-violet-500/10 text-violet-600 dark:text-violet-400"
            : "border-border/50 bg-muted/30 text-muted-foreground hover:border-border hover:bg-muted/50"
        }`}
      >
        <BrainIcon
          className="h-4 w-4 shrink-0"
          weight={filledCount > 0 ? "fill" : "duotone"}
        />
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium">
            {filledCount > 0
              ? `${filledCount} factor${filledCount > 1 ? "s" : ""} logged`
              : "What else happened today?"}
          </span>
          {!open && filledCount === 0 && (
            <span className="block text-[11px] text-muted-foreground mt-0.5">
              Stress, cycle, exercise, diet, med changes
            </span>
          )}
        </div>
        <CaretDownIcon
          className={`h-3.5 w-3.5 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          weight="bold"
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl border border-border/50 bg-muted/10 p-3 space-y-4">
              {/* Menstrual Phase */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <HeartHalfIcon className="h-3.5 w-3.5 text-pink-500" weight="duotone" />
                  <Label className="text-sm">Menstrual Phase</Label>
                </div>
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

              {/* Stress Events */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <BrainIcon className="h-3.5 w-3.5 text-amber-500" weight="duotone" />
                  <Label className="text-sm">Stress Events</Label>
                </div>
                <StressMultiSelect
                  selected={stressEvent ? stressEvent.split(",") : []}
                  onChange={(items) =>
                    onStressEventChange(items.length > 0 ? items.join(",") : null)
                  }
                />
              </div>

              {/* Medication Change */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FirstAidIcon className="h-3.5 w-3.5 text-teal-500" weight="duotone" />
                  <Label className="text-sm">Medication Change</Label>
                </div>
                <Input
                  placeholder="e.g., started new supplement..."
                  value={medicationChange ?? ""}
                  onChange={(e) =>
                    onMedicationChangeChange(e.target.value || null)
                  }
                />
              </div>

              {/* Exercise */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <PersonSimpleRunIcon className="h-3.5 w-3.5 text-emerald-500" weight="duotone" />
                  <Label className="text-sm">Exercise</Label>
                </div>
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

              {/* Diet Flags */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <ForkKnifeIcon className="h-3.5 w-3.5 text-orange-500" weight="duotone" />
                  <Label className="text-sm">Diet Flags</Label>
                </div>
                <DietMultiSelect
                  selected={dietFlags ? dietFlags.split(",") : []}
                  onChange={(items) =>
                    onDietFlagsChange(items.length > 0 ? items.join(",") : null)
                  }
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
