from datetime import date, timedelta

from models.habit import Habit


def calculate_streak(habit: Habit) -> int:
    completion_dates = {completion.completed_date for completion in habit.completions}
    if not completion_dates:
        return 0

    streak = 0
    current_day = date.today()
    if current_day not in completion_dates:
        current_day -= timedelta(days=1)

    while current_day in completion_dates:
        streak += 1
        current_day -= timedelta(days=1)

    return streak
