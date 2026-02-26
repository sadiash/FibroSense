import type {
  AppSetting,
  AuthTokens,
  BiometricReading,
  ContextualData,
  CorrelationResult,
  LoginCredentials,
  Medication,
  MedicationCreate,
  RegisterData,
  SymptomLog,
  SymptomLogCreate,
  User,
} from "./types";

// ─── Token Management ───────────────────────────────────────────────────────

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

// ─── Refresh Mutex ──────────────────────────────────────────────────────────

let refreshPromise: Promise<AuthTokens> | null = null;

// ─── Core Fetch ─────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string>),
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const res = await fetch(path, {
    ...init,
    headers,
    credentials: "include",
  });

  // Auto-retry once on 401 via token refresh
  if (res.status === 401 && accessToken) {
    try {
      const refreshed = await refreshAccessToken();
      setAccessToken(refreshed.access_token);

      const retryHeaders: Record<string, string> = {
        "Content-Type": "application/json",
        ...(init?.headers as Record<string, string>),
        Authorization: `Bearer ${refreshed.access_token}`,
      };

      const retryRes = await fetch(path, {
        ...init,
        headers: retryHeaders,
        credentials: "include",
      });

      if (!retryRes.ok) {
        const detail = await retryRes.text().catch(() => retryRes.statusText);
        throw new Error(`API error ${retryRes.status}: ${detail}`);
      }

      return retryRes.json();
    } catch {
      // Refresh failed — clear token and throw original error
      setAccessToken(null);
      const detail = await res.text().catch(() => res.statusText);
      throw new Error(`API error ${res.status}: ${detail}`);
    }
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => res.statusText);
    throw new Error(`API error ${res.status}: ${detail}`);
  }

  return res.json();
}

// ─── Auth API ───────────────────────────────────────────────────────────────

export async function login(credentials: LoginCredentials): Promise<AuthTokens> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
    credentials: "include",
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => res.statusText);
    throw new Error(`API error ${res.status}: ${detail}`);
  }

  const data: AuthTokens = await res.json();
  setAccessToken(data.access_token);
  return data;
}

export async function register(data: RegisterData): Promise<AuthTokens> {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include",
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => res.statusText);
    throw new Error(`API error ${res.status}: ${detail}`);
  }

  const result: AuthTokens = await res.json();
  setAccessToken(result.access_token);
  return result;
}

export async function refreshAccessToken(): Promise<AuthTokens> {
  // Mutex: if a refresh is already in-flight, wait for it
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const res = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Refresh failed");
      }

      const data: AuthTokens = await res.json();
      setAccessToken(data.access_token);
      return data;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function logout(): Promise<void> {
  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
  } finally {
    setAccessToken(null);
  }
}

export async function getMe(): Promise<User> {
  return apiFetch<User>("/api/auth/me");
}

// ─── Symptom Logs ───────────────────────────────────────────────────────────

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

export async function deleteSymptomLog(id: number): Promise<void> {
  await apiFetch<void>(`/api/symptoms/${id}`, { method: "DELETE" });
}

// ─── Medications ────────────────────────────────────────────────────────────

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
  await apiFetch<void>(`/api/medications/${id}`, { method: "DELETE" });
}

// ─── Biometrics ─────────────────────────────────────────────────────────────

export async function getBiometrics(): Promise<BiometricReading[]> {
  return apiFetch<BiometricReading[]>("/api/biometrics");
}

// ─── Contextual Data ────────────────────────────────────────────────────────

export async function getContextualData(): Promise<ContextualData[]> {
  return apiFetch<ContextualData[]>("/api/contextual");
}

// ─── Correlations ───────────────────────────────────────────────────────────

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

// ─── Settings ───────────────────────────────────────────────────────────────

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

// ─── Sync ───────────────────────────────────────────────────────────────────

export async function triggerSync(
  source: "oura" | "weather"
): Promise<{ status: string; records_synced: number; error_message: string | null }> {
  return apiFetch(`/api/sync/${source}`, { method: "POST" });
}

// ─── Demo Data ──────────────────────────────────────────────────────────────

export interface DemoDataStatus {
  has_demo_data: boolean;
  biometric_readings_count: number;
  symptom_logs_count: number;
  contextual_data_count: number;
  medications_count: number;
  sync_log_count: number;
}

export interface DemoDataClearResult {
  status: string;
  records_deleted: number;
  error_message: string | null;
}

export async function getDemoDataStatus(): Promise<DemoDataStatus> {
  return apiFetch<DemoDataStatus>("/api/demo-data/status");
}

export async function clearDemoData(): Promise<DemoDataClearResult> {
  return apiFetch<DemoDataClearResult>("/api/demo-data", { method: "DELETE" });
}

// ─── Export ─────────────────────────────────────────────────────────────────

export async function exportData(
  format: "csv" | "json",
  startDate?: string,
  endDate?: string
): Promise<Blob> {
  const params = new URLSearchParams({ format });
  if (startDate) params.set("start_date", startDate);
  if (endDate) params.set("end_date", endDate);

  const headers: Record<string, string> = {};
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const res = await fetch(`/api/export?${params}`, {
    headers,
    credentials: "include",
  });
  if (!res.ok) throw new Error(`Export failed: ${res.statusText}`);
  return res.blob();
}
