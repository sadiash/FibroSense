"""add users table and user_id to all data tables

Revision ID: d4e5f6a7b8c9
Revises: c3d4e5f6a7b8
Create Date: 2026-02-26 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "d4e5f6a7b8c9"
down_revision: Union[str, None] = "c3d4e5f6a7b8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Create users table
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("email", sa.Text(), nullable=False),
        sa.Column("hashed_password", sa.Text(), nullable=False),
        sa.Column("full_name", sa.Text(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="1"),
        sa.Column("created_at", sa.Text(), nullable=False),
        sa.Column("updated_at", sa.Text(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    # 2. Insert legacy user so existing data has a valid FK target
    op.execute(
        "INSERT INTO users (id, email, hashed_password, full_name, is_active, created_at, updated_at) "
        "VALUES (1, 'legacy@fibrosense.local', 'NOLOGIN', 'Legacy User', 1, "
        "datetime('now'), datetime('now'))"
    )

    # 3. Add user_id to tables with simple PKs (symptom_logs, medications, correlation_cache, sync_log)
    for table in ["symptom_logs", "medications", "correlation_cache", "sync_log"]:
        with op.batch_alter_table(table) as batch_op:
            batch_op.add_column(sa.Column("user_id", sa.Integer(), nullable=False, server_default="1"))
            batch_op.create_foreign_key(f"fk_{table}_user", "users", ["user_id"], ["id"])
            batch_op.create_index(f"idx_{table}_user_id", ["user_id"])

    # Add composite index for symptom_logs
    with op.batch_alter_table("symptom_logs") as batch_op:
        batch_op.create_index("idx_symptom_logs_user_date", ["user_id", "date"])

    # 4. Recreate biometric_readings with composite PK (user_id, date)
    # SQLite cannot alter PKs, so we must recreate the table
    op.create_table(
        "biometric_readings_new",
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("date", sa.Text(), nullable=False),
        sa.Column("sleep_duration", sa.Float(), nullable=False),
        sa.Column("sleep_efficiency", sa.Float(), nullable=False),
        sa.Column("deep_sleep_pct", sa.Float(), nullable=False),
        sa.Column("rem_sleep_pct", sa.Float(), nullable=False),
        sa.Column("hrv_rmssd", sa.Float(), nullable=False),
        sa.Column("resting_hr", sa.Float(), nullable=False),
        sa.Column("temperature_deviation", sa.Float(), nullable=False),
        sa.Column("activity_score", sa.Integer(), nullable=False),
        sa.Column("activity_calories", sa.Integer(), nullable=False),
        sa.Column("spo2", sa.Float(), nullable=True),
        sa.Column("source", sa.Text(), server_default="oura"),
        sa.Column("created_at", sa.Text(), nullable=False),
        sa.Column("updated_at", sa.Text(), nullable=False),
        sa.PrimaryKeyConstraint("user_id", "date"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.CheckConstraint("sleep_efficiency >= 0 AND sleep_efficiency <= 100", name="ck_sleep_efficiency"),
        sa.CheckConstraint("deep_sleep_pct >= 0 AND deep_sleep_pct <= 100", name="ck_deep_sleep_pct"),
        sa.CheckConstraint("rem_sleep_pct >= 0 AND rem_sleep_pct <= 100", name="ck_rem_sleep_pct"),
    )
    op.execute(
        "INSERT INTO biometric_readings_new "
        "(user_id, date, sleep_duration, sleep_efficiency, deep_sleep_pct, rem_sleep_pct, "
        "hrv_rmssd, resting_hr, temperature_deviation, activity_score, activity_calories, "
        "spo2, source, created_at, updated_at) "
        "SELECT 1, date, sleep_duration, sleep_efficiency, deep_sleep_pct, rem_sleep_pct, "
        "hrv_rmssd, resting_hr, temperature_deviation, activity_score, activity_calories, "
        "spo2, source, created_at, updated_at "
        "FROM biometric_readings"
    )
    op.drop_table("biometric_readings")
    op.rename_table("biometric_readings_new", "biometric_readings")
    op.create_index("idx_biometric_readings_source", "biometric_readings", ["source"])

    # 5. Recreate contextual_data with composite PK (user_id, date)
    op.create_table(
        "contextual_data_new",
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("date", sa.Text(), nullable=False),
        sa.Column("barometric_pressure", sa.Float(), nullable=True),
        sa.Column("temperature", sa.Float(), nullable=True),
        sa.Column("humidity", sa.Float(), nullable=True),
        sa.Column("menstrual_phase", sa.Text(), nullable=True),
        sa.Column("stress_event", sa.Text(), nullable=True),
        sa.Column("medication_change", sa.Text(), nullable=True),
        sa.Column("exercise_type", sa.Text(), nullable=True),
        sa.Column("exercise_rpe", sa.Integer(), nullable=True),
        sa.Column("diet_flags", sa.Text(), nullable=True),
        sa.Column("created_at", sa.Text(), nullable=False),
        sa.Column("updated_at", sa.Text(), nullable=False),
        sa.PrimaryKeyConstraint("user_id", "date"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.CheckConstraint(
            "menstrual_phase IS NULL OR menstrual_phase IN "
            "('menstrual', 'follicular', 'ovulatory', 'luteal', 'not_applicable')",
            name="ck_menstrual_phase",
        ),
        sa.CheckConstraint(
            "exercise_rpe IS NULL OR (exercise_rpe >= 1 AND exercise_rpe <= 10)",
            name="ck_exercise_rpe",
        ),
    )
    op.execute(
        "INSERT INTO contextual_data_new "
        "(user_id, date, barometric_pressure, temperature, humidity, menstrual_phase, "
        "stress_event, medication_change, exercise_type, exercise_rpe, diet_flags, "
        "created_at, updated_at) "
        "SELECT 1, date, barometric_pressure, temperature, humidity, menstrual_phase, "
        "stress_event, medication_change, exercise_type, exercise_rpe, diet_flags, "
        "created_at, updated_at "
        "FROM contextual_data"
    )
    op.drop_table("contextual_data")
    op.rename_table("contextual_data_new", "contextual_data")

    # 6. Recreate app_settings with composite PK (user_id, key)
    op.create_table(
        "app_settings_new",
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("key", sa.Text(), nullable=False),
        sa.Column("value", sa.Text(), nullable=False),
        sa.Column("created_at", sa.Text(), nullable=False),
        sa.Column("updated_at", sa.Text(), nullable=False),
        sa.PrimaryKeyConstraint("user_id", "key"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
    )
    op.execute(
        "INSERT INTO app_settings_new (user_id, key, value, created_at, updated_at) "
        "SELECT 1, key, value, created_at, updated_at FROM app_settings"
    )
    op.drop_table("app_settings")
    op.rename_table("app_settings_new", "app_settings")


def downgrade() -> None:
    # This is a destructive migration — downgrade drops user_id columns
    # Recreate app_settings with single PK
    op.create_table(
        "app_settings_old",
        sa.Column("key", sa.Text(), nullable=False),
        sa.Column("value", sa.Text(), nullable=False),
        sa.Column("created_at", sa.Text(), nullable=False),
        sa.Column("updated_at", sa.Text(), nullable=False),
        sa.PrimaryKeyConstraint("key"),
    )
    op.execute("INSERT INTO app_settings_old SELECT key, value, created_at, updated_at FROM app_settings")
    op.drop_table("app_settings")
    op.rename_table("app_settings_old", "app_settings")

    # Recreate contextual_data with single PK
    op.create_table(
        "contextual_data_old",
        sa.Column("date", sa.Text(), nullable=False),
        sa.Column("barometric_pressure", sa.Float(), nullable=True),
        sa.Column("temperature", sa.Float(), nullable=True),
        sa.Column("humidity", sa.Float(), nullable=True),
        sa.Column("menstrual_phase", sa.Text(), nullable=True),
        sa.Column("stress_event", sa.Text(), nullable=True),
        sa.Column("medication_change", sa.Text(), nullable=True),
        sa.Column("exercise_type", sa.Text(), nullable=True),
        sa.Column("exercise_rpe", sa.Integer(), nullable=True),
        sa.Column("diet_flags", sa.Text(), nullable=True),
        sa.Column("created_at", sa.Text(), nullable=False),
        sa.Column("updated_at", sa.Text(), nullable=False),
        sa.PrimaryKeyConstraint("date"),
    )
    op.execute(
        "INSERT OR IGNORE INTO contextual_data_old "
        "SELECT date, barometric_pressure, temperature, humidity, menstrual_phase, "
        "stress_event, medication_change, exercise_type, exercise_rpe, diet_flags, "
        "created_at, updated_at FROM contextual_data"
    )
    op.drop_table("contextual_data")
    op.rename_table("contextual_data_old", "contextual_data")

    # Recreate biometric_readings with single PK
    op.create_table(
        "biometric_readings_old",
        sa.Column("date", sa.Text(), nullable=False),
        sa.Column("sleep_duration", sa.Float(), nullable=False),
        sa.Column("sleep_efficiency", sa.Float(), nullable=False),
        sa.Column("deep_sleep_pct", sa.Float(), nullable=False),
        sa.Column("rem_sleep_pct", sa.Float(), nullable=False),
        sa.Column("hrv_rmssd", sa.Float(), nullable=False),
        sa.Column("resting_hr", sa.Float(), nullable=False),
        sa.Column("temperature_deviation", sa.Float(), nullable=False),
        sa.Column("activity_score", sa.Integer(), nullable=False),
        sa.Column("activity_calories", sa.Integer(), nullable=False),
        sa.Column("spo2", sa.Float(), nullable=True),
        sa.Column("source", sa.Text(), server_default="oura"),
        sa.Column("created_at", sa.Text(), nullable=False),
        sa.Column("updated_at", sa.Text(), nullable=False),
        sa.PrimaryKeyConstraint("date"),
    )
    op.execute(
        "INSERT OR IGNORE INTO biometric_readings_old "
        "SELECT date, sleep_duration, sleep_efficiency, deep_sleep_pct, rem_sleep_pct, "
        "hrv_rmssd, resting_hr, temperature_deviation, activity_score, activity_calories, "
        "spo2, source, created_at, updated_at FROM biometric_readings"
    )
    op.drop_table("biometric_readings")
    op.rename_table("biometric_readings_old", "biometric_readings")

    # Remove user_id from simple tables
    for table in ["symptom_logs", "medications", "correlation_cache", "sync_log"]:
        with op.batch_alter_table(table) as batch_op:
            batch_op.drop_column("user_id")

    # Drop users table
    op.drop_index("ix_users_email", "users")
    op.drop_table("users")
