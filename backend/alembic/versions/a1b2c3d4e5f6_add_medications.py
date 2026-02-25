"""add medications table and missed_medications column

Revision ID: a1b2c3d4e5f6
Revises: 217dbdf39456
Create Date: 2026-02-25 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, Sequence[str], None] = "217dbdf39456"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create medications table and add missed_medications to symptom_logs."""
    op.create_table(
        "medications",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.Text(), nullable=False),
        sa.Column("dosage", sa.Text(), nullable=True),
        sa.Column("frequency", sa.Text(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("1")),
        sa.Column("created_at", sa.Text(), nullable=False),
        sa.Column("updated_at", sa.Text(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )

    with op.batch_alter_table("symptom_logs", schema=None) as batch_op:
        batch_op.add_column(sa.Column("missed_medications", sa.Text(), nullable=True))


def downgrade() -> None:
    """Drop medications table and remove missed_medications column."""
    with op.batch_alter_table("symptom_logs", schema=None) as batch_op:
        batch_op.drop_column("missed_medications")

    op.drop_table("medications")
