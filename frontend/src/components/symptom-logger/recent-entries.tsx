"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SymptomLog, PAIN_LOCATION_LABELS, type PainLocation } from "@/lib/types";
import { format, parseISO } from "date-fns";
import { EmptyState } from "@/components/shared/empty-state";

interface RecentEntriesProps {
  entries: SymptomLog[];
}

export function RecentEntries({ entries }: RecentEntriesProps) {
  if (entries.length === 0) {
    return (
      <EmptyState
        title="No entries yet"
        description="Log your first symptom entry above"
      />
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">
        Recent Entries
      </h3>
      {entries.slice(0, 7).map((entry) => (
        <Card key={entry.id} className="p-0">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {format(parseISO(entry.date), "MMM d")}
              </span>
              <div className="flex gap-1">
                {entry.is_flare && (
                  <Badge variant="destructive" className="text-xs">
                    Flare
                  </Badge>
                )}
              </div>
            </div>
            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
              <span>Pain: {entry.pain_severity}</span>
              <span>Fatigue: {entry.fatigue_severity}</span>
              <span>Fog: {entry.brain_fog}</span>
              <span>Mood: {entry.mood}</span>
            </div>
            {entry.pain_locations.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {entry.pain_locations.map((loc) => {
                  const label =
                    PAIN_LOCATION_LABELS[loc.location as PainLocation] ??
                    loc.location;
                  return (
                    <Badge
                      key={loc.location}
                      variant="outline"
                      className="text-[10px] px-1.5 py-0"
                    >
                      {label} ({loc.severity})
                    </Badge>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
