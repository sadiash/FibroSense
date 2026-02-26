"use client";

import { motion } from "framer-motion";
import { stagger, fadeUp } from "@/lib/animations";
import { OuraConnection } from "@/components/settings/oura-connection";
import { AppleHealthConnection } from "@/components/settings/apple-health-connection";
import { WeatherLocation } from "@/components/settings/weather-location";
import { MedicationSettings } from "@/components/settings/medication-settings";
import { DataExport } from "@/components/settings/data-export";
import { DemoDataManager } from "@/components/settings/demo-data-manager";
import { InfoIcon } from "@phosphor-icons/react";

export default function SettingsPage() {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-4"
    >
      {/* Page header */}
      <motion.div variants={fadeUp}>
        <h2 className="text-lg font-bold">Settings</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Configure your integrations and preferences
        </p>
      </motion.div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left column: tall components */}
        <div className="space-y-4">
          <motion.div variants={fadeUp}>
            <MedicationSettings />
          </motion.div>
          <motion.div variants={fadeUp}>
            <WeatherLocation />
          </motion.div>
        </div>

        {/* Right column: shorter components */}
        <div className="space-y-4">
          <motion.div variants={fadeUp}>
            <OuraConnection />
          </motion.div>
          <motion.div variants={fadeUp}>
            <AppleHealthConnection />
          </motion.div>
          <motion.div variants={fadeUp}>
            <DataExport />
          </motion.div>
          <motion.div variants={fadeUp}>
            <DemoDataManager />
          </motion.div>
        </div>
      </div>

      {/* About — full width */}
      <motion.div variants={fadeUp}>
        <div className="rounded-2xl bg-card border border-border/50 overflow-hidden">
          <div className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                <InfoIcon className="h-4 w-4 text-violet-500" weight="duotone" />
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
