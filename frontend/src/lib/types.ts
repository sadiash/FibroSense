export interface PainLocationEntry {
  location: string;
  severity: number;
  descriptors: string[];
  note: string | null;
}

export const PAIN_DESCRIPTORS = [
  "throbbing",
  "burning",
  "stabbing",
  "aching",
  "tingling",
  "numbness",
  "sharp",
  "dull",
  "cramping",
  "shooting",
] as const;

export type PainDescriptor = (typeof PAIN_DESCRIPTORS)[number];

export const PAIN_DESCRIPTOR_LABELS: Record<PainDescriptor, string> = {
  throbbing: "Throbbing",
  burning: "Burning",
  stabbing: "Stabbing",
  aching: "Aching",
  tingling: "Tingling",
  numbness: "Numbness",
  sharp: "Sharp",
  dull: "Dull",
  cramping: "Cramping",
  shooting: "Shooting",
};

export interface SymptomLog {
  id: number;
  date: string;
  pain_severity: number;
  pain_locations: PainLocationEntry[];
  fatigue_severity: number;
  brain_fog: number;
  mood: number;
  is_flare: boolean;
  flare_severity: number | null;
  notes: string | null;
  missed_medications: number[] | null;
  menstrual_phase: string | null;
  stress_event: string | null;
  medication_change: string | null;
  exercise_type: string | null;
  exercise_rpe: number | null;
  created_at: string;
  updated_at: string;
}

export interface SymptomLogCreate {
  date: string;
  pain_severity?: number;
  pain_locations: PainLocationEntry[];
  fatigue_severity: number;
  brain_fog: number;
  mood: number;
  is_flare: boolean;
  flare_severity?: number | null;
  notes?: string | null;
  missed_medications?: number[] | null;
  menstrual_phase?: string | null;
  stress_event?: string | null;
  medication_change?: string | null;
  exercise_type?: string | null;
  exercise_rpe?: number | null;
  diet_flags?: string | null;
}

export interface Medication {
  id: number;
  name: string;
  dosage: string | null;
  frequency: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MedicationCreate {
  name: string;
  dosage?: string | null;
  frequency?: string | null;
}

export interface MedicationPreset {
  name: string;
  category: string;
  commonDosages: string[];
}

export const FMS_MEDICATION_PRESETS: MedicationPreset[] = [
  // FDA-approved for fibromyalgia
  { name: "Duloxetine (Cymbalta)", category: "FDA-Approved", commonDosages: ["20mg", "30mg", "60mg"] },
  { name: "Milnacipran (Savella)", category: "FDA-Approved", commonDosages: ["12.5mg", "25mg", "50mg", "100mg"] },
  { name: "Pregabalin (Lyrica)", category: "FDA-Approved", commonDosages: ["25mg", "50mg", "75mg", "150mg", "225mg", "300mg"] },
  // Antidepressants commonly used
  { name: "Amitriptyline", category: "Antidepressants", commonDosages: ["10mg", "25mg", "50mg", "75mg"] },
  { name: "Nortriptyline (Pamelor)", category: "Antidepressants", commonDosages: ["10mg", "25mg", "50mg", "75mg"] },
  { name: "Venlafaxine (Effexor)", category: "Antidepressants", commonDosages: ["37.5mg", "75mg", "150mg", "225mg"] },
  { name: "Fluoxetine (Prozac)", category: "Antidepressants", commonDosages: ["10mg", "20mg", "40mg"] },
  { name: "Sertraline (Zoloft)", category: "Antidepressants", commonDosages: ["25mg", "50mg", "100mg"] },
  // Pain management
  { name: "Gabapentin (Neurontin)", category: "Pain Management", commonDosages: ["100mg", "300mg", "400mg", "600mg", "800mg"] },
  { name: "Tramadol", category: "Pain Management", commonDosages: ["50mg", "100mg", "200mg"] },
  { name: "Cyclobenzaprine (Flexeril)", category: "Pain Management", commonDosages: ["5mg", "10mg"] },
  { name: "Naproxen (Aleve)", category: "Pain Management", commonDosages: ["220mg", "250mg", "500mg"] },
  { name: "Ibuprofen", category: "Pain Management", commonDosages: ["200mg", "400mg", "600mg", "800mg"] },
  { name: "Acetaminophen (Tylenol)", category: "Pain Management", commonDosages: ["325mg", "500mg", "650mg", "1000mg"] },
  // Sleep aids
  { name: "Trazodone", category: "Sleep", commonDosages: ["25mg", "50mg", "100mg", "150mg"] },
  { name: "Melatonin", category: "Sleep", commonDosages: ["1mg", "3mg", "5mg", "10mg"] },
  { name: "Zolpidem (Ambien)", category: "Sleep", commonDosages: ["5mg", "10mg"] },
  // Supplements
  { name: "Magnesium", category: "Supplements", commonDosages: ["200mg", "400mg", "500mg"] },
  { name: "Vitamin D", category: "Supplements", commonDosages: ["1000 IU", "2000 IU", "5000 IU"] },
  { name: "CoQ10", category: "Supplements", commonDosages: ["100mg", "200mg", "300mg"] },
  { name: "B12", category: "Supplements", commonDosages: ["500mcg", "1000mcg", "2500mcg"] },
];

export const MEDICATION_FREQUENCIES = [
  "Once daily",
  "Twice daily",
  "Three times daily",
  "Four times daily",
  "Every morning",
  "Every evening",
  "At bedtime",
  "Every 4-6 hours",
  "Every 8 hours",
  "Every 12 hours",
  "As needed (PRN)",
  "Weekly",
] as const;

export interface BiometricReading {
  date: string;
  sleep_duration: number;
  sleep_efficiency: number;
  deep_sleep_pct: number;
  rem_sleep_pct: number;
  hrv_rmssd: number;
  resting_hr: number;
  temperature_deviation: number;
  activity_score: number;
  activity_calories: number;
  spo2: number | null;
  source: string;
  created_at: string;
  updated_at: string;
}

export interface ContextualData {
  date: string;
  barometric_pressure: number | null;
  temperature: number | null;
  humidity: number | null;
  menstrual_phase: string | null;
  stress_event: string | null;
  medication_change: string | null;
  exercise_type: string | null;
  exercise_rpe: number | null;
  diet_flags: string | null;
  created_at: string;
  updated_at: string;
}

export interface CorrelationResult {
  metric_a: string;
  metric_b: string;
  lag_days: number;
  correlation_coefficient: number;
  p_value: number;
  sample_size: number;
  method: string;
}

export interface SyncStatus {
  source: string;
  sync_type: string;
  started_at: string;
  completed_at: string | null;
  status: string;
  records_synced: number;
  error_message: string | null;
}

export interface AppSetting {
  key: string;
  value: string;
  updated_at: string;
}

export const PAIN_LOCATIONS = [
  // Front view — head
  "forehead",
  "left_temple",
  "right_temple",
  "jaw",
  // Front view — neck & torso
  "neck",
  "chest",
  "abdomen",
  // Front view — shoulders
  "left_shoulder",
  "right_shoulder",
  // Front view — arms
  "left_upper_arm",
  "right_upper_arm",
  "left_elbow",
  "right_elbow",
  "left_forearm",
  "right_forearm",
  "left_wrist",
  "right_wrist",
  "left_hand",
  "right_hand",
  // Front view — hips
  "left_hip",
  "right_hip",
  // Front view — legs
  "left_thigh",
  "right_thigh",
  "left_knee",
  "right_knee",
  "left_shin",
  "right_shin",
  // Front view — feet
  "left_foot",
  "right_foot",
  // Back view — head & neck
  "back_of_head",
  "back_of_neck",
  // Back view — upper body
  "left_shoulder_blade",
  "right_shoulder_blade",
  "upper_back",
  "mid_back",
  "lower_back",
  // Back view — glutes
  "left_glute",
  "right_glute",
  // Back view — legs
  "left_hamstring",
  "right_hamstring",
  "left_calf",
  "right_calf",
  // Back view — ankles
  "left_ankle",
  "right_ankle",
  // Special
  "widespread",
] as const;

export type PainLocation = (typeof PAIN_LOCATIONS)[number];

export const PAIN_LOCATION_LABELS: Record<PainLocation, string> = {
  forehead: "Forehead",
  left_temple: "L Temple",
  right_temple: "R Temple",
  jaw: "Jaw",
  neck: "Neck",
  chest: "Chest",
  abdomen: "Abdomen",
  left_shoulder: "L Shoulder",
  right_shoulder: "R Shoulder",
  left_upper_arm: "L Upper Arm",
  right_upper_arm: "R Upper Arm",
  left_elbow: "L Elbow",
  right_elbow: "R Elbow",
  left_forearm: "L Forearm",
  right_forearm: "R Forearm",
  left_wrist: "L Wrist",
  right_wrist: "R Wrist",
  left_hand: "L Hand",
  right_hand: "R Hand",
  left_hip: "L Hip",
  right_hip: "R Hip",
  left_thigh: "L Thigh",
  right_thigh: "R Thigh",
  left_knee: "L Knee",
  right_knee: "R Knee",
  left_shin: "L Shin",
  right_shin: "R Shin",
  left_foot: "L Foot",
  right_foot: "R Foot",
  back_of_head: "Back of Head",
  back_of_neck: "Back of Neck",
  left_shoulder_blade: "L Shoulder Blade",
  right_shoulder_blade: "R Shoulder Blade",
  upper_back: "Upper Back",
  mid_back: "Mid Back",
  lower_back: "Lower Back",
  left_glute: "L Glute",
  right_glute: "R Glute",
  left_hamstring: "L Hamstring",
  right_hamstring: "R Hamstring",
  left_calf: "L Calf",
  right_calf: "R Calf",
  left_ankle: "L Ankle",
  right_ankle: "R Ankle",
  widespread: "Widespread",
};

export const MENSTRUAL_PHASES = [
  "menstrual",
  "follicular",
  "ovulatory",
  "luteal",
  "not_applicable",
] as const;

export type MenstrualPhase = (typeof MENSTRUAL_PHASES)[number];

export const MENSTRUAL_PHASE_OPTIONS: {
  value: MenstrualPhase;
  label: string;
  description: string;
}[] = [
  {
    value: "menstrual",
    label: "Period (Day 1\u20135)",
    description: "Active menstruation",
  },
  {
    value: "follicular",
    label: "Follicular (Day 6\u201313)",
    description: "Pre-ovulation, rising estrogen",
  },
  {
    value: "ovulatory",
    label: "Ovulatory (Day 14\u201316)",
    description: "Peak fertility window",
  },
  {
    value: "luteal",
    label: "Luteal (Day 17\u201328)",
    description: "Post-ovulation, rising progesterone",
  },
  {
    value: "not_applicable",
    label: "Not Applicable",
    description: "",
  },
];

export const DIET_FLAGS = [
  "alcohol",
  "high_sugar",
  "processed_food",
  "caffeine_excess",
  "gluten",
  "dairy",
] as const;

export type DietFlag = (typeof DIET_FLAGS)[number];

export const DIET_FLAG_LABELS: Record<DietFlag, string> = {
  alcohol: "Alcohol",
  high_sugar: "High Sugar",
  processed_food: "Processed Food",
  caffeine_excess: "Excess Caffeine",
  gluten: "Gluten",
  dairy: "Dairy",
};

export const STRESS_EVENTS = [
  "work_deadline",
  "financial_stress",
  "relationship_conflict",
  "family_issues",
  "health_anxiety",
  "poor_sleep",
  "travel",
  "weather_change",
  "overexertion",
  "emotional_event",
  "social_overwhelm",
  "other",
] as const;

export type StressEvent = (typeof STRESS_EVENTS)[number];

export const STRESS_EVENT_LABELS: Record<StressEvent, string> = {
  work_deadline: "Work Deadline",
  financial_stress: "Financial Stress",
  relationship_conflict: "Relationship Conflict",
  family_issues: "Family Issues",
  health_anxiety: "Health Anxiety",
  poor_sleep: "Poor Sleep",
  travel: "Travel",
  weather_change: "Weather Change",
  overexertion: "Overexertion",
  emotional_event: "Emotional Event",
  social_overwhelm: "Social Overwhelm",
  other: "Other",
};
