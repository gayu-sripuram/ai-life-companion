from datetime import datetime, timedelta, timezone

from sqlalchemy import func
from sqlalchemy.orm import Session

from models.expense import Expense


def get_recent_expenses_query(db: Session, user_id: int, days: int = 30):
    since = datetime.now(timezone.utc) - timedelta(days=days)
    return db.query(Expense).filter(Expense.user_id == user_id, Expense.created_at >= since)


def get_monthly_summary(db: Session, user_id: int) -> dict:
    expenses = get_recent_expenses_query(db, user_id).all()
    total_income = sum(item.amount for item in expenses if item.type == "income")
    total_expense = sum(item.amount for item in expenses if item.type == "expense")
    return {
        "total_income": round(total_income, 2),
        "total_expense": round(total_expense, 2),
        "balance": round(total_income - total_expense, 2),
    }


def get_category_breakdown(db: Session, user_id: int) -> list[dict]:
    rows = (
        get_recent_expenses_query(db, user_id)
        .filter(Expense.type == "expense")
        .with_entities(Expense.category, func.sum(Expense.amount).label("total"))
        .group_by(Expense.category)
        .order_by(func.sum(Expense.amount).desc())
        .all()
    )
    return [{"category": category, "total": round(total, 2)} for category, total in rows]
