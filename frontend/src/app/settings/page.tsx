"use client";

import { motion } from "framer-motion";
import { stagger, fadeUp } from "@/lib/animations";
import { OuraConnection } from "@/components/settings/oura-connection";
import { WeatherLocation } from "@/components/settings/weather-location";
import { MedicationSettings } from "@/components/settings/medication-settings";
import { DataExport } from "@/components/settings/data-export";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="max-w-2xl mx-auto space-y-6"
    >
      {/* Page header */}
      <motion.div variants={fadeUp}>
        <h2 className="text-lg font-bold">Settings</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Configure your integrations and preferences
        </p>
      </motion.div>

      <motion.div variants={fadeUp}>
        <MedicationSettings />
      </motion.div>

      <motion.div variants={fadeUp}>
        <OuraConnection />
      </motion.div>

      <motion.div variants={fadeUp}>
        <WeatherLocation />
      </motion.div>

      <motion.div variants={fadeUp}>
        <DataExport />
      </motion.div>

      <motion.div variants={fadeUp}>
        <Separator className="opacity-50" />
      </motion.div>

      <motion.div variants={fadeUp}>
        <div className="rounded-2xl bg-card border border-border/50 overflow-hidden">
          <div className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                <svg className="h-4 w-4 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4M12 8h.01" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold">About FibroSense</h3>
            </div>
            <div className="space-y-2 text-xs text-muted-foreground ml-10">
              <p>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium">
                  v0.1.0
                </span>
              </p>
              <p>
                Privacy-first, self-hosted health tracking for fibromyalgia.
                Your data never leaves your machine.
              </p>
              <p className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Licensed under AGPLv3
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
