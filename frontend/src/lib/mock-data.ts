import type {
  BiometricReading,
  ContextualData,
  CorrelationResult,
  PainLocationEntry,
  SymptomLog,
} from "./types";

function dateStr(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split("T")[0];
}

function rand(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 10) / 10;
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const locations = [
  "neck",
  "left_shoulder",
  "right_shoulder",
  "lower_back",
  "left_hand",
  "right_hand",
  "left_hip",
  "right_hip",
  "left_thigh",
  "right_thigh",
  "forehead",
  "left_upper_arm",
  "upper_back",
  "left_calf",
  "widespread",
];

const descriptorOptions = [
  "throbbing",
  "burning",
  "stabbing",
  "aching",
  "tingling",
  "dull",
];

function randomLocationEntries(): PainLocationEntry[] {
  const count = randInt(1, 4);
  const shuffled = [...locations].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map((location) => ({
    location,
    severity: randInt(1, 10),
    descriptors: descriptorOptions
      .filter(() => Math.random() < 0.2)
      .slice(0, 2),
    note: null,
  }));
}

const now = new Date().toISOString();

export const mockSymptomLogs: SymptomLog[] = Array.from(
  { length: 30 },
  (_, i) => {
    const isFlare = Math.random() < 0.2;
    const entries = randomLocationEntries();
    const pain =
      entries.length > 0
        ? Math.max(...entries.map((e) => e.severity))
        : 0;
    return {
      id: 30 - i,
      date: dateStr(i),
      pain_severity: pain,
      pain_locations: entries,
      fatigue_severity: randInt(2, 9),
      brain_fog: randInt(1, 8),
      mood: randInt(2, 8),
      is_flare: isFlare,
      flare_severity: isFlare ? randInt(5, 10) : null,
      notes: i % 5 === 0 ? "Rough day, weather change" : null,
      missed_medications: null,
      menstrual_phase: i % 7 < 2 ? "luteal" : null,
      stress_event: i % 8 === 0 ? "work deadline" : null,
      medication_change: null,
      exercise_type: i % 3 === 0 ? "walking" : null,
      exercise_rpe: i % 3 === 0 ? randInt(2, 6) : null,
      created_at: now,
      updated_at: now,
    };
  }
);

export const mockBiometrics: BiometricReading[] = Array.from(
  { length: 30 },
  (_, i) => ({
    date: dateStr(i),
    sleep_duration: rand(5.5, 9),
    sleep_efficiency: rand(70, 95),
    deep_sleep_pct: rand(10, 25),
    rem_sleep_pct: rand(15, 30),
    hrv_rmssd: rand(15, 65),
    resting_hr: rand(55, 78),
    temperature_deviation: rand(-0.5, 0.8),
    activity_score: randInt(30, 95),
    activity_calories: randInt(150, 500),
    spo2: rand(95, 99),
    source: "oura",
    created_at: now,
    updated_at: now,
  })
);

export const mockContextualData: ContextualData[] = Array.from(
  { length: 30 },
  (_, i) => ({
    date: dateStr(i),
    barometric_pressure: rand(995, 1025),
    temperature: rand(-2, 28),
    humidity: rand(30, 85),
    menstrual_phase: null,
    stress_event: null,
    medication_change: null,
    exercise_type: null,
    exercise_rpe: null,
    diet_flags: null,
    created_at: now,
    updated_at: now,
  })
);

const metrics = [
  "pain_severity",
  "fatigue_severity",
  "brain_fog",
  "mood",
  "sleep_duration",
  "sleep_efficiency",
  "hrv_rmssd",
  "resting_hr",
  "barometric_pressure",
  "temperature",
  "humidity",
];

export const mockCorrelations: CorrelationResult[] = [];
for (let a = 0; a < metrics.length; a++) {
  for (let b = a + 1; b < metrics.length; b++) {
    mockCorrelations.push({
      metric_a: metrics[a],
      metric_b: metrics[b],
      lag_days: 0,
      correlation_coefficient: rand(-0.8, 0.8),
      p_value: rand(0.001, 0.5),
      sample_size: 30,
      method: "spearman",
    });
  }
}

export const allMetrics = metrics;
