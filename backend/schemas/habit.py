from datetime import date

from pydantic import BaseModel


class HabitCreate(BaseModel):
    title: str
    details: str = ""


class HabitUpdate(BaseModel):
    title: str
    details: str = ""


class HabitToggleRequest(BaseModel):
    completed: bool


class HabitResponse(BaseModel):
    id: int
    title: str
    details: str
    streak: int
    completed_today: bool
    completion_dates: list[date]
