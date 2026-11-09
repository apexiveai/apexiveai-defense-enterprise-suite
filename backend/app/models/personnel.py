
from datetime import datetime, timezone

from sqlalchemy import String, DateTime
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Personnel(Base):
    __tablename__ = "personnel"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    employee_code: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        index=True,
        nullable=False
    )

    full_name: Mapped[str] = mapped_column(
        String(150),
        nullable=False
    )

    department: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    job_title: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    employment_status: Mapped[str] = mapped_column(
        String(30),
        default="ACTIVE",
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
