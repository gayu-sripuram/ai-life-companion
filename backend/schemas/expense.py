from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


ExpenseType = Literal["income", "expense"]


class ExpenseCreate(BaseModel):
    amount: float = Field(gt=0)
    category: str
    type: ExpenseType
    description: str = ""


class ExpenseUpdate(BaseModel):
    amount: float = Field(gt=0)
    category: str
    type: ExpenseType
    description: str = ""


class ExpenseResponse(BaseModel):
    id: int
    user_id: int
    amount: float
    category: str
    type: ExpenseType
    description: str
    created_at: datetime

    model_config = {"from_attributes": True}


class MonthlySummaryResponse(BaseModel):
    total_income: float
    total_expense: float
    balance: float


class CategoryBreakdownItem(BaseModel):
    category: str
    total: float


class CategoryBreakdownResponse(BaseModel):
    items: list[CategoryBreakdownItem]
