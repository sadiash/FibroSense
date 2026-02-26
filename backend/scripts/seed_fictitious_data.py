#!/usr/bin/env python3
"""
Seed the FibroSense database with 3 months of FICTITIOUS demo data.

╔══════════════════════════════════════════════════════════════════╗
║  ALL DATA IN THIS SCRIPT IS ENTIRELY FICTITIOUS.               ║
║  "Jane Doe" is not a real person. All symptom logs, biometric  ║
║  readings, and contextual entries are computer-generated for    ║
║  demonstration purposes only. No real patient data is used.    ║
╚══════════════════════════════════════════════════════════════════╝

Patient profile (fictitious):
  - Name: Jane Doe, age 34, diagnosed with fibromyalgia 3 years ago
  - Location: New York metro area
  - Medications: Duloxetine 60mg, Gabapentin 300mg, Melatonin 3mg
  - Key patterns: flares correlate with barometric pressure drops,
    poor sleep, stress, and luteal menstrual phase

Date range: 2025-12-01 through 2026-02-28 (90 days)

Usage:
  cd backend/
  python scripts/seed_fictitious_data.py
"""

import json
import math
import random
import sqlite3
from datetime import date, datetime, timedelta
from pathlib import Path

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
DB_PATH = Path(__file__).resolve().parent.parent / "fibrosense.db"
START_DATE = date(2025, 12, 1)
END_DATE = date(2026, 2, 28)
SEED = 42  # deterministic for reproducibility

random.seed(SEED)

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def iso_now() -> str:
    return datetime.now(tz=__import__("datetime").timezone.utc).isoformat().replace("+00:00", "Z")


def clamp(val: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, val))


def jitter(base: float, spread: float) -> float:
    return base + random.uniform(-spread, spread)


def date_range(start: date, end: date):
    """Yield every date from start to end inclusive."""
    d = start
    while d <= end:
        yield d
        d += timedelta(days=1)


# ---------------------------------------------------------------------------
# Narrative engine — makes the data tell a fibromyalgia story
# ---------------------------------------------------------------------------

# Menstrual cycle: 28-day cycle starting Dec 3
CYCLE_START = date(2025, 12, 3)
CYCLE_LENGTH = 28

def menstrual_phase(d: date) -> str:
    day_in_cycle = (d - CYCLE_START).days % CYCLE_LENGTH
    if day_in_cycle < 5:
        return "menstrual"
    elif day_in_cycle < 13:
        return "follicular"
    elif day_in_cycle < 16:
        return "ovulatory"
    else:
        return "luteal"


# Stress events — specific narrative beats
STRESS_EVENTS: dict[date, str] = {
    date(2025, 12, 8): "Work project deadline",
    date(2025, 12, 15): "Holiday travel prep stress",
    date(2025, 12, 23): "Family gathering tension",
    date(2025, 12, 24): "Last-minute holiday errands",
    date(2025, 12, 31): "New Year's Eve social anxiety",
    date(2026, 1, 6): "Return to work after break",
    date(2026, 1, 14): "Performance review at work",
    date(2026, 1, 27): "Car repair unexpected expense",
    date(2026, 2, 3): "Argument with friend",
    date(2026, 2, 10): "Work presentation prep",
    date(2026, 2, 11): "Work presentation day",
    date(2026, 2, 22): "Tax paperwork stress",
}

# Medication changes
MED_CHANGES: dict[date, str] = {
    date(2025, 12, 18): "Increased Gabapentin to 400mg for flare",
    date(2025, 12, 26): "Returned Gabapentin to 300mg",
    date(2026, 1, 10): "Added magnesium glycinate 400mg nightly",
    date(2026, 2, 5): "Tried CBD oil 25mg — discontinued after 3 days",
    date(2026, 2, 8): "Stopped CBD oil, skin reaction",
}

# Exercise schedule — builds over time (New Year's resolution narrative)
def exercise_for_day(d: date) -> tuple[str | None, int | None]:
    dow = d.weekday()  # 0=Monday
    # December: sporadic exercise, mostly walking
    if d.month == 12:
        if dow in (1, 4):  # Tue, Fri
            return random.choice(["walking", "gentle_yoga"]), random.randint(2, 5)
        if dow == 6 and random.random() < 0.4:  # occasional Sunday
            return "walking", random.randint(2, 4)
        return None, None
    # January: ramping up after NY resolution
    if d.month == 1:
        if dow in (0, 2, 4):  # Mon, Wed, Fri
            options = ["walking", "yoga", "swimming", "stretching"]
            return random.choice(options), random.randint(3, 6)
        if dow == 5 and random.random() < 0.5:  # some Saturdays
            return "walking", random.randint(2, 4)
        return None, None
    # February: consistent 4x/week
    if dow in (0, 2, 4, 5):  # Mon, Wed, Fri, Sat
        options = ["walking", "yoga", "swimming", "tai_chi", "stretching"]
        return random.choice(options), random.randint(3, 6)
    return None, None


# Weather — simulate NYC winter (temperature °C, humidity %, pressure hPa)
# Use sinusoidal base with weather fronts causing pressure drops
PRESSURE_DROP_DATES = [
    (date(2025, 12, 12), 4),   # 4-day low-pressure system
    (date(2025, 12, 21), 3),   # pre-Christmas storm
    (date(2026, 1, 3), 3),     # New Year cold front
    (date(2026, 1, 18), 5),    # major winter storm
    (date(2026, 2, 6), 3),     # February cold snap
    (date(2026, 2, 19), 4),    # late-winter nor'easter
]

def weather_for_day(d: date) -> tuple[float, float, float]:
    """Return (pressure_hPa, temperature_C, humidity_pct)."""
    day_num = (d - START_DATE).days

    # Base temperature: winter curve, coldest late Jan
    # NYC winter avg: Dec ~2°C, Jan ~0°C, Feb ~1°C
    t_base = 1.0 + 2.0 * math.cos(2 * math.pi * (day_num - 45) / 90)
    temp = jitter(t_base, 4.0)

    # Base pressure ~1015 hPa with seasonal variation
    p_base = 1015.0 + 3.0 * math.sin(2 * math.pi * day_num / 90)

    # Apply pressure drops for weather fronts
    for drop_start, duration in PRESSURE_DROP_DATES:
        day_offset = (d - drop_start).days
        if 0 <= day_offset < duration:
            # Gaussian-ish drop peaking at midpoint
            mid = duration / 2
            drop = 18.0 * math.exp(-0.5 * ((day_offset - mid) / (duration / 3)) ** 2)
            p_base -= drop

    pressure = jitter(p_base, 3.0)

    # Humidity: higher during storms, base 55-70%
    humidity = jitter(62.0, 12.0)
    if pressure < 1005:
        humidity += 15.0

    return round(pressure, 1), round(temp, 1), round(clamp(humidity, 25, 98), 1)


# ---------------------------------------------------------------------------
# Symptom generation — the core narrative
# ---------------------------------------------------------------------------

PAIN_LOCATIONS_POOL = [
    "neck", "left_shoulder", "right_shoulder", "upper_back", "lower_back",
    "left_hip", "right_hip", "left_hand", "right_hand", "left_thigh",
    "right_thigh", "left_upper_arm", "right_upper_arm", "left_calf",
    "right_calf", "forehead", "chest", "widespread",
]

PAIN_DESCRIPTORS = [
    "throbbing", "burning", "stabbing", "aching", "tingling",
    "numbness", "sharp", "dull", "cramping", "shooting",
]

# Fictitious notes that Jane might write
FLARE_NOTES = [
    "[FICTITIOUS] Woke up with widespread pain, couldn't get out of bed easily",
    "[FICTITIOUS] Pain radiating from neck to shoulders, took extra rest",
    "[FICTITIOUS] Terrible brain fog today, couldn't focus at work",
    "[FICTITIOUS] Whole body aching, feels like the flu without fever",
    "[FICTITIOUS] Hands so stiff I struggled with buttons this morning",
    "[FICTITIOUS] Lightning bolt pain in legs all afternoon",
    "[FICTITIOUS] Exhaustion hit at 2pm, had to cancel evening plans",
    "[FICTITIOUS] Pain woke me at 3am, couldn't fall back asleep",
]

GOOD_DAY_NOTES = [
    "[FICTITIOUS] Actually a decent day! Managed a full walk",
    "[FICTITIOUS] Yoga helped loosen up the stiffness",
    "[FICTITIOUS] Slept well, feeling more like myself today",
    "[FICTITIOUS] Low pain morning — tried to enjoy it while it lasts",
    None, None, None, None, None, None,  # most good days have no note
]

MEDIUM_DAY_NOTES = [
    "[FICTITIOUS] Average fibro day, pushing through",
    "[FICTITIOUS] Stiff but functional",
    "[FICTITIOUS] Foggy brain but pain was manageable",
    None, None, None, None, None, None, None,  # most medium days have no note
]


def compute_symptom_severity(d: date, pressure: float, sleep_quality: float) -> dict:
    """
    Generate symptom severities based on multiple triggers.

    Returns a dict with all symptom fields.
    sleep_quality: 0-1 scale where 1 = great sleep
    """
    day_num = (d - START_DATE).days
    phase = menstrual_phase(d)
    stress = STRESS_EVENTS.get(d)

    # Base pain level: 3-4 (moderate baseline for fibromyalgia)
    pain_base = 3.5

    # --- Trigger modifiers ---

    # Barometric pressure drop = more pain
    if pressure < 1000:
        pain_base += 3.0
    elif pressure < 1005:
        pain_base += 2.0
    elif pressure < 1010:
        pain_base += 1.0

    # Poor sleep = more pain (sleep_quality 0-1)
    pain_base += (1.0 - sleep_quality) * 2.5

    # Stress = more pain
    if stress:
        pain_base += random.uniform(0.5, 2.0)

    # Luteal phase = slightly more pain
    if phase == "luteal":
        pain_base += random.uniform(0.3, 1.2)
    elif phase == "menstrual":
        pain_base += random.uniform(0.5, 1.5)

    # Gradual improvement arc in February (exercise effect)
    if d.month == 2:
        pain_base -= 0.5 + (d.day / 28) * 0.5  # up to -1.0 by end of Feb

    # Random daily variation
    pain_base += random.uniform(-1.0, 1.0)

    # Determine if this is a flare day
    is_flare = pain_base >= 7.0
    pain_severity = int(clamp(round(pain_base), 0, 10))
    flare_severity = int(clamp(round(pain_base + 0.5), 1, 10)) if is_flare else None

    # Fatigue correlates with pain but has its own pattern
    fatigue_base = pain_base * 0.8 + random.uniform(-1, 1.5)
    fatigue_base += (1.0 - sleep_quality) * 1.5
    fatigue = int(clamp(round(fatigue_base), 0, 10))

    # Brain fog: worse with poor sleep and during flares
    fog_base = pain_base * 0.5 + (1.0 - sleep_quality) * 3.0 + random.uniform(-1, 1)
    brain_fog = int(clamp(round(fog_base), 0, 10))

    # Mood: inverse of pain, but floored by fatigue
    mood_base = 8.0 - pain_base * 0.6 - fatigue_base * 0.2 + random.uniform(-1, 1)
    if is_flare:
        mood_base -= 1.0
    mood = int(clamp(round(mood_base), 0, 10))

    # Pain locations: more locations during flares
    if is_flare:
        n_locations = random.randint(3, 6)
    elif pain_severity >= 5:
        n_locations = random.randint(2, 4)
    else:
        n_locations = random.randint(1, 3)

    selected_locations = random.sample(PAIN_LOCATIONS_POOL, n_locations)
    pain_locations = []
    for loc in selected_locations:
        loc_severity = int(clamp(pain_severity + random.randint(-2, 1), 1, 10))
        n_descriptors = random.randint(1, 3) if loc_severity >= 5 else random.randint(0, 2)
        descriptors = random.sample(PAIN_DESCRIPTORS, min(n_descriptors, len(PAIN_DESCRIPTORS)))
        pain_locations.append({
            "location": loc,
            "severity": loc_severity,
            "descriptors": descriptors,
            "note": None,
        })

    # Recalculate pain_severity as max of location severities (matches app logic)
    if pain_locations:
        pain_severity = max(loc["severity"] for loc in pain_locations)
        is_flare = pain_severity >= 7
        flare_severity = int(clamp(pain_severity + 1, 1, 10)) if is_flare else None

    # Notes
    if is_flare:
        notes = random.choice(FLARE_NOTES)
    elif pain_severity <= 3:
        notes = random.choice(GOOD_DAY_NOTES)
    else:
        notes = random.choice(MEDIUM_DAY_NOTES)

    # Missed medications: more likely during flares (brain fog)
    missed_medications = None
    if brain_fog >= 7 and random.random() < 0.3:
        # Miss one medication (IDs 1, 2, or 3)
        missed_medications = json.dumps([random.randint(1, 3)])
    elif brain_fog >= 5 and random.random() < 0.1:
        missed_medications = json.dumps([random.randint(1, 3)])

    return {
        "pain_severity": pain_severity,
        "pain_locations": json.dumps(pain_locations),
        "fatigue_severity": fatigue,
        "brain_fog": brain_fog,
        "mood": mood,
        "is_flare": is_flare,
        "flare_severity": flare_severity,
        "notes": notes,
        "missed_medications": missed_medications,
    }


# ---------------------------------------------------------------------------
# Oura biometric generation
# ---------------------------------------------------------------------------

def generate_biometrics(d: date, previous_sleep: float | None = None) -> dict:
    """Generate realistic Oura ring data for a day."""
    day_num = (d - START_DATE).days
    phase = menstrual_phase(d)
    stress = STRESS_EVENTS.get(d)

    # Sleep duration: base 7h, worse during stress/flare triggers
    sleep_base = 7.0
    if stress:
        sleep_base -= random.uniform(0.5, 1.5)
    if phase in ("luteal", "menstrual"):
        sleep_base -= random.uniform(0, 0.5)
    # Improvement arc in Feb
    if d.month == 2:
        sleep_base += 0.3

    sleep_duration = round(clamp(jitter(sleep_base, 1.0), 4.0, 9.5), 1)

    # Sleep efficiency: 75-95%, worse with poor sleep
    eff_base = 85.0 if sleep_duration >= 7.0 else 75.0 + (sleep_duration - 4.0) * 3.0
    sleep_efficiency = round(clamp(jitter(eff_base, 5.0), 55, 98), 1)

    # Deep sleep: 15-25%, lower during stress
    deep_base = 20.0
    if stress:
        deep_base -= 3.0
    deep_sleep = round(clamp(jitter(deep_base, 5.0), 5, 35), 1)

    # REM sleep: 20-25%
    rem_base = 22.0
    if sleep_duration < 6.5:
        rem_base -= 3.0
    rem_sleep = round(clamp(jitter(rem_base, 4.0), 8, 35), 1)

    # HRV: fibro patients often have lower HRV, 20-50ms typical
    hrv_base = 35.0
    if stress:
        hrv_base -= 5.0
    if sleep_duration >= 7.5:
        hrv_base += 3.0
    if d.month == 2 and d.day > 14:  # exercise improving HRV
        hrv_base += 4.0
    hrv = round(clamp(jitter(hrv_base, 8.0), 10, 70), 1)

    # Resting HR: 62-72 typical for fibro
    rhr_base = 67.0
    if stress:
        rhr_base += 3.0
    if d.month == 2 and d.day > 14:
        rhr_base -= 2.0  # fitness improvement
    resting_hr = round(clamp(jitter(rhr_base, 3.0), 52, 82), 1)

    # Temperature deviation: normally near 0, elevated during flare
    temp_base = 0.0
    if phase == "luteal":
        temp_base += 0.3
    temp_dev = round(clamp(jitter(temp_base, 0.3), -1.0, 1.5), 2)

    # Activity score: lower in Dec, improving through Feb
    act_base = 50 + day_num * 0.2
    if stress:
        act_base -= 10
    activity_score = int(clamp(jitter(act_base, 15), 10, 100))

    # Activity calories
    cal_base = 200 + activity_score * 2
    activity_calories = int(clamp(jitter(cal_base, 60), 80, 650))

    # SpO2: usually 96-99%, occasionally null (sensor miss)
    spo2 = round(clamp(jitter(97.5, 1.0), 94, 100), 1) if random.random() < 0.9 else None

    # Sleep quality score for symptom correlation (0-1)
    sleep_quality = clamp(
        (sleep_duration - 4.0) / 5.0 * 0.4 +
        (sleep_efficiency - 55) / 43.0 * 0.3 +
        (deep_sleep / 35.0) * 0.15 +
        (hrv - 10) / 60.0 * 0.15,
        0, 1,
    )

    return {
        "sleep_duration": sleep_duration,
        "sleep_efficiency": sleep_efficiency,
        "deep_sleep_pct": deep_sleep,
        "rem_sleep_pct": rem_sleep,
        "hrv_rmssd": hrv,
        "resting_hr": resting_hr,
        "temperature_deviation": temp_dev,
        "activity_score": activity_score,
        "activity_calories": activity_calories,
        "spo2": spo2,
        "source": "fictitious_oura",
        "sleep_quality": sleep_quality,  # internal, not stored
    }


# ---------------------------------------------------------------------------
# Database operations
# ---------------------------------------------------------------------------

def seed_database():
    print(f"Seeding database at: {DB_PATH}")
    print(f"Date range: {START_DATE} to {END_DATE}")
    print("=" * 60)
    print("⚠️  ALL DATA IS FICTITIOUS — for demonstration only")
    print("=" * 60)

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    now = iso_now()

    # --- Clear existing data ---
    print("\nClearing existing data...")
    for table in [
        "symptom_logs", "biometric_readings", "contextual_data",
        "medications", "correlation_cache", "sync_log",
    ]:
        cursor.execute(f"DELETE FROM {table}")  # noqa: S608
    # Reset autoincrement (table may not exist if no autoincrement rows yet)
    cursor.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='sqlite_sequence'"
    )
    if cursor.fetchone():
        cursor.execute(
            "DELETE FROM sqlite_sequence WHERE name IN "
            "('symptom_logs', 'medications', 'correlation_cache', 'sync_log')"
        )
    conn.commit()

    # --- Medications ---
    print("Creating medications...")
    medications = [
        ("Duloxetine (Cymbalta)", "60mg", "once_daily"),
        ("Gabapentin (Neurontin)", "300mg", "three_times_daily"),
        ("Melatonin", "3mg", "at_bedtime"),
    ]
    for name, dosage, frequency in medications:
        cursor.execute(
            "INSERT INTO medications (name, dosage, frequency, is_active, created_at, updated_at) "
            "VALUES (?, ?, ?, 1, ?, ?)",
            (name, dosage, frequency, now, now),
        )
    conn.commit()
    print(f"  Created {len(medications)} medications")

    # --- Generate daily data ---
    print("\nGenerating daily entries...")
    days = list(date_range(START_DATE, END_DATE))
    symptom_count = 0
    bio_count = 0
    ctx_count = 0
    flare_count = 0

    prev_sleep_quality = 0.6  # starting sleep quality

    for d in days:
        date_str = d.isoformat()

        # -- Biometrics (generate first, symptoms depend on sleep quality) --
        bio = generate_biometrics(d)
        sleep_quality = bio.pop("sleep_quality")

        cursor.execute(
            "INSERT INTO biometric_readings "
            "(date, sleep_duration, sleep_efficiency, deep_sleep_pct, rem_sleep_pct, "
            "hrv_rmssd, resting_hr, temperature_deviation, activity_score, "
            "activity_calories, spo2, source, created_at, updated_at) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (
                date_str,
                bio["sleep_duration"], bio["sleep_efficiency"],
                bio["deep_sleep_pct"], bio["rem_sleep_pct"],
                bio["hrv_rmssd"], bio["resting_hr"],
                bio["temperature_deviation"], bio["activity_score"],
                bio["activity_calories"], bio["spo2"],
                bio["source"], now, now,
            ),
        )
        bio_count += 1

        # -- Contextual data (weather + lifestyle) --
        pressure, temp, humidity = weather_for_day(d)
        phase = menstrual_phase(d)
        stress = STRESS_EVENTS.get(d)
        med_change = MED_CHANGES.get(d)
        exercise_type, exercise_rpe = exercise_for_day(d)

        cursor.execute(
            "INSERT INTO contextual_data "
            "(date, barometric_pressure, temperature, humidity, menstrual_phase, "
            "stress_event, medication_change, exercise_type, exercise_rpe, "
            "created_at, updated_at) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (
                date_str, pressure, temp, humidity, phase,
                stress, med_change, exercise_type, exercise_rpe,
                now, now,
            ),
        )
        ctx_count += 1

        # -- Symptom log --
        symptoms = compute_symptom_severity(d, pressure, sleep_quality)

        cursor.execute(
            "INSERT INTO symptom_logs "
            "(date, pain_severity, pain_locations, fatigue_severity, brain_fog, "
            "mood, is_flare, flare_severity, notes, missed_medications, "
            "created_at, updated_at) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (
                date_str,
                symptoms["pain_severity"], symptoms["pain_locations"],
                symptoms["fatigue_severity"], symptoms["brain_fog"],
                symptoms["mood"], symptoms["is_flare"],
                symptoms["flare_severity"], symptoms["notes"],
                symptoms["missed_medications"], now, now,
            ),
        )
        symptom_count += 1
        if symptoms["is_flare"]:
            flare_count += 1

        prev_sleep_quality = sleep_quality

    conn.commit()

    # --- Add a fictitious sync log entry ---
    cursor.execute(
        "INSERT INTO sync_log (source, sync_type, started_at, completed_at, "
        "status, records_synced, error_message) VALUES (?, ?, ?, ?, ?, ?, ?)",
        (
            "fictitious_seed", "bulk_import", now, now,
            "completed", bio_count + symptom_count + ctx_count,
            None,
        ),
    )
    conn.commit()

    # --- Add app settings for demo ---
    cursor.execute(
        "INSERT OR REPLACE INTO app_settings (key, value, created_at, updated_at) "
        "VALUES (?, ?, ?, ?)",
        ("weather_latitude", "40.7128", now, now),
    )
    cursor.execute(
        "INSERT OR REPLACE INTO app_settings (key, value, created_at, updated_at) "
        "VALUES (?, ?, ?, ?)",
        ("weather_longitude", "-74.0060", now, now),
    )
    conn.commit()

    conn.close()

    # --- Summary ---
    print(f"\n{'=' * 60}")
    print("Seed complete!")
    print(f"  Symptom logs:     {symptom_count} days")
    print(f"  Flare days:       {flare_count} ({flare_count * 100 // symptom_count}%)")
    print(f"  Biometric entries: {bio_count} days")
    print(f"  Contextual entries:{ctx_count} days")
    print(f"  Medications:       {len(medications)}")
    print(f"  Date range:        {START_DATE} → {END_DATE}")
    print(f"{'=' * 60}")
    print("\n⚠️  Remember: ALL data is FICTITIOUS (demo only)")


if __name__ == "__main__":
    seed_database()
