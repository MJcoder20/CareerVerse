
from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey,
    JSON,
    func,
    UniqueConstraint,
)

from app.core.database import Base


class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)

    session_id = Column(
        Integer,
        ForeignKey("simulation_sessions.id"),
        nullable=False,
        unique=True,
        index=True,
    )

    overall_score = Column(Integer, nullable=False)
    max_score = Column(Integer, nullable=False)
    percentage = Column(Integer, nullable=False)

    skill_scores = Column(JSON, nullable=False, default=dict)
    strengths = Column(JSON, nullable=False, default=list)
    improvement_areas = Column(JSON, nullable=False, default=list)
    recommendations = Column(JSON, nullable=False, default=list)

    roadmap_progress = Column(JSON, nullable=False, default=dict)
    summary = Column(String(1000), nullable=False)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

