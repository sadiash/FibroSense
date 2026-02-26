import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { CorrelationHeatmap } from "@/components/correlations/correlation-heatmap";
import type { CorrelationResult } from "@/lib/types";

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

  it("renders a table element with correlations", () => {
    const correlations = [makeCorrelation()];
    const { container } = render(
      <CorrelationHeatmap correlations={correlations} />
    );
    const table = container.querySelector("table");
    expect(table).toBeInTheDocument();
  });

  it("renders with empty correlations without crashing", () => {
    render(<CorrelationHeatmap correlations={[]} />);
    // Shows empty state message
    expect(
      screen.getByText(/No correlation data yet/)
    ).toBeInTheDocument();
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
    expect(container.querySelector("table")).toBeInTheDocument();
  });

  it("shows loading skeleton when isLoading is true", () => {
    render(
      <CorrelationHeatmap correlations={[]} isLoading={true} />
    );
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
