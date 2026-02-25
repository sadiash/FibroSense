import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { RecentEntries } from "@/components/symptom-logger/recent-entries";
import type { SymptomLog } from "@/lib/types";

function makeEntry(overrides: Partial<SymptomLog> = {}): SymptomLog {
  return {
    id: 1,
    date: "2025-06-15",
    pain_severity: 6,
    pain_locations: [
      { location: "left_shoulder", severity: 6, descriptors: [], note: null },
      { location: "lower_back", severity: 5, descriptors: [], note: null },
    ],
    fatigue_severity: 7,
    brain_fog: 4,
    mood: 5,
    is_flare: false,
    flare_severity: null,
    notes: null,
    missed_medications: null,
    menstrual_phase: null,
    stress_event: null,
    medication_change: null,
    exercise_type: null,
    exercise_rpe: null,
    created_at: "2025-06-15T10:00:00Z",
    updated_at: "2025-06-15T10:00:00Z",
    ...overrides,
  };
}

describe("RecentEntries", () => {
  it("shows empty state when no entries are provided", () => {
    render(<RecentEntries entries={[]} />);
    expect(screen.getByText("No entries yet")).toBeInTheDocument();
    expect(
      screen.getByText("Log your first symptom entry above")
    ).toBeInTheDocument();
  });

  it("renders entries with formatted date", () => {
    const entries = [makeEntry({ date: "2025-06-15" })];
    render(<RecentEntries entries={entries} />);
    expect(screen.getByText("Jun 15")).toBeInTheDocument();
  });

  it("displays pain, fatigue, fog, and mood values", () => {
    const entries = [
      makeEntry({
        pain_severity: 6,
        fatigue_severity: 7,
        brain_fog: 4,
        mood: 5,
      }),
    ];
    render(<RecentEntries entries={entries} />);
    expect(screen.getByText("Pain: 6")).toBeInTheDocument();
    expect(screen.getByText("Fatigue: 7")).toBeInTheDocument();
    expect(screen.getByText("Fog: 4")).toBeInTheDocument();
    expect(screen.getByText("Mood: 5")).toBeInTheDocument();
  });

  it("shows severity per location badge", () => {
    const entries = [
      makeEntry({
        pain_locations: [
          { location: "neck", severity: 7, descriptors: [], note: null },
        ],
      }),
    ];
    render(<RecentEntries entries={entries} />);
    expect(screen.getByText("Neck (7)")).toBeInTheDocument();
  });

  it("shows the Flare badge for flare entries", () => {
    const entries = [makeEntry({ is_flare: true })];
    render(<RecentEntries entries={entries} />);
    expect(screen.getByText("Flare")).toBeInTheDocument();
  });

  it("does not show Flare badge for non-flare entries", () => {
    const entries = [makeEntry({ is_flare: false })];
    render(<RecentEntries entries={entries} />);
    expect(screen.queryByText("Flare")).not.toBeInTheDocument();
  });

  it("renders multiple entries", () => {
    const entries = [
      makeEntry({ id: 1, date: "2025-06-15" }),
      makeEntry({ id: 2, date: "2025-06-14" }),
      makeEntry({ id: 3, date: "2025-06-13" }),
    ];
    render(<RecentEntries entries={entries} />);
    expect(screen.getByText("Jun 15")).toBeInTheDocument();
    expect(screen.getByText("Jun 14")).toBeInTheDocument();
    expect(screen.getByText("Jun 13")).toBeInTheDocument();
  });

  it("renders the 'Recent Entries' heading when entries exist", () => {
    const entries = [makeEntry()];
    render(<RecentEntries entries={entries} />);
    expect(screen.getByText("Recent Entries")).toBeInTheDocument();
  });

  it("limits display to 7 entries", () => {
    const entries = Array.from({ length: 10 }, (_, i) =>
      makeEntry({ id: i + 1, date: `2025-06-${String(15 - i).padStart(2, "0")}` })
    );
    render(<RecentEntries entries={entries} />);
    // Should show first 7 entries (Jun 15 through Jun 9)
    expect(screen.getByText("Jun 15")).toBeInTheDocument();
    expect(screen.getByText("Jun 9")).toBeInTheDocument();
    // Jun 8 should not render (8th entry, index 7)
    expect(screen.queryByText("Jun 8")).not.toBeInTheDocument();
  });
});
