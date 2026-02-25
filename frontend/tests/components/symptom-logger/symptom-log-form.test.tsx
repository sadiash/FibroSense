import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { format } from "date-fns";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { SymptomLogForm } from "@/components/symptom-logger/symptom-log-form";

// Mock medications API so MissedMedicationChecklist can render
vi.mock("@/lib/api", () => ({
  getMedications: vi.fn().mockResolvedValue([]),
  createMedication: vi.fn(),
  deleteMedication: vi.fn(),
  getSymptomLogs: vi.fn().mockResolvedValue([]),
  createSymptomLog: vi.fn(),
}));

function renderWithQueryClient(ui: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

describe("SymptomLogForm", () => {
  it("renders the form title", () => {
    renderWithQueryClient(<SymptomLogForm onSubmit={vi.fn()} />);
    expect(screen.getByText("Log Symptoms")).toBeInTheDocument();
  });

  it("renders the date input", () => {
    renderWithQueryClient(<SymptomLogForm onSubmit={vi.fn()} />);
    expect(screen.getByLabelText("Date")).toBeInTheDocument();
  });

  it("date input defaults to today", () => {
    renderWithQueryClient(<SymptomLogForm onSubmit={vi.fn()} />);
    const dateInput = screen.getByLabelText("Date") as HTMLInputElement;
    const today = format(new Date(), "yyyy-MM-dd");
    expect(dateInput.value).toBe(today);
  });

  it("renders severity sliders (fatigue, brain fog, mood)", () => {
    renderWithQueryClient(<SymptomLogForm onSubmit={vi.fn()} />);
    expect(screen.getByText("Fatigue")).toBeInTheDocument();
    expect(screen.getByText("Brain Fog")).toBeInTheDocument();
    expect(screen.getByText("Mood")).toBeInTheDocument();
  });

  it("renders the pain locations selector", () => {
    renderWithQueryClient(<SymptomLogForm onSubmit={vi.fn()} />);
    expect(screen.getByText("Pain Locations")).toBeInTheDocument();
  });

  it("renders the flare day toggle", () => {
    renderWithQueryClient(<SymptomLogForm onSubmit={vi.fn()} />);
    expect(screen.getByText("Flare Day")).toBeInTheDocument();
  });

  it("renders the submit button with 'Save Entry' text", () => {
    renderWithQueryClient(<SymptomLogForm onSubmit={vi.fn()} />);
    expect(
      screen.getByRole("button", { name: /save entry/i })
    ).toBeInTheDocument();
  });

  it("shows 'Saving...' when isSubmitting is true", () => {
    renderWithQueryClient(
      <SymptomLogForm onSubmit={vi.fn()} isSubmitting={true} />
    );
    const button = screen.getByRole("button", { name: /saving/i });
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
  });

  it("calls onSubmit when the form is submitted", () => {
    const onSubmit = vi.fn();
    renderWithQueryClient(<SymptomLogForm onSubmit={onSubmit} />);

    const button = screen.getByRole("button", { name: /save entry/i });
    fireEvent.click(button);

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const callArg = onSubmit.mock.calls[0][0];
    expect(callArg).toHaveProperty("date");
    expect(callArg).toHaveProperty("pain_severity");
    expect(callArg).toHaveProperty("fatigue_severity");
    expect(callArg).toHaveProperty("brain_fog");
    expect(callArg).toHaveProperty("mood");
    expect(callArg).toHaveProperty("is_flare");
    expect(callArg).toHaveProperty("pain_locations");
    // pain_locations should be an array (of PainLocationEntry objects)
    expect(Array.isArray(callArg.pain_locations)).toBe(true);
  });

  it("renders notes input", () => {
    renderWithQueryClient(<SymptomLogForm onSubmit={vi.fn()} />);
    expect(screen.getByLabelText(/notes/i)).toBeInTheDocument();
  });

  it("hides missed medications when no medications configured", () => {
    renderWithQueryClient(<SymptomLogForm onSubmit={vi.fn()} />);
    // When no medications exist, the checklist renders nothing
    expect(screen.queryByText("Missed Medications")).not.toBeInTheDocument();
  });
});
