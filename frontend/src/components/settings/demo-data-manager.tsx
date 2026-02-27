"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getDemoDataStatus,
  clearDemoData,
  type DemoDataStatus,
} from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

const GUEST_EMAIL = "guest@fibrosense.app";

export function DemoDataManager() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const isGuest = user?.email === GUEST_EMAIL;
  const [status, setStatus] = useState<DemoDataStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [result, setResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    fetchStatus();
  }, []);

  async function fetchStatus() {
    setLoading(true);
    try {
      const data = await getDemoDataStatus();
      setStatus(data);
    } catch {
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleClear() {
    setClearing(true);
    setResult(null);
    try {
      if (isGuest) {
        // Guest users: sign out and go to register
        await logout();
        router.push("/register");
        return;
      }
      const res = await clearDemoData();
      if (res.status === "completed") {
        setResult({
          type: "success",
          message: `Cleared ${res.records_deleted} demo records.`,
        });
      } else {
        setResult({
          type: "error",
          message: res.error_message || "Failed to clear demo data.",
        });
      }
      await fetchStatus();
    } catch (e) {
      setResult({
        type: "error",
        message: e instanceof Error ? e.message : "Unknown error",
      });
    } finally {
      setClearing(false);
      setShowConfirm(false);
    }
  }

  const totalRecords = status
    ? status.biometric_readings_count +
      status.symptom_logs_count +
      status.contextual_data_count +
      status.medications_count +
      status.sync_log_count
    : 0;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Demo Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <p className="text-xs text-muted-foreground">Checking...</p>
          ) : status?.has_demo_data ? (
            <>
              <p className="text-xs text-muted-foreground">
                {isGuest
                  ? "You're exploring as a guest with sample data. Ready to track your own health?"
                  : "Fictitious demo data is present in your database. Clear it before tracking real data."}
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">
                  {status.biometric_readings_count} biometrics
                </Badge>
                <Badge variant="secondary">
                  {status.symptom_logs_count} symptom logs
                </Badge>
                <Badge variant="secondary">
                  {status.contextual_data_count} contextual
                </Badge>
                <Badge variant="secondary">
                  {status.medications_count} medications
                </Badge>
              </div>
              <Button
                variant={isGuest ? "default" : "destructive"}
                size="sm"
                onClick={() => setShowConfirm(true)}
              >
                {isGuest ? "Create My Account" : "Clear Demo Data"}
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-xs text-muted-foreground">
                No demo data present
              </span>
            </div>
          )}

          {result && (
            <p
              className={`text-xs ${
                result.type === "success"
                  ? "text-emerald-600"
                  : "text-destructive"
              }`}
            >
              {result.message}
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isGuest ? "Ready to create your account?" : "Clear all demo data?"}
            </DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-3 pt-2">
                {isGuest ? (
                  <>
                    <p>
                      You&apos;ll be signed out of the guest account and taken to
                      the registration page to create your own private account.
                    </p>
                    <p className="font-medium text-foreground">
                      Your own account will start fresh — connect your Oura ring,
                      set your location, and start tracking your real symptoms.
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      This will permanently delete {totalRecords} fictitious records
                      (biometrics, symptom logs, contextual data, medications, and
                      sync logs). Correlation cache will also be cleared. This
                      action cannot be undone.
                    </p>
                    <p className="font-medium text-foreground">
                      After clearing, you can start logging your own real data.
                      Connect your Oura ring to sync biometrics, and use the daily
                      log to track your symptoms.
                    </p>
                  </>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirm(false)}
              disabled={clearing}
            >
              {isGuest ? "Keep Exploring" : "Keep Demo Data"}
            </Button>
            <Button
              variant={isGuest ? "default" : "destructive"}
              onClick={handleClear}
              disabled={clearing}
            >
              {clearing
                ? (isGuest ? "Redirecting..." : "Clearing...")
                : (isGuest ? "Sign Up Now" : "Clear & Start Fresh")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
