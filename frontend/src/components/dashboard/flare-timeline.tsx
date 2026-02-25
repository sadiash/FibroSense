"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SymptomLog } from "@/lib/types";
import { format, parseISO } from "date-fns";

interface FlareTimelineProps {
  logs: SymptomLog[];
}

export function FlareTimeline({ logs }: FlareTimelineProps) {
  const flares = logs.filter((l) => l.is_flare).slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Flares</CardTitle>
      </CardHeader>
      <CardContent>
        {flares.length === 0 ? (
          <p className="text-sm text-muted-foreground">No flare events recorded</p>
        ) : (
          <div className="relative space-y-4">
            <div className="absolute left-3 top-2 bottom-2 w-px bg-border" />
            {flares.map((flare) => (
              <div key={flare.id} className="relative pl-8">
                <div className="absolute left-1.5 top-1.5 h-3 w-3 rounded-full bg-destructive" />
                <div>
                  <p className="text-sm font-medium">
                    {format(parseISO(flare.date), "MMM d, yyyy")}
                  </p>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      Severity: {flare.flare_severity}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Pain: {flare.pain_severity}
                    </Badge>
                  </div>
                  {flare.notes && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {flare.notes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
