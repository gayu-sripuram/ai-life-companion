from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models.expense import Expense
from models.user import User
from schemas.expense import (
    CategoryBreakdownResponse,
    ExpenseCreate,
    ExpenseResponse,
    ExpenseUpdate,
    MonthlySummaryResponse,
)
from services.dependencies import get_current_user
from services.expenses import get_category_breakdown, get_monthly_summary


router = APIRouter(prefix="/expenses", tags=["expenses"])


@router.post("/", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
def create_expense(
    payload: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    expense = Expense(
        user_id=current_user.id,
        amount=payload.amount,
        category=payload.category,
        type=payload.type,
        description=payload.description,
    )
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense


@router.get("/", response_model=list[ExpenseResponse])
def list_expenses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Expense)
        .filter(Expense.user_id == current_user.id)
        .order_by(Expense.created_at.desc())
        .all()
    )


@router.get("/summary/monthly", response_model=MonthlySummaryResponse)
def monthly_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return MonthlySummaryResponse(**get_monthly_summary(db, current_user.id))


@router.get("/summary/category", response_model=CategoryBreakdownResponse)
def category_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return CategoryBreakdownResponse(items=get_category_breakdown(db, current_user.id))


@router.put("/{expense_id}", response_model=ExpenseResponse)
def update_expense(
    expense_id: int,
    payload: ExpenseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    expense = db.query(Expense).filter(Expense.id == expense_id, Expense.user_id == current_user.id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    expense.amount = payload.amount
    expense.category = payload.category
    expense.type = payload.type
    expense.description = payload.description
    db.commit()
    db.refresh(expense)
    return expense


@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    expense = db.query(Expense).filter(Expense.id == expense_id, Expense.user_id == current_user.id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    db.delete(expense)
    db.commit()
