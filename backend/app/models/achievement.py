from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    UniqueConstraint,
    func,
)

from app.core.database import Base


class UserAchievement(Base):
    __tablename__ = "user_achievements"

    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "achievement_key",
            name="uq_user_achievement",
        ),
    )

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    achievement_key = Column(String(100), nullable=False)
    unlocked_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )