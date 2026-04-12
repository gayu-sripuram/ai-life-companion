from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models.mood_entry import MoodEntry
from models.user import User
from schemas.ai import AIAnalysisResponse
from services.ai_service import analyze_mood_history
from services.dependencies import get_current_user


router = APIRouter(prefix="/ai", tags=["ai"])


@router.get("/mood-insights", response_model=AIAnalysisResponse)
def get_mood_insights(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    moods = (
        db.query(MoodEntry)
        .filter(MoodEntry.user_id == current_user.id)
        .order_by(MoodEntry.entry_date.desc())
        .limit(14)
        .all()
    )
    result = analyze_mood_history(list(reversed(moods)))
    return AIAnalysisResponse(**result)
