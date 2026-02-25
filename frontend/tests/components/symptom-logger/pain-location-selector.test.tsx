import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { PainLocationSelector } from "@/components/symptom-logger/pain-location-selector";
import type { PainLocationEntry } from "@/lib/types";

function makeEntry(location: string, severity = 5): PainLocationEntry {
  return { location, severity, descriptors: [], note: null };
}

describe("PainLocationSelector (Body Map)", () => {
  it("renders the 'Pain Locations' label", () => {
    render(<PainLocationSelector entries={[]} onChange={vi.fn()} />);
    expect(screen.getByText("Pain Locations")).toBeInTheDocument();
  });

  it("renders the body map SVG", () => {
    render(<PainLocationSelector entries={[]} onChange={vi.fn()} />);
    expect(
      screen.getByLabelText("Body map for selecting pain locations")
    ).toBeInTheDocument();
  });

  it("renders clickable SVG regions with aria-labels", () => {
    render(<PainLocationSelector entries={[]} onChange={vi.fn()} />);
    expect(screen.getByLabelText("Forehead")).toBeInTheDocument();
    expect(screen.getByLabelText("Neck")).toBeInTheDocument();
    expect(screen.getByLabelText("L Shoulder")).toBeInTheDocument();
    expect(screen.getByLabelText("R Shoulder")).toBeInTheDocument();
  });

  it("clicking a region calls onChange with entry added", () => {
    const onChange = vi.fn();
    render(<PainLocationSelector entries={[]} onChange={onChange} />);

    fireEvent.click(screen.getByLabelText("Forehead"));
    expect(onChange).toHaveBeenCalledWith([
      { location: "forehead", severity: 5, descriptors: [], note: null },
    ]);
  });

  it("clicking a selected region that is active calls onChange with it removed", () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <PainLocationSelector
        entries={[makeEntry("forehead"), makeEntry("neck")]}
        onChange={onChange}
      />
    );

    // First click activates forehead (no removal)
    fireEvent.click(screen.getByLabelText("Forehead"));
    expect(onChange).not.toHaveBeenCalled();

    // Simulate parent re-render with same entries (now forehead is active internally)
    rerender(
      <PainLocationSelector
        entries={[makeEntry("forehead"), makeEntry("neck")]}
        onChange={onChange}
      />
    );

    // Second click on already-active region deselects it
    fireEvent.click(screen.getByLabelText("Forehead"));
    expect(onChange).toHaveBeenCalledWith([makeEntry("neck")]);
  });

  it("selected regions have aria-pressed=true", () => {
    render(
      <PainLocationSelector
        entries={[makeEntry("left_shoulder")]}
        onChange={vi.fn()}
      />
    );
    const region = screen.getByLabelText("L Shoulder");
    expect(region).toHaveAttribute("aria-pressed", "true");
  });

  it("renders the Widespread toggle badge", () => {
    render(<PainLocationSelector entries={[]} onChange={vi.fn()} />);
    expect(screen.getByText("Widespread")).toBeInTheDocument();
  });

  it("clicking Widespread toggles it", () => {
    const onChange = vi.fn();
    render(<PainLocationSelector entries={[]} onChange={onChange} />);

    fireEvent.click(screen.getByText("Widespread"));
    expect(onChange).toHaveBeenCalledWith([
      { location: "widespread", severity: 5, descriptors: [], note: null },
    ]);
  });

  it("shows detail card for clicked region and chips for others", () => {
    render(
      <PainLocationSelector
        entries={[makeEntry("forehead"), makeEntry("left_upper_arm")]}
        onChange={vi.fn()}
      />
    );
    // With no active location, both should appear as chips in "Selected locations"
    expect(screen.getByText("Selected locations")).toBeInTheDocument();
    // Both labels should still be present (as chip text)
    expect(screen.getByText("Forehead")).toBeInTheDocument();
    expect(screen.getByText("L Upper Arm")).toBeInTheDocument();
  });

  it("selecting a region clears widespread", () => {
    const onChange = vi.fn();
    render(
      <PainLocationSelector
        entries={[makeEntry("widespread")]}
        onChange={onChange}
      />
    );

    fireEvent.click(screen.getByLabelText("Forehead"));
    expect(onChange).toHaveBeenCalledWith([
      { location: "forehead", severity: 5, descriptors: [], note: null },
    ]);
  });

  it("selecting widespread clears individual regions", () => {
    const onChange = vi.fn();
    render(
      <PainLocationSelector
        entries={[makeEntry("forehead"), makeEntry("neck")]}
        onChange={onChange}
      />
    );

    fireEvent.click(screen.getByText("Widespread"));
    expect(onChange).toHaveBeenCalledWith([
      { location: "widespread", severity: 5, descriptors: [], note: null },
    ]);
  });

  it("renders Front and Back tabs", () => {
    render(<PainLocationSelector entries={[]} onChange={vi.fn()} />);
    expect(screen.getByText("Front")).toBeInTheDocument();
    expect(screen.getByText("Back")).toBeInTheDocument();
  });

  it("switching to Back tab shows back-specific regions", async () => {
    const user = userEvent.setup();
    render(<PainLocationSelector entries={[]} onChange={vi.fn()} />);

    // Front view should not show back-only regions
    expect(screen.queryByLabelText("Upper Back")).not.toBeInTheDocument();

    // Switch to back view
    await user.click(screen.getByRole("tab", { name: "Back" }));
    expect(screen.getByLabelText("Upper Back")).toBeInTheDocument();
    expect(screen.getByLabelText("Lower Back")).toBeInTheDocument();
    expect(screen.getByLabelText("L Calf")).toBeInTheDocument();
  });

  it("entries from both views coexist", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    // Start with a front-view entry
    const entries = [makeEntry("forehead")];
    render(
      <PainLocationSelector entries={entries} onChange={onChange} />
    );

    // Switch to back tab and click a back region
    await user.click(screen.getByRole("tab", { name: "Back" }));
    await user.click(screen.getByLabelText("Upper Back"));

    // Should add upper_back alongside existing forehead
    expect(onChange).toHaveBeenCalledWith([
      makeEntry("forehead"),
      { location: "upper_back", severity: 5, descriptors: [], note: null },
    ]);
  });

  // New tests for side-by-side behavior

  it("clicking a region activates it and shows its detail card", () => {
    const onChange = vi.fn();
    onChange.mockImplementation(() => {});
    const { rerender } = render(
      <PainLocationSelector entries={[]} onChange={onChange} />
    );

    fireEvent.click(screen.getByLabelText("Forehead"));
    // onChange was called to add forehead
    expect(onChange).toHaveBeenCalledWith([
      { location: "forehead", severity: 5, descriptors: [], note: null },
    ]);

    // Re-render with the new entry (simulating parent state update)
    rerender(
      <PainLocationSelector
        entries={[makeEntry("forehead")]}
        onChange={onChange}
      />
    );

    // Detail card should be showing for forehead (the active region)
    // The detail card has a remove button with aria-label "Remove forehead"
    expect(screen.getByLabelText("Remove forehead")).toBeInTheDocument();
  });

  it("clicking a different region switches the active detail card", () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <PainLocationSelector
        entries={[makeEntry("forehead")]}
        onChange={onChange}
      />
    );

    // Click forehead to make it active first
    fireEvent.click(screen.getByLabelText("Forehead"));

    rerender(
      <PainLocationSelector
        entries={[makeEntry("forehead")]}
        onChange={onChange}
      />
    );

    // Now click neck to add it
    fireEvent.click(screen.getByLabelText("Neck"));

    // Re-render with both entries
    rerender(
      <PainLocationSelector
        entries={[makeEntry("forehead"), makeEntry("neck")]}
        onChange={onChange}
      />
    );

    // Neck detail card should be shown (active), forehead should be a chip
    expect(screen.getByLabelText("Remove neck")).toBeInTheDocument();
    // Forehead should be in chips — check "Remove Forehead" aria-label from chip
    expect(screen.getByLabelText("Remove Forehead")).toBeInTheDocument();
  });

  it("clicking a chip activates that entry", () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <PainLocationSelector
        entries={[makeEntry("forehead"), makeEntry("neck")]}
        onChange={onChange}
      />
    );

    // Initially no active — both show as chips. Click forehead chip to activate.
    // The chip has text "Forehead" — click it
    const foreheadChip = screen.getByText("Forehead");
    fireEvent.click(foreheadChip);

    rerender(
      <PainLocationSelector
        entries={[makeEntry("forehead"), makeEntry("neck")]}
        onChange={onChange}
      />
    );

    // Now forehead detail card should be active, neck should be in chips
    expect(screen.getByLabelText("Remove forehead")).toBeInTheDocument();
    expect(screen.getByText("Selected locations")).toBeInTheDocument();
  });

  it("shows empty prompt when no entries", () => {
    render(<PainLocationSelector entries={[]} onChange={vi.fn()} />);
    expect(
      screen.getByText("Click a body region to log pain details")
    ).toBeInTheDocument();
  });

  it("clicking Done collapses the active card into a chip", () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <PainLocationSelector entries={[]} onChange={onChange} />
    );

    // Add forehead
    fireEvent.click(screen.getByLabelText("Forehead"));
    rerender(
      <PainLocationSelector
        entries={[makeEntry("forehead", 7)]}
        onChange={onChange}
      />
    );

    // Detail card is active — Done button should be visible
    const doneButton = screen.getByLabelText("Done editing forehead");
    expect(doneButton).toBeInTheDocument();

    // Click Done
    fireEvent.click(doneButton);

    rerender(
      <PainLocationSelector
        entries={[makeEntry("forehead", 7)]}
        onChange={onChange}
      />
    );

    // Card should have collapsed — no detail card remove button, forehead shows as chip
    expect(screen.queryByLabelText("Remove forehead")).not.toBeInTheDocument();
    expect(screen.getByText("Forehead")).toBeInTheDocument();
    expect(screen.getByText("Selected locations")).toBeInTheDocument();
  });

  it("clicking the active region on SVG deselects it", () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <PainLocationSelector entries={[]} onChange={onChange} />
    );

    // Add forehead
    fireEvent.click(screen.getByLabelText("Forehead"));
    const addedEntries = [makeEntry("forehead")];

    rerender(
      <PainLocationSelector entries={addedEntries} onChange={onChange} />
    );

    // Forehead is now active, click it again to deselect
    onChange.mockClear();
    fireEvent.click(screen.getByLabelText("Forehead"));
    expect(onChange).toHaveBeenCalledWith([]);
  });
});
