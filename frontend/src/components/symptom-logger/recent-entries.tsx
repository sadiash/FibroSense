"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SymptomLog, PAIN_LOCATION_LABELS, type PainLocation } from "@/lib/types";
import { useDeleteSymptomLog } from "@/lib/hooks/use-symptom-logs";
import { format, parseISO } from "date-fns";
import { EmptyState } from "@/components/shared/empty-state";
import { TrashIcon, XIcon } from "@phosphor-icons/react";

interface RecentEntriesProps {
  entries: SymptomLog[];
}

export function RecentEntries({ entries }: RecentEntriesProps) {
  const [confirmingId, setConfirmingId] = useState<number | null>(null);
  const deleteMutation = useDeleteSymptomLog();

  function handleDelete(id: number) {
    deleteMutation.mutate(id, {
      onSettled: () => setConfirmingId(null),
    });
  }

  if (entries.length === 0) {
    return (
      <div className="lg:sticky lg:top-20">
        <EmptyState
          title="No entries yet"
          description="Log your first symptom entry"
        />
      </div>
    );
  }

  return (
    <div className="lg:sticky lg:top-20 space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">
        Recent Entries
      </h3>
      {entries.slice(0, 7).map((entry) => (
        <Card key={entry.id} className="p-0 group">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {format(parseISO(entry.date), "MMM d")}
              </span>
              <div className="flex items-center gap-1">
                {entry.is_flare && (
                  <Badge variant="destructive" className="text-xs">
                    Flare
                  </Badge>
                )}
                {confirmingId === entry.id ? (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => handleDelete(entry.id)}
                      disabled={deleteMutation.isPending}
                    >
                      {deleteMutation.isPending ? "..." : "Delete"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => setConfirmingId(null)}
                    >
                      <XIcon className="h-3 w-3" weight="bold" />
                    </Button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmingId(entry.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive p-1 rounded"
                  >
                    <TrashIcon className="h-3.5 w-3.5" weight="duotone" />
                  </button>
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
