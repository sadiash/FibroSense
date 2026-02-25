"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { STRESS_EVENTS, STRESS_EVENT_LABELS, type StressEvent } from "@/lib/types";
import { cn } from "@/lib/utils";

interface StressMultiSelectProps {
  selected: string[];
  onChange: (items: string[]) => void;
}

export function StressMultiSelect({
  selected,
  onChange,
}: StressMultiSelectProps) {
  function toggle(key: string) {
    if (selected.includes(key)) {
      onChange(selected.filter((k) => k !== key));
    } else {
      onChange([...selected, key]);
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          type="button"
          className="w-full justify-start font-normal"
        >
          {selected.length === 0 ? (
            <span className="text-muted-foreground">Select stress events...</span>
          ) : (
            <span>{selected.length} selected</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3" align="start">
        <div className="flex flex-wrap gap-2">
          {STRESS_EVENTS.map((event) => (
            <Badge
              key={event}
              variant={selected.includes(event) ? "default" : "outline"}
              className={cn(
                "cursor-pointer select-none px-2.5 py-1 text-xs transition-colors",
                selected.includes(event) && "bg-primary text-primary-foreground"
              )}
              onClick={() => toggle(event)}
            >
              {STRESS_EVENT_LABELS[event as StressEvent]}
            </Badge>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
