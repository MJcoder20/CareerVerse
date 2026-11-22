from datetime import datetime

from pydantic import BaseModel, Field, ConfigDict


class CareerGoalCreate(BaseModel):
    career_role: str = Field(min_length=2, max_length=150)
    target_simulations: int = Field(default=5, ge=1, le=100)
    target_xp: int = Field(default=1000, ge=100, le=100000)


class CareerGoalResponse(BaseModel):
    id: int
    career_role: str
    target_simulations: int
    target_xp: int
    created_at: datetime
    updated_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)