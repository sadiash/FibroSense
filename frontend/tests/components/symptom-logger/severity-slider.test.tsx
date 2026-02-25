import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SeveritySlider } from "@/components/symptom-logger/severity-slider";

describe("SeveritySlider", () => {
  it("renders the label", () => {
    render(
      <SeveritySlider label="Pain Severity" value={5} onChange={vi.fn()} />
    );
    expect(screen.getByText("Pain Severity")).toBeInTheDocument();
  });

  it("renders the current value", () => {
    render(
      <SeveritySlider label="Pain Severity" value={7} onChange={vi.fn()} />
    );
    expect(screen.getByText("7")).toBeInTheDocument();
  });

  it("renders min and max labels with defaults 0 and 10", () => {
    render(
      <SeveritySlider label="Pain Severity" value={3} onChange={vi.fn()} />
    );
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
  });

  it("renders custom min and max labels", () => {
    render(
      <SeveritySlider
        label="Custom"
        value={3}
        onChange={vi.fn()}
        min={1}
        max={5}
      />
    );
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("has a slider element present", () => {
    render(
      <SeveritySlider label="Pain Severity" value={5} onChange={vi.fn()} />
    );
    // Radix slider renders with role="slider"
    const slider = screen.getByRole("slider");
    expect(slider).toBeInTheDocument();
  });

  it("applies green color class for low severity values", () => {
    const { container } = render(
      <SeveritySlider label="Test" value={2} onChange={vi.fn()} />
    );
    const valueSpan = container.querySelector(".text-green-500");
    expect(valueSpan).toBeInTheDocument();
    expect(valueSpan?.textContent).toBe("2");
  });

  it("applies red color class for high severity values", () => {
    const { container } = render(
      <SeveritySlider label="Test" value={9} onChange={vi.fn()} />
    );
    const valueSpan = container.querySelector(".text-red-500");
    expect(valueSpan).toBeInTheDocument();
    expect(valueSpan?.textContent).toBe("9");
  });
});
