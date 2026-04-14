from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models.expense import Expense
from models.habit import Habit
from models.mood_entry import MoodEntry
from models.user import User
from schemas.ai import AIAnalysisResponse, FinancialInsightsResponse, LifeInsightsResponse
from services.ai_service import (
    analyze_financial_data,
    analyze_life_patterns,
    analyze_mood_history,
    recent_date_cutoff,
    thirty_days_ago,
)
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


@router.get("/financial-insights", response_model=FinancialInsightsResponse)
def get_financial_insights(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    expenses = (
        db.query(Expense)
        .filter(Expense.user_id == current_user.id, Expense.created_at >= thirty_days_ago())
        .order_by(Expense.created_at.desc())
        .all()
    )
    result = analyze_financial_data(list(reversed(expenses)))
    return FinancialInsightsResponse(**result)


@router.get("/life-insights", response_model=LifeInsightsResponse)
def get_life_insights(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    mood_cutoff = recent_date_cutoff(30)
    moods = (
        db.query(MoodEntry)
        .filter(MoodEntry.user_id == current_user.id, MoodEntry.entry_date >= mood_cutoff)
        .order_by(MoodEntry.entry_date.desc())
        .all()
    )
    habits = db.query(Habit).filter(Habit.user_id == current_user.id).all()
    expenses = (
        db.query(Expense)
        .filter(Expense.user_id == current_user.id, Expense.created_at >= thirty_days_ago())
        .order_by(Expense.created_at.desc())
        .all()
    )
    result = analyze_life_patterns(list(reversed(moods)), habits, list(reversed(expenses)))
    return LifeInsightsResponse(**result)
