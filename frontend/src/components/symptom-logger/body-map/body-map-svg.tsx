"use client";

import { FRONT_BODY_OUTLINE, BACK_BODY_OUTLINE, getRegionsForView } from "./body-map-paths";
import { BodyMapRegion } from "./body-map-region";

interface BodyMapSvgProps {
  view: "front" | "back";
  selected: string[];
  severityMap: Record<string, number>;
  onToggle: (key: string) => void;
}

export function BodyMapSvg({ view, selected, severityMap, onToggle }: BodyMapSvgProps) {
  const regions = getRegionsForView(view);
  const outline = view === "front" ? FRONT_BODY_OUTLINE : BACK_BODY_OUTLINE;

  return (
    <svg
      viewBox="0 0 200 440"
      className="mx-auto h-auto w-full max-w-[220px]"
      aria-label="Body map for selecting pain locations"
    >
      {/* Background body outline */}
      <path
        d={outline}
        fill="none"
        stroke="hsl(0, 0%, 75%)"
        strokeWidth={0.8}
      />

      {/* Center dividing line */}
      <line
        x1={100}
        y1={50}
        x2={100}
        y2={425}
        stroke="hsl(0, 0%, 80%)"
        strokeWidth={0.5}
        strokeDasharray="4 3"
      />

      {/* L / R labels */}
      <text
        x={155}
        y={72}
        textAnchor="middle"
        fontSize={10}
        fill="hsl(0, 0%, 55%)"
        fontWeight={600}
      >
        L
      </text>
      <text
        x={45}
        y={72}
        textAnchor="middle"
        fontSize={10}
        fill="hsl(0, 0%, 55%)"
        fontWeight={600}
      >
        R
      </text>

      {/* Clickable regions */}
      {regions.map((region) => (
        <BodyMapRegion
          key={region.id}
          d={region.d}
          label={region.label}
          active={selected.includes(region.locationKey)}
          severity={severityMap[region.locationKey]}
          onClick={() => onToggle(region.locationKey)}
        />
      ))}
    </svg>
  );
}
