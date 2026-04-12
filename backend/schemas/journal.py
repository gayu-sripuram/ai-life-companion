from datetime import datetime

from pydantic import BaseModel


class JournalEntryCreate(BaseModel):
    content: str
    is_private: bool = True


class JournalEntryUpdate(BaseModel):
    content: str
    is_private: bool = True


class JournalEntryResponse(BaseModel):
    id: int
    user_id: int
    content: str
    is_private: bool
    created_at: datetime

    model_config = {"from_attributes": True}
