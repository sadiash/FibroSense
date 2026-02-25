"use client";

import { OuraConnection } from "@/components/settings/oura-connection";
import { WeatherLocation } from "@/components/settings/weather-location";
import { MedicationSettings } from "@/components/settings/medication-settings";
import { DataExport } from "@/components/settings/data-export";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-xl font-semibold">Settings</h2>

      <MedicationSettings />
      <OuraConnection />
      <WeatherLocation />
      <DataExport />

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">About FibroSense</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>Version 0.1.0</p>
          <p>
            Privacy-first, self-hosted health tracking for fibromyalgia.
            Your data never leaves your machine.
          </p>
          <p>Licensed under AGPLv3</p>
        </CardContent>
      </Card>
    </div>
  );
}
