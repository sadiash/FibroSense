import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { CorrelationHeatmap } from "@/components/correlations/correlation-heatmap";
import type { CorrelationResult } from "@/lib/types";

// Mock d3 to avoid jsdom SVG limitations
vi.mock("d3", () => ({
  select: vi.fn(() => {
    const chainable: Record<string, unknown> = {};
    const chain = () => chainable;
    chainable.selectAll = vi.fn(() => chainable);
    chainable.remove = vi.fn(() => chainable);
    chainable.attr = vi.fn(() => chainable);
    chainable.append = vi.fn(() => chainable);
    chainable.data = vi.fn(() => chainable);
    chainable.join = vi.fn(() => chainable);
    chainable.text = vi.fn(() => chainable);
    chainable.style = vi.fn(() => chainable);
    chainable.on = vi.fn(() => chainable);
    return chainable;
  }),
  scaleSequential: vi.fn(() => {
    const scale = (val: number) => `rgb(0,0,0)`;
    scale.domain = vi.fn(() => scale);
    return scale;
  }),
  interpolateRdBu: vi.fn(),
}));

function makeCorrelation(
  overrides: Partial<CorrelationResult> = {}
): CorrelationResult {
  return {
    metric_a: "pain_severity",
    metric_b: "fatigue_severity",
    lag_days: 0,
    correlation_coefficient: 0.75,
    p_value: 0.001,
    sample_size: 30,
    method: "spearman",
    ...overrides,
  };
}

describe("CorrelationHeatmap", () => {
  it("renders the card with title", () => {
    const correlations = [makeCorrelation()];
    render(<CorrelationHeatmap correlations={correlations} />);
    expect(screen.getByText("Correlation Matrix")).toBeInTheDocument();
  });

  it("renders an SVG element", () => {
    const correlations = [makeCorrelation()];
    const { container } = render(
      <CorrelationHeatmap correlations={correlations} />
    );
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("renders with empty correlations without crashing", () => {
    const { container } = render(
      <CorrelationHeatmap correlations={[]} />
    );
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("accepts an onCellClick callback", () => {
    const onCellClick = vi.fn();
    const correlations = [makeCorrelation()];
    const { container } = render(
      <CorrelationHeatmap
        correlations={correlations}
        onCellClick={onCellClick}
      />
    );
    // Verify it renders without errors when callback is provided
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("shows loading skeleton when isLoading is true", () => {
    render(
      <CorrelationHeatmap correlations={[]} isLoading={true} />
    );
    // When loading, the card title should not be visible (ChartSkeleton renders instead)
    expect(
      screen.queryByText("Correlation Matrix")
    ).not.toBeInTheDocument();
  });

  it("does not show loading skeleton when isLoading is false", () => {
    const correlations = [makeCorrelation()];
    render(
      <CorrelationHeatmap correlations={correlations} isLoading={false} />
    );
    expect(screen.getByText("Correlation Matrix")).toBeInTheDocument();
  });
});
