from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import get_settings
from database import Base, engine
from models import Habit, HabitCompletion, JournalEntry, MoodEntry, User
from routes import ai, auth, habits, journal, mood
from services.migrations import ensure_sqlite_columns


settings = get_settings()
Base.metadata.create_all(bind=engine)
ensure_sqlite_columns(engine)

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(journal.router)
app.include_router(mood.router)
app.include_router(habits.router)
app.include_router(ai.router)


@app.get("/")
def root():
    return {"message": "AI Life Companion API is running"}


_ = (User, JournalEntry, MoodEntry, Habit, HabitCompletion)
