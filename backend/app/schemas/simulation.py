
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


class SimulationResponse(BaseModel):
    session_id: int
    career: str
    scenario: str
    status: str
    current_step: int
    score: int
    title: str
    message: str
    options: list[SimulationOption]
    feedback: str | None = None
    manager_dialogue: str | None = None
