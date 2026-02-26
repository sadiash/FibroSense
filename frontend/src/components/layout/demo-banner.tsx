"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getDemoDataStatus, clearDemoData } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckIcon, WarningIcon } from "@phosphor-icons/react";

export function DemoBanner() {
  const [hasDemo, setHasDemo] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [cleared, setCleared] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    getDemoDataStatus()
      .then((s) => setHasDemo(s.has_demo_data))
      .catch(() => setHasDemo(false));
  }, []);

  async function handleClear() {
    setClearing(true);
    try {
      const res = await clearDemoData();
      if (res.status === "completed") {
        setHasDemo(false);
        setCleared(true);
        // Invalidate all queries so pages refetch with empty state
        queryClient.invalidateQueries();
      }
    } catch {
      // keep banner visible on error
    } finally {
      setClearing(false);
      setShowConfirm(false);
    }
  }

  if (cleared) {
    return (
      <div className="bg-emerald-600 text-white text-center text-xs py-2 px-4 flex items-center justify-center gap-2">
        <CheckIcon className="h-3.5 w-3.5 shrink-0" weight="bold" />
        <span>
          Demo data cleared. You can now start logging your own data &mdash; connect your Oura ring in{" "}
          <a href="/settings" className="underline font-semibold">Settings</a>.
        </span>
      </div>
    );
  }

  if (!hasDemo) return null;

  return (
    <>
      <div className="bg-[hsl(var(--primary))] text-white text-center text-xs py-2 px-4 flex items-center justify-center gap-2">
        <WarningIcon className="h-3.5 w-3.5 shrink-0" weight="bold" />
        <span>
          You are viewing <strong>fictitious demo data</strong> &mdash; this is not real patient data.
        </span>
        <button
          onClick={() => setShowConfirm(true)}
          className="ml-1 underline font-semibold hover:text-white/80 transition-colors"
        >
          Clear &amp; start fresh
        </button>
      </div>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear all demo data?</DialogTitle>
            <DialogDescription className="space-y-3 pt-2">
              <span className="block">
                This will permanently delete all fictitious data including symptom
                logs, biometric readings, contextual data, medications, and
                correlation cache.
              </span>
              <span className="block font-medium text-foreground">
                After clearing, you can start logging your own real data.
                Connect your Oura ring in Settings to sync biometrics, and use
                the daily log to track your symptoms.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirm(false)}
              disabled={clearing}
            >
              Keep Demo Data
            </Button>
            <Button
              variant="destructive"
              onClick={handleClear}
              disabled={clearing}
            >
              {clearing ? "Clearing..." : "Clear & Start Fresh"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
