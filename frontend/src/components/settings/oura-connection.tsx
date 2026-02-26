"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  triggerSync,
  updateSetting,
  getSettings,
  getDemoDataStatus,
  clearDemoData,
} from "@/lib/api";

export function OuraConnection() {
  const [apiKey, setApiKey] = useState("");
  const [hasSavedKey, setHasSavedKey] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [syncDetail, setSyncDetail] = useState<string | null>(null);
  const [showDemoPrompt, setShowDemoPrompt] = useState(false);
  const [clearingDemo, setClearingDemo] = useState(false);

  useEffect(() => {
    getSettings().then((settings) => {
      const saved = settings.find((s) => s.key === "oura_api_key");
      if (saved && saved.value) {
        setApiKey(saved.value);
        setHasSavedKey(true);
      }
    }).catch(() => {});
  }, []);

  async function performSync() {
    setSyncing(true);
    setSyncStatus(null);
    setSyncDetail(null);
    try {
      const result = await triggerSync("oura");
      setSyncStatus(result.status);
      if (result.error_message) {
        setSyncDetail(result.error_message);
      } else if (result.records_synced > 0) {
        setSyncDetail(`${result.records_synced} records synced`);
      }
    } catch (e) {
      setSyncStatus("error");
      setSyncDetail(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setSyncing(false);
    }
  }

  async function handleTestConnection() {
    if (!apiKey) return;
    setSyncing(true);
    setSyncStatus(null);
    setSyncDetail(null);
    try {
      await updateSetting("oura_api_key", apiKey);
      setHasSavedKey(true);

      // Check for demo data before first sync
      const demoStatus = await getDemoDataStatus();
      if (demoStatus.has_demo_data) {
        setSyncing(false);
        setShowDemoPrompt(true);
        return;
      }

      await performSync();
    } catch (e) {
      setSyncStatus("error");
      setSyncDetail(e instanceof Error ? e.message : "Unknown error");
      setSyncing(false);
    }
  }

  async function handleClearAndSync() {
    setClearingDemo(true);
    try {
      await clearDemoData();
      setShowDemoPrompt(false);
      await performSync();
    } catch (e) {
      setSyncStatus("error");
      setSyncDetail(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setClearingDemo(false);
    }
  }

  async function handleKeepAndSync() {
    setShowDemoPrompt(false);
    await performSync();
  }

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Oura Ring Connection</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="oura-key">API Key</Label>
          <Input
            id="oura-key"
            type="password"
            placeholder="Enter your Oura personal access token"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          {hasSavedKey && (
            <p className="text-xs text-muted-foreground">Key saved in database</p>
          )}
        </div>
        <Button
          size="sm"
          onClick={handleTestConnection}
          disabled={syncing || !apiKey}
        >
          {syncing ? "Connecting..." : "Save & Test Connection"}
        </Button>
        {syncStatus && (
          <div className="space-y-1">
            <Badge variant={syncStatus === "completed" ? "default" : "destructive"}>
              {syncStatus === "completed" ? "Connected" : "Connection failed"}
            </Badge>
            {syncDetail && (
              <p className="text-xs text-muted-foreground">{syncDetail}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>

    <Dialog open={showDemoPrompt} onOpenChange={setShowDemoPrompt}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Demo Data Detected</DialogTitle>
          <DialogDescription>
            Your database contains fictitious demo data. It&apos;s recommended
            to clear it before syncing real Oura data to avoid mixing
            fictitious and real records.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={handleKeepAndSync}
            disabled={clearingDemo}
          >
            Keep demo data & sync
          </Button>
          <Button
            onClick={handleClearAndSync}
            disabled={clearingDemo}
          >
            {clearingDemo ? "Clearing..." : "Clear demo data & sync"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
