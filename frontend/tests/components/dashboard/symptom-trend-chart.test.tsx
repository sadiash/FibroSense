import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SymptomTrendChart } from "@/components/dashboard/symptom-trend-chart";
import type { SymptomLog } from "@/lib/types";

// Mock recharts to avoid SVG rendering issues in jsdom
vi.mock("recharts", () => {
  const MockResponsiveContainer = ({
    children,
  }: {
    children: React.ReactNode;
  }) => (
    <div data-testid="responsive-container" style={{ width: 500, height: 300 }}>
      {children}
    </div>
  );
  const MockLineChart = ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="line-chart">{children}</div>
  );
  const MockLine = () => <div data-testid="chart-line" />;
  const MockXAxis = () => <div data-testid="x-axis" />;
  const MockYAxis = () => <div data-testid="y-axis" />;
  const MockCartesianGrid = () => <div data-testid="cartesian-grid" />;
  const MockTooltip = () => <div data-testid="tooltip" />;
  const MockLegend = () => <div data-testid="legend" />;

  return {
    ResponsiveContainer: MockResponsiveContainer,
    LineChart: MockLineChart,
    Line: MockLine,
    XAxis: MockXAxis,
    YAxis: MockYAxis,
    CartesianGrid: MockCartesianGrid,
    Tooltip: MockTooltip,
    Legend: MockLegend,
  };
});

function makeLog(overrides: Partial<SymptomLog> = {}): SymptomLog {
  return {
    id: 1,
    date: "2025-06-10",
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
    created_at: "2025-06-10T10:00:00Z",
    updated_at: "2025-06-10T10:00:00Z",
    ...overrides,
  };
}

describe("SymptomTrendChart", () => {
  it("shows empty state when no logs are provided", () => {
    render(<SymptomTrendChart logs={[]} />);
    expect(screen.getByText("No symptom data")).toBeInTheDocument();
    expect(
      screen.getByText("Log symptoms to see trends")
    ).toBeInTheDocument();
  });

  it("renders the chart container when logs are provided", () => {
    const logs = [makeLog()];
    render(<SymptomTrendChart logs={logs} />);
    expect(screen.getByText("Symptom Trends")).toBeInTheDocument();
  });

  it("renders the chart elements with log data", () => {
    const logs = [
      makeLog({ id: 1, date: "2025-06-10" }),
      makeLog({ id: 2, date: "2025-06-11" }),
    ];
    render(<SymptomTrendChart logs={logs} />);
    expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
  });

  it("does not render chart when isLoading is true", () => {
    const logs = [makeLog()];
    render(<SymptomTrendChart logs={logs} isLoading={true} />);
    // When loading, the ChartSkeleton is shown, not the chart title
    expect(screen.queryByText("Symptom Trends")).not.toBeInTheDocument();
  });
});
