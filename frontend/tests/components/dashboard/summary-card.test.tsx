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
    expect(screen.getByText("4.5")).toBeInTheDocument();
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
    // Only the value span should exist in the flex container, no unit span
    const valueContainer = container.querySelector(".flex.items-baseline");
    const spans = valueContainer?.querySelectorAll("span");
    // Should have just the value span, no unit span
    expect(spans?.length).toBe(1);
  });

  it("shows up arrow trend indicator for 'up' trend", () => {
    render(<SummaryCard title="Pain" value={6} trend="up" />);
    expect(screen.getByText(/↑/)).toBeInTheDocument();
  });

  it("shows down arrow trend indicator for 'down' trend", () => {
    render(<SummaryCard title="Pain" value={3} trend="down" />);
    expect(screen.getByText(/↓/)).toBeInTheDocument();
  });

  it("shows right arrow trend indicator for 'stable' trend", () => {
    render(<SummaryCard title="Pain" value={4} trend="stable" />);
    expect(screen.getByText(/→/)).toBeInTheDocument();
  });

  it("applies red color class for 'up' trend", () => {
    const { container } = render(
      <SummaryCard title="Pain" value={6} trend="up" />
    );
    const trendSpan = container.querySelector(".text-red-500");
    expect(trendSpan).toBeInTheDocument();
  });

  it("applies green color class for 'down' trend", () => {
    const { container } = render(
      <SummaryCard title="Pain" value={3} trend="down" />
    );
    const trendSpan = container.querySelector(".text-green-500");
    expect(trendSpan).toBeInTheDocument();
  });

  it("does not render trend indicator when trend is not provided", () => {
    render(<SummaryCard title="Pain" value={5} />);
    expect(screen.queryByText(/↑/)).not.toBeInTheDocument();
    expect(screen.queryByText(/↓/)).not.toBeInTheDocument();
    expect(screen.queryByText(/→/)).not.toBeInTheDocument();
  });
});
