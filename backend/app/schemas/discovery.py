
from typing import Literal

from pydantic import BaseModel, Field


Interest = Literal[
    "software", "healthcare", "design", "science",
    "education", "business", "law", "engineering"
]

Strength = Literal[
    "problem_solving", "communication", "creativity",
    "empathy", "analysis", "organization", "technical"
]

WorkStyle = Literal[
    "independent", "collaborative", "structured",
    "flexible", "fast_paced"
]

Priority = Literal[
    "impact", "stability", "creativity",
    "income", "flexibility", "learning"
]


class DiscoveryRequest(BaseModel):
    interests: list[Interest] = Field(min_length=1, max_length=8)
    strengths: list[Strength] = Field(min_length=1, max_length=7)
    work_styles: list[WorkStyle] = Field(min_length=1, max_length=5)
    priorities: list[Priority] = Field(min_length=1, max_length=6)


class CareerRecommendation(BaseModel):
    career: str
    description: str
    match_score: int
    reasons: list[str]
    reality_check: str


class DiscoveryResponse(BaseModel):
    recommendations: list[CareerRecommendation]
    message: str
