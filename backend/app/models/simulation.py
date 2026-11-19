
from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey,
    JSON,
    func,
)
from app.core.database import Base


class SimulationSession(Base):
    __tablename__ = "simulation_sessions"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    career_slug = Column(String(100), nullable=False)
    scenario_id = Column(String(100), nullable=False)

    status = Column(
        String(30),
        default="in_progress",
        nullable=False,
    )

    current_step = Column(Integer, default=1, nullable=False)
    score = Column(Integer, default=0, nullable=False)

    state = Column(JSON, default=dict, nullable=False)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    completed_at = Column(DateTime(timezone=True), nullable=True)
