"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useMedications,
  useCreateMedication,
  useDeleteMedication,
} from "@/lib/hooks/use-medications";
import {
  FMS_MEDICATION_PRESETS,
  MEDICATION_FREQUENCIES,
} from "@/lib/types";

const OTHER_VALUE = "__other__";

export function MedicationSettings() {
  const { data: medications = [] } = useMedications();
  const createMed = useCreateMedication();
  const deleteMed = useDeleteMedication();

  const [selectedMed, setSelectedMed] = useState("");
  const [customName, setCustomName] = useState("");
  const [selectedDosage, setSelectedDosage] = useState("");
  const [customDosage, setCustomDosage] = useState("");
  const [selectedFrequency, setSelectedFrequency] = useState("");
  const [customFrequency, setCustomFrequency] = useState("");

  const isOtherMed = selectedMed === OTHER_VALUE;
  const isOtherDosage = selectedDosage === OTHER_VALUE;
  const isOtherFrequency = selectedFrequency === OTHER_VALUE;

  // Find the preset to get its dosage options
  const activePreset = FMS_MEDICATION_PRESETS.find(
    (p) => p.name === selectedMed
  );

  const resolvedName = isOtherMed ? customName.trim() : selectedMed;
  const resolvedDosage =
    isOtherDosage || !activePreset
      ? customDosage.trim()
      : selectedDosage;
  const resolvedFrequency = isOtherFrequency
    ? customFrequency.trim()
    : selectedFrequency;

  const canSubmit = resolvedName.length > 0;

  // Group presets by category
  const categories = [
    ...new Set(FMS_MEDICATION_PRESETS.map((p) => p.category)),
  ];

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    createMed.mutate({
      name: resolvedName,
      dosage: resolvedDosage || null,
      frequency: resolvedFrequency || null,
    });
    setSelectedMed("");
    setCustomName("");
    setSelectedDosage("");
    setCustomDosage("");
    setSelectedFrequency("");
    setCustomFrequency("");
  }

  function handleMedChange(value: string) {
    setSelectedMed(value);
    // Reset dosage when medication changes (different meds have different dosages)
    setSelectedDosage("");
    setCustomDosage("");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Medications</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Manage your current medications. These will appear in the daily log
          so you can mark missed doses.
        </p>

        {/* Active medications list */}
        {medications.length > 0 && (
          <ul className="space-y-2">
            {medications.map((med) => (
              <li
                key={med.id}
                className="flex items-start sm:items-center justify-between gap-2 rounded-md border px-3 py-2"
              >
                <div className="min-w-0">
                  <span className="text-sm font-medium">{med.name}</span>
                  {med.dosage && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      {med.dosage}
                    </span>
                  )}
                  {med.frequency && (
                    <span className="ml-1 sm:ml-2 text-xs text-muted-foreground">
                      ({med.frequency})
                    </span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteMed.mutate(med.id)}
                  className="text-muted-foreground hover:text-destructive shrink-0"
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        )}

        {/* Add form */}
        <form onSubmit={handleAdd} className="space-y-3 border-t pt-3">
          {/* Medication name */}
          <div className="space-y-1.5">
            <Label className="text-xs">Medication</Label>
            <Select value={selectedMed} onValueChange={handleMedChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select medication..." />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category, i) => (
                  <SelectGroup key={category}>
                    {i > 0 && <SelectSeparator />}
                    <SelectLabel>{category}</SelectLabel>
                    {FMS_MEDICATION_PRESETS.filter(
                      (p) => p.category === category
                    ).map((preset) => (
                      <SelectItem key={preset.name} value={preset.name}>
                        {preset.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
                <SelectSeparator />
                <SelectItem value={OTHER_VALUE}>Other...</SelectItem>
              </SelectContent>
            </Select>
            {isOtherMed && (
              <Input
                placeholder="Enter medication name"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                autoFocus
              />
            )}
          </div>

          {/* Dosage */}
          <div className="space-y-1.5">
            <Label className="text-xs">Dosage</Label>
            {activePreset ? (
              <>
                <Select
                  value={selectedDosage}
                  onValueChange={setSelectedDosage}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select dosage..." />
                  </SelectTrigger>
                  <SelectContent>
                    {activePreset.commonDosages.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                    <SelectSeparator />
                    <SelectItem value={OTHER_VALUE}>Other...</SelectItem>
                  </SelectContent>
                </Select>
                {isOtherDosage && (
                  <Input
                    placeholder="Enter dosage"
                    value={customDosage}
                    onChange={(e) => setCustomDosage(e.target.value)}
                    autoFocus
                  />
                )}
              </>
            ) : (
              <Input
                placeholder="e.g. 50mg"
                value={customDosage}
                onChange={(e) => setCustomDosage(e.target.value)}
              />
            )}
          </div>

          {/* Frequency */}
          <div className="space-y-1.5">
            <Label className="text-xs">Frequency</Label>
            <Select
              value={selectedFrequency}
              onValueChange={setSelectedFrequency}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select frequency..." />
              </SelectTrigger>
              <SelectContent>
                {MEDICATION_FREQUENCIES.map((f) => (
                  <SelectItem key={f} value={f}>
                    {f}
                  </SelectItem>
                ))}
                <SelectSeparator />
                <SelectItem value={OTHER_VALUE}>Other...</SelectItem>
              </SelectContent>
            </Select>
            {isOtherFrequency && (
              <Input
                placeholder="Enter frequency"
                value={customFrequency}
                onChange={(e) => setCustomFrequency(e.target.value)}
                autoFocus
              />
            )}
          </div>

          <Button type="submit" size="sm" disabled={!canSubmit}>
            Add Medication
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
