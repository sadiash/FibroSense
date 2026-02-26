#!/usr/bin/env python3
"""
Seed the FibroSense database with 3 months of FICTITIOUS demo data.

All data is entirely fictitious. See original file header for narrative details.

Usage:
  cd backend/
  python scripts/seed_fictitious_data.py [--user-id N]
"""

import argparse
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
# Narrative engine
# ---------------------------------------------------------------------------

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

MED_CHANGES: dict[date, str] = {
    date(2025, 12, 18): "Increased Gabapentin to 400mg for flare",
    date(2025, 12, 26): "Returned Gabapentin to 300mg",
    date(2026, 1, 10): "Added magnesium glycinate 400mg nightly",
    date(2026, 2, 5): "Tried CBD oil 25mg — discontinued after 3 days",
    date(2026, 2, 8): "Stopped CBD oil, skin reaction",
}


def exercise_for_day(d: date) -> tuple[str | None, int | None]:
    dow = d.weekday()
    if d.month == 12:
        if dow in (1, 4):
            return random.choice(["walking", "gentle_yoga"]), random.randint(2, 5)
        if dow == 6 and random.random() < 0.4:
            return "walking", random.randint(2, 4)
        return None, None
    if d.month == 1:
        if dow in (0, 2, 4):
            options = ["walking", "yoga", "swimming", "stretching"]
            return random.choice(options), random.randint(3, 6)
        if dow == 5 and random.random() < 0.5:
            return "walking", random.randint(2, 4)
        return None, None
    if dow in (0, 2, 4, 5):
        options = ["walking", "yoga", "swimming", "tai_chi", "stretching"]
        return random.choice(options), random.randint(3, 6)
    return None, None


PRESSURE_DROP_DATES = [
    (date(2025, 12, 12), 4),
    (date(2025, 12, 21), 3),
    (date(2026, 1, 3), 3),
    (date(2026, 1, 18), 5),
    (date(2026, 2, 6), 3),
    (date(2026, 2, 19), 4),
]

def weather_for_day(d: date) -> tuple[float, float, float]:
    day_num = (d - START_DATE).days
    t_base = 1.0 + 2.0 * math.cos(2 * math.pi * (day_num - 45) / 90)
    temp = jitter(t_base, 4.0)
    p_base = 1015.0 + 3.0 * math.sin(2 * math.pi * day_num / 90)
    for drop_start, duration in PRESSURE_DROP_DATES:
        day_offset = (d - drop_start).days
        if 0 <= day_offset < duration:
            mid = duration / 2
            drop = 18.0 * math.exp(-0.5 * ((day_offset - mid) / (duration / 3)) ** 2)
            p_base -= drop
    pressure = jitter(p_base, 3.0)
    humidity = jitter(62.0, 12.0)
    if pressure < 1005:
        humidity += 15.0
    return round(pressure, 1), round(temp, 1), round(clamp(humidity, 25, 98), 1)


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
    None, None, None, None, None, None,
]

MEDIUM_DAY_NOTES = [
    "[FICTITIOUS] Average fibro day, pushing through",
    "[FICTITIOUS] Stiff but functional",
    "[FICTITIOUS] Foggy brain but pain was manageable",
    None, None, None, None, None, None, None,
]


def compute_symptom_severity(d: date, pressure: float, sleep_quality: float) -> dict:
    day_num = (d - START_DATE).days
    phase = menstrual_phase(d)
    stress = STRESS_EVENTS.get(d)
    pain_base = 3.5
    if pressure < 1000:
        pain_base += 3.0
    elif pressure < 1005:
        pain_base += 2.0
    elif pressure < 1010:
        pain_base += 1.0
    pain_base += (1.0 - sleep_quality) * 2.5
    if stress:
        pain_base += random.uniform(0.5, 2.0)
    if phase == "luteal":
        pain_base += random.uniform(0.3, 1.2)
    elif phase == "menstrual":
        pain_base += random.uniform(0.5, 1.5)
    if d.month == 2:
        pain_base -= 0.5 + (d.day / 28) * 0.5
    pain_base += random.uniform(-1.0, 1.0)
    is_flare = pain_base >= 7.0
    pain_severity = int(clamp(round(pain_base), 0, 10))
    flare_severity = int(clamp(round(pain_base + 0.5), 1, 10)) if is_flare else None
    fatigue_base = pain_base * 0.8 + random.uniform(-1, 1.5)
    fatigue_base += (1.0 - sleep_quality) * 1.5
    fatigue = int(clamp(round(fatigue_base), 0, 10))
    fog_base = pain_base * 0.5 + (1.0 - sleep_quality) * 3.0 + random.uniform(-1, 1)
    brain_fog = int(clamp(round(fog_base), 0, 10))
    mood_base = 8.0 - pain_base * 0.6 - fatigue_base * 0.2 + random.uniform(-1, 1)
    if is_flare:
        mood_base -= 1.0
    mood = int(clamp(round(mood_base), 0, 10))
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
            "location": loc, "severity": loc_severity,
            "descriptors": descriptors, "note": None,
        })
    if pain_locations:
        pain_severity = max(loc["severity"] for loc in pain_locations)
        is_flare = pain_severity >= 7
        flare_severity = int(clamp(pain_severity + 1, 1, 10)) if is_flare else None
    if is_flare:
        notes = random.choice(FLARE_NOTES)
    elif pain_severity <= 3:
        notes = random.choice(GOOD_DAY_NOTES)
    else:
        notes = random.choice(MEDIUM_DAY_NOTES)
    missed_medications = None
    if brain_fog >= 7 and random.random() < 0.3:
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


def generate_biometrics(d: date, previous_sleep: float | None = None) -> dict:
    day_num = (d - START_DATE).days
    phase = menstrual_phase(d)
    stress = STRESS_EVENTS.get(d)
    sleep_base = 7.0
    if stress:
        sleep_base -= random.uniform(0.5, 1.5)
    if phase in ("luteal", "menstrual"):
        sleep_base -= random.uniform(0, 0.5)
    if d.month == 2:
        sleep_base += 0.3
    sleep_duration = round(clamp(jitter(sleep_base, 1.0), 4.0, 9.5), 1)
    eff_base = 85.0 if sleep_duration >= 7.0 else 75.0 + (sleep_duration - 4.0) * 3.0
    sleep_efficiency = round(clamp(jitter(eff_base, 5.0), 55, 98), 1)
    deep_base = 20.0
    if stress:
        deep_base -= 3.0
    deep_sleep = round(clamp(jitter(deep_base, 5.0), 5, 35), 1)
    rem_base = 22.0
    if sleep_duration < 6.5:
        rem_base -= 3.0
    rem_sleep = round(clamp(jitter(rem_base, 4.0), 8, 35), 1)
    hrv_base = 35.0
    if stress:
        hrv_base -= 5.0
    if sleep_duration >= 7.5:
        hrv_base += 3.0
    if d.month == 2 and d.day > 14:
        hrv_base += 4.0
    hrv = round(clamp(jitter(hrv_base, 8.0), 10, 70), 1)
    rhr_base = 67.0
    if stress:
        rhr_base += 3.0
    if d.month == 2 and d.day > 14:
        rhr_base -= 2.0
    resting_hr = round(clamp(jitter(rhr_base, 3.0), 52, 82), 1)
    temp_base = 0.0
    if phase == "luteal":
        temp_base += 0.3
    temp_dev = round(clamp(jitter(temp_base, 0.3), -1.0, 1.5), 2)
    act_base = 50 + day_num * 0.2
    if stress:
        act_base -= 10
    activity_score = int(clamp(jitter(act_base, 15), 10, 100))
    cal_base = 200 + activity_score * 2
    activity_calories = int(clamp(jitter(cal_base, 60), 80, 650))
    spo2 = round(clamp(jitter(97.5, 1.0), 94, 100), 1) if random.random() < 0.9 else None
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
        "sleep_quality": sleep_quality,
    }


# ---------------------------------------------------------------------------
# Database operations
# ---------------------------------------------------------------------------

def seed_database(user_id: int = 1):
    print(f"Seeding database at: {DB_PATH}")
    print(f"Date range: {START_DATE} to {END_DATE}")
    print(f"User ID: {user_id}")
    print("=" * 60)

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    now = iso_now()

    # --- Clear existing data for this user ---
    print("\nClearing existing data for user...")
    for table in [
        "symptom_logs", "biometric_readings", "contextual_data",
        "medications", "correlation_cache", "sync_log",
    ]:
        cursor.execute(f"DELETE FROM {table} WHERE user_id = ?", (user_id,))  # noqa: S608
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
            "INSERT INTO medications (user_id, name, dosage, frequency, is_active, created_at, updated_at) "
            "VALUES (?, ?, ?, ?, 1, ?, ?)",
            (user_id, name, dosage, frequency, now, now),
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

    prev_sleep_quality = 0.6

    for d in days:
        date_str = d.isoformat()

        bio = generate_biometrics(d)
        sleep_quality = bio.pop("sleep_quality")

        cursor.execute(
            "INSERT INTO biometric_readings "
            "(user_id, date, sleep_duration, sleep_efficiency, deep_sleep_pct, rem_sleep_pct, "
            "hrv_rmssd, resting_hr, temperature_deviation, activity_score, "
            "activity_calories, spo2, source, created_at, updated_at) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (
                user_id, date_str,
                bio["sleep_duration"], bio["sleep_efficiency"],
                bio["deep_sleep_pct"], bio["rem_sleep_pct"],
                bio["hrv_rmssd"], bio["resting_hr"],
                bio["temperature_deviation"], bio["activity_score"],
                bio["activity_calories"], bio["spo2"],
                bio["source"], now, now,
            ),
        )
        bio_count += 1

        pressure, temp, humidity = weather_for_day(d)
        phase = menstrual_phase(d)
        stress = STRESS_EVENTS.get(d)
        med_change = MED_CHANGES.get(d)
        exercise_type, exercise_rpe = exercise_for_day(d)

        cursor.execute(
            "INSERT INTO contextual_data "
            "(user_id, date, barometric_pressure, temperature, humidity, menstrual_phase, "
            "stress_event, medication_change, exercise_type, exercise_rpe, "
            "created_at, updated_at) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (
                user_id, date_str, pressure, temp, humidity, phase,
                stress, med_change, exercise_type, exercise_rpe,
                now, now,
            ),
        )
        ctx_count += 1

        symptoms = compute_symptom_severity(d, pressure, sleep_quality)

        cursor.execute(
            "INSERT INTO symptom_logs "
            "(user_id, date, pain_severity, pain_locations, fatigue_severity, brain_fog, "
            "mood, is_flare, flare_severity, notes, missed_medications, "
            "created_at, updated_at) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (
                user_id, date_str,
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

    cursor.execute(
        "INSERT INTO sync_log (user_id, source, sync_type, started_at, completed_at, "
        "status, records_synced, error_message) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        (
            user_id, "fictitious_seed", "bulk_import", now, now,
            "completed", bio_count + symptom_count + ctx_count,
            None,
        ),
    )

    cursor.execute(
        "INSERT OR REPLACE INTO app_settings (user_id, key, value, created_at, updated_at) "
        "VALUES (?, ?, ?, ?, ?)",
        (user_id, "weather_latitude", "40.7128", now, now),
    )
    cursor.execute(
        "INSERT OR REPLACE INTO app_settings (user_id, key, value, created_at, updated_at) "
        "VALUES (?, ?, ?, ?, ?)",
        (user_id, "weather_longitude", "-74.0060", now, now),
    )
    conn.commit()
    conn.close()

    print(f"\n{'=' * 60}")
    print("Seed complete!")
    print(f"  Symptom logs:     {symptom_count} days")
    print(f"  Flare days:       {flare_count} ({flare_count * 100 // symptom_count}%)")
    print(f"  Biometric entries: {bio_count} days")
    print(f"  Contextual entries:{ctx_count} days")
    print(f"  Medications:       {len(medications)}")
    print(f"  Date range:        {START_DATE} -> {END_DATE}")
    print(f"{'=' * 60}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed FibroSense demo data")
    parser.add_argument("--user-id", type=int, default=1, help="User ID to seed data for")
    args = parser.parse_args()
    seed_database(user_id=args.user_id)
