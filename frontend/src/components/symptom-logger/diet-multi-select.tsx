"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DIET_FLAGS, DIET_FLAG_LABELS, type DietFlag } from "@/lib/types";
import { cn } from "@/lib/utils";

interface DietMultiSelectProps {
  selected: string[];
  onChange: (items: string[]) => void;
}

export function DietMultiSelect({
  selected,
  onChange,
}: DietMultiSelectProps) {
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
            <span className="text-muted-foreground">Select diet flags...</span>
          ) : (
            <span>{selected.length} selected</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3" align="start">
        <div className="flex flex-wrap gap-2">
          {DIET_FLAGS.map((flag) => (
            <Badge
              key={flag}
              variant={selected.includes(flag) ? "default" : "outline"}
              className={cn(
                "cursor-pointer select-none px-2.5 py-1 text-xs transition-colors",
                selected.includes(flag) && "bg-primary text-primary-foreground"
              )}
              onClick={() => toggle(flag)}
            >
              {DIET_FLAG_LABELS[flag as DietFlag]}
            </Badge>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
