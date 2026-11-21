
from datetime import datetime

from pydantic import BaseModel, Field


class SimulationHistoryItem(BaseModel):
    session_id: int
    career: str
    scenario: str
    status: str
    score: int
    created_at: datetime


class SimulationStartRequest(BaseModel):
    career_slug: str = "software-engineer"
    scenario_id: str = "nexatech-login-outage"


class DecisionRequest(BaseModel):
    option_id: str = Field(min_length=1, max_length=100)


class SimulationOption(BaseModel):
    id: str
    label: str

class LevelUpData(BaseModel):
    previous_level: int
    new_level: int
    xp_earned: int

class SimulationResponse(BaseModel):
    session_id: int
    career: str
    scenario: str
    status: str
    current_step: int
    total_steps: int
    completed_steps: int
    progress: int
    score: int
    title: str
    message: str
    options: list[SimulationOption]
    feedback: str | None = None
    manager_dialogue: str | None = None
    level_up: LevelUpData | None = None
    newly_unlocked_achievements: list[str] = []
