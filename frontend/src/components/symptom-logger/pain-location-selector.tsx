"use client";

import { BodyMap } from "./body-map/body-map";
import type { PainLocationEntry } from "@/lib/types";

interface PainLocationSelectorProps {
  entries: PainLocationEntry[];
  onChange: (entries: PainLocationEntry[]) => void;
}

export function PainLocationSelector({
  entries,
  onChange,
}: PainLocationSelectorProps) {
  return <BodyMap entries={entries} onChange={onChange} />;
}
