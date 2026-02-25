"""convert pain_locations to object format

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-02-25 12:01:00.000000

"""
import json
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "b2c3d4e5f6a7"
down_revision: Union[str, Sequence[str], None] = "a1b2c3d4e5f6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Convert pain_locations from list of strings to list of objects."""
    conn = op.get_bind()
    rows = conn.execute(
        sa.text("SELECT id, pain_locations, pain_severity FROM symptom_logs")
    ).fetchall()

    for row in rows:
        old_locations = json.loads(row[1])
        severity = row[2]

        # Already in new format (list of dicts)
        if old_locations and isinstance(old_locations[0], dict):
            continue

        new_locations = [
            {"location": loc, "severity": severity, "descriptors": [], "note": None}
            for loc in old_locations
        ]

        conn.execute(
            sa.text("UPDATE symptom_logs SET pain_locations = :locs WHERE id = :id"),
            {"locs": json.dumps(new_locations), "id": row[0]},
        )


def downgrade() -> None:
    """Convert pain_locations back from objects to plain strings."""
    conn = op.get_bind()
    rows = conn.execute(
        sa.text("SELECT id, pain_locations FROM symptom_logs")
    ).fetchall()

    for row in rows:
        locations = json.loads(row[1])

        # Already in old format (list of strings)
        if not locations or isinstance(locations[0], str):
            continue

        old_locations = [entry["location"] for entry in locations]

        conn.execute(
            sa.text("UPDATE symptom_logs SET pain_locations = :locs WHERE id = :id"),
            {"locs": json.dumps(old_locations), "id": row[0]},
        )
