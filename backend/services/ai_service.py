from fastapi import HTTPException
from openai import OpenAI
from pydantic import BaseModel

from config import get_settings
from models.mood_entry import MoodEntry


settings = get_settings()


class MoodInsight(BaseModel):
    summary: str
    sentiment: str


def analyze_mood_history(mood_entries: list[MoodEntry]) -> dict:
    if not settings.openai_api_key:
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY is not configured")
    if not mood_entries:
        raise HTTPException(status_code=400, detail="No mood history available yet")

    client = OpenAI(api_key=settings.openai_api_key)
    mood_lines = [f"{entry.entry_date.isoformat()}: {entry.mood}" for entry in mood_entries]
    prompt = (
        "You are analyzing mood history only. Do not mention journal entries or habits. "
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
