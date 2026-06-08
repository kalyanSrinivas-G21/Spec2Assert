import json
import os
import sqlite3
from contextlib import contextmanager

DB_PATH = os.getenv("DB_PATH", "spec2assert.db")


def get_db_path() -> str:
    return os.getenv("DB_PATH", DB_PATH)


@contextmanager
def conn():
    path = get_db_path()
    c = sqlite3.connect(path)
    c.row_factory = sqlite3.Row
    try:
        yield c
        c.commit()
    finally:
        c.close()


def init_db() -> None:
    with conn() as c:
        c.execute(
            """CREATE TABLE IF NOT EXISTS history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                created_at TEXT NOT NULL DEFAULT (datetime('now')),
                spec TEXT NOT NULL,
                rule_name TEXT NOT NULL,
                passed INTEGER NOT NULL,
                result_json TEXT NOT NULL
            )"""
        )


def save(spec: str, rule_name: str, passed: bool, result: dict) -> int:
    with conn() as c:
        cur = c.execute(
            "INSERT INTO history (spec, rule_name, passed, result_json) VALUES (?, ?, ?, ?)",
            (spec, rule_name, int(passed), json.dumps(result)),
        )
        return cur.lastrowid


def recent(limit: int = 10) -> list[dict]:
    with conn() as c:
        rows = c.execute(
            "SELECT id, created_at, spec, rule_name, passed FROM history ORDER BY id DESC LIMIT ?",
            (limit,),
        ).fetchall()
        return [dict(r) for r in rows]


def get(item_id: int) -> dict | None:
    with conn() as c:
        row = c.execute("SELECT result_json FROM history WHERE id = ?", (item_id,)).fetchone()
        return json.loads(row["result_json"]) if row else None
