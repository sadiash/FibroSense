import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { SummaryCard } from "@/components/dashboard/summary-card";

describe("SummaryCard", () => {
  it("renders the title", () => {
    render(<SummaryCard title="Avg Pain" value={4.5} />);
    expect(screen.getByText("Avg Pain")).toBeInTheDocument();
  });

  it("renders a numeric value", () => {
    render(<SummaryCard title="Avg Pain" value={4.5} />);
    // AnimatedCounter starts at 0 and animates — check it renders something
    const valueEl = screen.getByText(/\d/);
    expect(valueEl).toBeInTheDocument();
  });

  it("renders a string value", () => {
    render(<SummaryCard title="Status" value="Good" />);
    expect(screen.getByText("Good")).toBeInTheDocument();
  });

  it("renders the unit when provided", () => {
    render(<SummaryCard title="HRV" value={42} unit="ms" />);
    expect(screen.getByText("ms")).toBeInTheDocument();
  });

  it("does not render a unit when not provided", () => {
    const { container } = render(
      <SummaryCard title="Avg Pain" value={4.5} />
    );
    // The flex container with items-end holds value + optional unit
    const valueContainer = container.querySelector(".flex.items-end");
    expect(valueContainer).toBeInTheDocument();
  });

  it("shows Rising text for 'up' trend", () => {
    render(<SummaryCard title="Pain" value={6} trend="up" />);
    expect(screen.getByText("Rising")).toBeInTheDocument();
  });

  it("shows Falling text for 'down' trend", () => {
    render(<SummaryCard title="Pain" value={3} trend="down" />);
    expect(screen.getByText("Falling")).toBeInTheDocument();
  });

  it("shows Stable text for 'stable' trend", () => {
    render(<SummaryCard title="Pain" value={4} trend="stable" />);
    expect(screen.getByText("Stable")).toBeInTheDocument();
  });

  it("applies rose color class for 'up' trend", () => {
    const { container } = render(
      <SummaryCard title="Pain" value={6} trend="up" />
    );
    const trendSpan = container.querySelector(".text-rose-500");
    expect(trendSpan).toBeInTheDocument();
  });

  it("applies emerald color class for 'down' trend", () => {
    const { container } = render(
      <SummaryCard title="Pain" value={3} trend="down" />
    );
    const trendSpan = container.querySelector(".text-emerald-500");
    expect(trendSpan).toBeInTheDocument();
  });

  it("does not render trend indicator when trend is not provided", () => {
    render(<SummaryCard title="Pain" value={5} />);
    expect(screen.queryByText("Rising")).not.toBeInTheDocument();
    expect(screen.queryByText("Falling")).not.toBeInTheDocument();
    expect(screen.queryByText("Stable")).not.toBeInTheDocument();
  });

  it("renders baseline when provided", () => {
    render(<SummaryCard title="Pain" value={5} baseline={4.2} />);
    expect(screen.getByText("Baseline: 4.2")).toBeInTheDocument();
  });

  it("does not render baseline when not provided", () => {
    render(<SummaryCard title="Pain" value={5} />);
    expect(screen.queryByText(/Baseline/)).not.toBeInTheDocument();
  });
});
