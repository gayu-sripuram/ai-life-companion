from collections import defaultdict
from datetime import date, datetime, timedelta, timezone

from fastapi import HTTPException
from openai import OpenAI
from pydantic import BaseModel

from config import get_settings
from models.expense import Expense
from models.habit import Habit
from models.mood_entry import MoodEntry


settings = get_settings()


class MoodInsight(BaseModel):
    summary: str
    sentiment: str


class FinancialInsight(BaseModel):
    insights: str
    suggestions: str


class LifeInsight(BaseModel):
    insights: str


def _get_client() -> OpenAI:
    if not settings.openai_api_key:
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY is not configured")
    return OpenAI(api_key=settings.openai_api_key)


def analyze_mood_history(mood_entries: list[MoodEntry]) -> dict:
    if not mood_entries:
        raise HTTPException(status_code=400, detail="No mood history available yet")

    client = _get_client()
    mood_lines = [f"{entry.entry_date.isoformat()}: {entry.mood}" for entry in mood_entries]
    prompt = (
        "You are analyzing mood history only. Do not mention journal entries, habits, or expenses. "
        "Return JSON with exactly these keys: "
        'summary (short string), sentiment (one of: happy, neutral, sad). '
        "Keep the summary brief, supportive, and based only on the mood data provided."
    )

    response = client.responses.parse(
        model="gpt-4o-mini",
        input=[
            {"role": "system", "content": prompt},
            {"role": "user", "content": "\n".join(mood_lines)},
        ],
        text_format=MoodInsight,
    )
    parsed = response.output_parsed
    if not parsed:
        raise HTTPException(status_code=502, detail="AI response could not be parsed")

    summary = parsed.summary.strip()
    sentiment = parsed.sentiment.strip()
    if sentiment not in {"happy", "neutral", "sad"}:
        raise HTTPException(status_code=502, detail="AI returned an unsupported sentiment")

    return {"summary": summary, "sentiment": sentiment}


def analyze_financial_data(expenses: list[Expense]) -> dict:
    if not expenses:
        raise HTTPException(status_code=400, detail="No expense data available for the last 30 days")

    client = _get_client()
    expense_lines = [
        f"{item.created_at.date().isoformat()} | {item.type} | {item.category} | {item.amount:.2f} | {item.description or 'No description'}"
        for item in expenses
    ]
    prompt = (
        "You are a careful financial coach. Use only the expense and income data provided. "
        "Return JSON with exactly these keys: insights, suggestions. "
        "The insights should summarize patterns. The suggestions should be practical and supportive."
    )

    response = client.responses.parse(
        model="gpt-4o-mini",
        input=[
            {"role": "system", "content": prompt},
            {"role": "user", "content": "\n".join(expense_lines)},
        ],
        text_format=FinancialInsight,
    )
    parsed = response.output_parsed
    if not parsed:
        raise HTTPException(status_code=502, detail="AI response could not be parsed")
    return {"insights": parsed.insights.strip(), "suggestions": parsed.suggestions.strip()}


def analyze_life_patterns(moods: list[MoodEntry], habits: list[Habit], expenses: list[Expense]) -> dict:
    if not moods and not habits and not expenses:
        raise HTTPException(status_code=400, detail="Not enough data available for life insights")

    client = _get_client()
    mood_by_day = {entry.entry_date.isoformat(): entry.mood for entry in moods}

    habit_days = defaultdict(list)
    for habit in habits:
        for completion in habit.completions:
            habit_days[completion.completed_date.isoformat()].append(habit.title)

    spending_by_day = defaultdict(float)
    for expense in expenses:
        if expense.type == "expense":
            spending_by_day[expense.created_at.date().isoformat()] += expense.amount

    combined_days = sorted(set(mood_by_day) | set(habit_days) | set(spending_by_day))
    timeline_lines = []
    for day in combined_days:
        timeline_lines.append(
            f"{day} | mood={mood_by_day.get(day, 'none')} | habits={', '.join(habit_days.get(day, [])) or 'none'} | spending={spending_by_day.get(day, 0):.2f}"
        )

    prompt = (
        "You are a supportive life coach. Use only the mood, habit completion, and spending timeline provided. "
        "Return JSON with exactly this key: insights. "
        "Mention cross-feature patterns such as mood vs spending or habits vs mood when supported by the data."
    )
    response = client.responses.parse(
        model="gpt-4o-mini",
        input=[
            {"role": "system", "content": prompt},
            {"role": "user", "content": "\n".join(timeline_lines)},
        ],
        text_format=LifeInsight,
    )
    parsed = response.output_parsed
    if not parsed:
        raise HTTPException(status_code=502, detail="AI response could not be parsed")
    return {"insights": parsed.insights.strip()}


def thirty_days_ago() -> datetime:
    return datetime.now(timezone.utc) - timedelta(days=30)


def recent_date_cutoff(days: int = 30) -> date:
    return date.today() - timedelta(days=days)
