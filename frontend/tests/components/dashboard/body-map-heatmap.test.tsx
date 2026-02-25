import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BodyMapHeatmap } from "@/components/dashboard/body-map-heatmap";
import type { SymptomLog } from "@/lib/types";

// Mock BodyMapSvg to avoid complex SVG rendering in jsdom
vi.mock("@/components/symptom-logger/body-map/body-map-svg", () => ({
  BodyMapSvg: ({
    view,
    selected,
    severityMap,
  }: {
    view: string;
    selected: string[];
    severityMap: Record<string, number>;
  }) => (
    <div data-testid={`body-map-${view}`} data-selected={selected.join(",")} data-severity={JSON.stringify(severityMap)} />
  ),
}));

function makeLog(overrides: Partial<SymptomLog> = {}): SymptomLog {
  return {
    id: 1,
    date: new Date().toISOString().slice(0, 10),
    pain_severity: 5,
    pain_locations: [],
    fatigue_severity: 4,
    brain_fog: 3,
    mood: 6,
    is_flare: false,
    flare_severity: null,
    notes: null,
    missed_medications: null,
    menstrual_phase: null,
    stress_event: null,
    medication_change: null,
    exercise_type: null,
    exercise_rpe: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

describe("BodyMapHeatmap", () => {
  it("shows loading skeleton when isLoading is true", () => {
    render(<BodyMapHeatmap logs={[]} isLoading={true} />);
    expect(screen.queryByText("Pain Location Heatmap")).not.toBeInTheDocument();
  });

  it("shows empty state when no logs are provided", () => {
    render(<BodyMapHeatmap logs={[]} />);
    expect(screen.getByText("No pain location data")).toBeInTheDocument();
    expect(
      screen.getByText("Log symptoms with body locations to see your heatmap")
    ).toBeInTheDocument();
  });

  it("renders both front and back body maps and card title", () => {
    const logs = [
      makeLog({
        pain_locations: [
          { location: "neck", severity: 6, descriptors: [], note: null },
        ],
      }),
    ];
    render(<BodyMapHeatmap logs={logs} />);
    expect(screen.getByText("Pain Location Heatmap")).toBeInTheDocument();
    expect(screen.getByTestId("body-map-front")).toBeInTheDocument();
    expect(screen.getByTestId("body-map-back")).toBeInTheDocument();
    expect(screen.getByText("Front")).toBeInTheDocument();
    expect(screen.getByText("Back")).toBeInTheDocument();
  });

  it("shows frequency legend entries for logged locations", () => {
    const logs = [
      makeLog({
        id: 1,
        pain_locations: [
          { location: "neck", severity: 6, descriptors: [], note: null },
          { location: "lower_back", severity: 4, descriptors: [], note: null },
        ],
      }),
      makeLog({
        id: 2,
        pain_locations: [
          { location: "neck", severity: 7, descriptors: [], note: null },
        ],
      }),
    ];
    render(<BodyMapHeatmap logs={logs} />);

    const legend = screen.getByTestId("heatmap-legend");
    expect(legend).toBeInTheDocument();
    // Neck appears in 2 logs, Lower Back in 1
    expect(screen.getByText("Neck")).toBeInTheDocument();
    expect(screen.getByText("Lower Back")).toBeInTheDocument();
  });

  it("filters logs by date range — excludes old logs", () => {
    const logs = [
      makeLog({
        id: 1,
        date: "2020-01-01",
        pain_locations: [
          { location: "neck", severity: 5, descriptors: [], note: null },
        ],
      }),
    ];
    render(<BodyMapHeatmap logs={logs} />);
    // The log is far outside the default 30-day range, so no legend entries
    expect(screen.queryByTestId("heatmap-legend")).not.toBeInTheDocument();
    expect(
      screen.getByText("No locations logged in this period")
    ).toBeInTheDocument();
  });

  it("passes selected locations and severity to both body maps", () => {
    const logs = [
      makeLog({
        pain_locations: [
          { location: "neck", severity: 5, descriptors: [], note: null },
          { location: "lower_back", severity: 4, descriptors: [], note: null },
        ],
      }),
    ];
    render(<BodyMapHeatmap logs={logs} />);

    const frontMap = screen.getByTestId("body-map-front");
    const backMap = screen.getByTestId("body-map-back");
    // Both maps receive the same selected locations
    expect(frontMap.dataset.selected).toContain("neck");
    expect(backMap.dataset.selected).toContain("lower_back");
  });
});
