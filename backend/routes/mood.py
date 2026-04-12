from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models.mood_entry import MoodEntry
from models.user import User
from schemas.mood import MoodEntryCreate, MoodEntryResponse
from services.dependencies import get_current_user


router = APIRouter(prefix="/moods", tags=["moods"])


@router.post("/", response_model=MoodEntryResponse)
def upsert_mood(
    payload: MoodEntryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    today = date.today()
    mood_entry = (
        db.query(MoodEntry)
        .filter(MoodEntry.user_id == current_user.id, MoodEntry.entry_date == today)
        .first()
    )
    if mood_entry:
        mood_entry.mood = payload.mood
    else:
        mood_entry = MoodEntry(user_id=current_user.id, mood=payload.mood, entry_date=today)
        db.add(mood_entry)

    db.commit()
    db.refresh(mood_entry)
    return mood_entry


@router.get("/", response_model=list[MoodEntryResponse])
def list_moods(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(MoodEntry).filter(MoodEntry.user_id == current_user.id).order_by(MoodEntry.entry_date.desc()).all()
