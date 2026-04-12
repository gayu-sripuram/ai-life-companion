from datetime import date
from typing import Literal

from pydantic import BaseModel


MoodType = Literal["happy", "okay", "sad", "worst"]


class MoodEntryCreate(BaseModel):
    mood: MoodType


class MoodEntryResponse(BaseModel):
    id: int
    user_id: int
    mood: MoodType
    entry_date: date

    model_config = {"from_attributes": True}
