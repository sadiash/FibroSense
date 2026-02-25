"use client";

interface BodyMapRegionProps {
  d: string;
  label: string;
  active: boolean;
  severity?: number;
  onClick: () => void;
}

/**
 * Compute fill color based on severity (1-10).
 * Hue goes from 60 (yellow) at severity 1 to 0 (red) at severity 10.
 * Opacity increases with severity.
 */
function severityFill(severity: number): string {
  const t = (severity - 1) / 9; // 0 to 1
  const hue = Math.round(60 - 60 * t); // 60 → 0
  const opacity = 0.25 + 0.45 * t; // 0.25 → 0.70
  return `hsla(${hue}, 80%, 50%, ${opacity})`;
}

function severityStroke(severity: number): string {
  const t = (severity - 1) / 9;
  const hue = Math.round(60 - 60 * t);
  return `hsl(${hue}, 80%, 45%)`;
}

export function BodyMapRegion({
  d,
  label,
  active,
  severity,
  onClick,
}: BodyMapRegionProps) {
  const fill = active && severity != null
    ? severityFill(severity)
    : active
      ? "hsla(0, 80%, 60%, 0.4)"
      : "transparent";

  const stroke = active && severity != null
    ? severityStroke(severity)
    : active
      ? "hsl(0, 80%, 60%)"
      : "hsl(0, 0%, 60%)";

  return (
    <path
      d={d}
      role="button"
      aria-pressed={active}
      aria-label={label}
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      fill={fill}
      stroke={stroke}
      strokeWidth={active ? 1.5 : 0.8}
      className="cursor-pointer outline-none transition-colors hover:fill-[hsla(0,80%,60%,0.15)] focus-visible:stroke-[hsl(0,80%,60%)] focus-visible:stroke-[1.5]"
    />
  );
}
