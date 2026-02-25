"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { triggerSync, updateSetting, getSettings } from "@/lib/api";
import dynamic from "next/dynamic";

const LocationMap = dynamic(() => import("./location-map"), { ssr: false });

export function WeatherLocation() {
  const [lat, setLat] = useState(40.7128);
  const [lon, setLon] = useState(-74.006);
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);

  useEffect(() => {
    getSettings().then((settings) => {
      const savedLat = settings.find((s) => s.key === "weather_latitude");
      const savedLon = settings.find((s) => s.key === "weather_longitude");
      if (savedLat) setLat(parseFloat(savedLat.value));
      if (savedLon) setLon(parseFloat(savedLon.value));
      if (savedLat || savedLon) setHasSaved(true);
      setLoaded(true);
    }).catch(() => setLoaded(true));
  }, []);

  const handleMapClick = useCallback((newLat: number, newLon: number) => {
    setLat(Math.round(newLat * 10000) / 10000);
    setLon(Math.round(newLon * 10000) / 10000);
  }, []);

  async function handleSearch() {
    if (!search.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(search)}&limit=1`,
        { headers: { "User-Agent": "FibroSense/1.0" } }
      );
      const data = await res.json();
      if (data.length > 0) {
        const newLat = parseFloat(data[0].lat);
        const newLon = parseFloat(data[0].lon);
        setLat(Math.round(newLat * 10000) / 10000);
        setLon(Math.round(newLon * 10000) / 10000);
      }
    } catch {
      // silently fail
    } finally {
      setSearching(false);
    }
  }

  function handleSearchKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  }

  async function handleSaveAndTest() {
    setSaving(true);
    setTestStatus(null);
    try {
      await updateSetting("weather_latitude", lat.toString());
      await updateSetting("weather_longitude", lon.toString());
      const result = await triggerSync("weather");
      setTestStatus(result.status);
      setHasSaved(true);
      setEditing(false);
    } catch {
      setTestStatus("error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Weather Location</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasSaved && !editing ? (
          <>
            <div className="flex items-center justify-between">
              <div className="grid grid-cols-2 gap-4 flex-1">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Latitude</Label>
                  <p className="text-sm font-mono">{lat}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Longitude</Label>
                  <p className="text-sm font-mono">{lon}</p>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                Edit
              </Button>
            </div>
            {testStatus && (
              <Badge variant={testStatus === "completed" ? "default" : "destructive"}>
                {testStatus === "completed" ? "Connected" : "Connection failed"}
              </Badge>
            )}
          </>
        ) : (
          <>
            <div className="space-y-2">
              <Label>Search Location</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. London, Tokyo, New York..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSearch}
                  disabled={searching || !search.trim()}
                  type="button"
                >
                  {searching ? "..." : "Search"}
                </Button>
              </div>
            </div>

            {loaded && (
              <div className="rounded-md overflow-hidden border h-[300px]">
                <LocationMap lat={lat} lon={lon} onLocationChange={handleMapClick} />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Latitude</Label>
                <p className="text-sm font-mono">{lat}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Longitude</Label>
                <p className="text-sm font-mono">{lon}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleSaveAndTest}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save & Test"}
              </Button>
              {hasSaved && (
                <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
              )}
            </div>
            {testStatus && (
              <Badge variant={testStatus === "completed" ? "default" : "destructive"}>
                {testStatus === "completed" ? "Connected" : "Connection failed"}
              </Badge>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
