import type {
  AppSetting,
  BiometricReading,
  ContextualData,
  CorrelationResult,
  Medication,
  MedicationCreate,
  SymptomLog,
  SymptomLogCreate,
} from "./types";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => res.statusText);
    throw new Error(`API error ${res.status}: ${detail}`);
  }
  return res.json();
}

// Symptom Logs
export async function getSymptomLogs(): Promise<SymptomLog[]> {
  return apiFetch<SymptomLog[]>("/api/symptoms");
}

export async function createSymptomLog(
  data: SymptomLogCreate
): Promise<SymptomLog> {
  return apiFetch<SymptomLog>("/api/symptoms", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Medications
export async function getMedications(
  activeOnly = true
): Promise<Medication[]> {
  return apiFetch<Medication[]>(
    `/api/medications?active_only=${activeOnly}`
  );
}

export async function createMedication(
  data: MedicationCreate
): Promise<Medication> {
  return apiFetch<Medication>("/api/medications", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateMedication(
  id: number,
  data: Partial<MedicationCreate & { is_active: boolean }>
): Promise<Medication> {
  return apiFetch<Medication>(`/api/medications/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteMedication(id: number): Promise<void> {
  await fetch(`/api/medications/${id}`, { method: "DELETE" });
}

// Biometrics
export async function getBiometrics(): Promise<BiometricReading[]> {
  return apiFetch<BiometricReading[]>("/api/biometrics");
}

// Contextual Data
export async function getContextualData(): Promise<ContextualData[]> {
  return apiFetch<ContextualData[]>("/api/contextual");
}

// Correlations
export async function getCorrelationMatrix(): Promise<CorrelationResult[]> {
  return apiFetch<CorrelationResult[]>("/api/correlations/matrix");
}

export async function getLaggedCorrelations(
  metricA: string,
  metricB: string,
  maxLag: number = 7
): Promise<CorrelationResult[]> {
  return apiFetch<CorrelationResult[]>(
    `/api/correlations/lagged?metric_a=${metricA}&metric_b=${metricB}&max_lag=${maxLag}`
  );
}

// Settings
export async function getSettings(): Promise<AppSetting[]> {
  return apiFetch<AppSetting[]>("/api/settings");
}

export async function updateSetting(
  key: string,
  value: string
): Promise<AppSetting> {
  return apiFetch<AppSetting>(`/api/settings/${key}`, {
    method: "PUT",
    body: JSON.stringify({ value }),
  });
}

// Sync
export async function triggerSync(
  source: "oura" | "weather"
): Promise<{ status: string; records_synced: number; error_message: string | null }> {
  return apiFetch(`/api/sync/${source}`, { method: "POST" });
}

// Export
export async function exportData(
  format: "csv" | "json",
  startDate?: string,
  endDate?: string
): Promise<Blob> {
  const params = new URLSearchParams({ format });
  if (startDate) params.set("start_date", startDate);
  if (endDate) params.set("end_date", endDate);

  const res = await fetch(`/api/export?${params}`);
  if (!res.ok) throw new Error(`Export failed: ${res.statusText}`);
  return res.blob();
}
