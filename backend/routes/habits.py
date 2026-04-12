from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models.habit import Habit
from models.habit_completion import HabitCompletion
from models.user import User
from schemas.habit import HabitCreate, HabitResponse, HabitToggleRequest, HabitUpdate
from services.dependencies import get_current_user
from services.habits import calculate_streak


router = APIRouter(prefix="/habits", tags=["habits"])


def serialize_habit(habit: Habit) -> HabitResponse:
    completion_dates = sorted((item.completed_date for item in habit.completions), reverse=True)
    return HabitResponse(
        id=habit.id,
        title=habit.title,
        details=habit.details or "",
        streak=calculate_streak(habit),
        completed_today=date.today() in set(completion_dates),
        completion_dates=completion_dates,
    )


@router.post("/", response_model=HabitResponse, status_code=status.HTTP_201_CREATED)
def create_habit(
    payload: HabitCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    habit = Habit(user_id=current_user.id, title=payload.title, details=payload.details)
    db.add(habit)
    db.commit()
    db.refresh(habit)
    return serialize_habit(habit)


@router.get("/", response_model=list[HabitResponse])
def list_habits(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    habits = db.query(Habit).filter(Habit.user_id == current_user.id).all()
    return [serialize_habit(habit) for habit in habits]


@router.put("/{habit_id}", response_model=HabitResponse)
def update_habit(
    habit_id: int,
    payload: HabitUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    habit = db.query(Habit).filter(Habit.id == habit_id, Habit.user_id == current_user.id).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")

    habit.title = payload.title
    habit.details = payload.details
    db.commit()
    db.refresh(habit)
    return serialize_habit(habit)


@router.delete("/{habit_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_habit(
    habit_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    habit = db.query(Habit).filter(Habit.id == habit_id, Habit.user_id == current_user.id).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")

    db.delete(habit)
    db.commit()


@router.post("/{habit_id}/toggle", response_model=HabitResponse)
def toggle_habit_completion(
    habit_id: int,
    payload: HabitToggleRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    habit = db.query(Habit).filter(Habit.id == habit_id, Habit.user_id == current_user.id).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")

    completion = (
        db.query(HabitCompletion)
        .filter(HabitCompletion.habit_id == habit.id, HabitCompletion.completed_date == date.today())
        .first()
    )
    if payload.completed and not completion:
        db.add(HabitCompletion(habit_id=habit.id, completed_date=date.today()))
    elif not payload.completed and completion:
        db.delete(completion)

    db.commit()
    db.refresh(habit)
    return serialize_habit(habit)
