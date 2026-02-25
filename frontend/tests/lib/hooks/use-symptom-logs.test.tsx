import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useSymptomLogs, useCreateSymptomLog } from "@/lib/hooks/use-symptom-logs";
import type { SymptomLog, SymptomLogCreate } from "@/lib/types";

// Mock the API module
vi.mock("@/lib/api", () => ({
  getSymptomLogs: vi.fn(),
  createSymptomLog: vi.fn(),
}));

import { getSymptomLogs, createSymptomLog } from "@/lib/api";

const mockLogs: SymptomLog[] = [
  {
    id: 1,
    date: "2025-06-15",
    pain_severity: 6,
    pain_locations: [
      { location: "left_shoulder", severity: 6, descriptors: [], note: null },
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
  },
  {
    id: 2,
    date: "2025-06-14",
    pain_severity: 7,
    pain_locations: [
      { location: "lower_back", severity: 7, descriptors: ["aching"], note: null },
      { location: "left_hip", severity: 4, descriptors: [], note: null },
    ],
    fatigue_severity: 5,
    brain_fog: 3,
    mood: 6,
    is_flare: true,
    flare_severity: 7,
    notes: "Bad day",
    missed_medications: [1],
    menstrual_phase: null,
    stress_event: null,
    medication_change: null,
    exercise_type: null,
    exercise_rpe: null,
    created_at: "2025-06-14T10:00:00Z",
    updated_at: "2025-06-14T10:00:00Z",
  },
];

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

describe("useSymptomLogs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns data from the API", async () => {
    vi.mocked(getSymptomLogs).mockResolvedValue(mockLogs);

    const { result } = renderHook(() => useSymptomLogs(), {
      wrapper: createWrapper(),
    });

    // Initially loading
    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockLogs);
    expect(result.current.data).toHaveLength(2);
    expect(getSymptomLogs).toHaveBeenCalledTimes(1);
  });

  it("handles API errors gracefully", async () => {
    vi.mocked(getSymptomLogs).mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useSymptomLogs(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeDefined();
  });
});

describe("useCreateSymptomLog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls createSymptomLog API with the provided data", async () => {
    const newEntry: SymptomLogCreate = {
      date: "2025-06-16",
      pain_severity: 3,
      pain_locations: [
        { location: "head", severity: 3, descriptors: [], note: null },
      ],
      fatigue_severity: 2,
      brain_fog: 1,
      mood: 8,
      is_flare: false,
    };

    const createdLog: SymptomLog = {
      ...newEntry,
      id: 3,
      pain_severity: 3,
      flare_severity: null,
      notes: null,
      missed_medications: null,
      menstrual_phase: null,
      stress_event: null,
      medication_change: null,
      exercise_type: null,
      exercise_rpe: null,
      created_at: "2025-06-16T12:00:00Z",
      updated_at: "2025-06-16T12:00:00Z",
    };

    vi.mocked(createSymptomLog).mockResolvedValue(createdLog);

    const { result } = renderHook(() => useCreateSymptomLog(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(newEntry);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(createSymptomLog).toHaveBeenCalledWith(newEntry);
    expect(result.current.data).toEqual(createdLog);
  });

  it("handles mutation errors", async () => {
    vi.mocked(createSymptomLog).mockRejectedValue(
      new Error("Server error")
    );

    const newEntry: SymptomLogCreate = {
      date: "2025-06-16",
      pain_severity: 0,
      pain_locations: [],
      fatigue_severity: 2,
      brain_fog: 1,
      mood: 8,
      is_flare: false,
    };

    const { result } = renderHook(() => useCreateSymptomLog(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(newEntry);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeDefined();
  });
});
