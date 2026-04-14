from typing import Literal

from pydantic import BaseModel


class AIAnalysisResponse(BaseModel):
    summary: str
    sentiment: Literal["happy", "neutral", "sad"]


class FinancialInsightsResponse(BaseModel):
    insights: str
    suggestions: str


class LifeInsightsResponse(BaseModel):
    insights: str
