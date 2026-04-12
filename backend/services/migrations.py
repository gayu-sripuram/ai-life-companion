from sqlalchemy import inspect, text
from sqlalchemy.engine import Engine


def ensure_sqlite_columns(engine: Engine) -> None:
    if engine.dialect.name != "sqlite":
        return

    inspector = inspect(engine)

    if inspector.has_table("journal_entries"):
        journal_columns = {column["name"] for column in inspector.get_columns("journal_entries")}
        if "is_private" not in journal_columns:
            with engine.begin() as connection:
                connection.execute(
                    text("ALTER TABLE journal_entries ADD COLUMN is_private BOOLEAN NOT NULL DEFAULT 1")
                )

    if inspector.has_table("habits"):
        habit_columns = {column["name"] for column in inspector.get_columns("habits")}
        if "details" not in habit_columns:
            with engine.begin() as connection:
                connection.execute(text("ALTER TABLE habits ADD COLUMN details TEXT NOT NULL DEFAULT ''"))
