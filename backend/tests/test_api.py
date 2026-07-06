import os
from fastapi.testclient import TestClient

from app import db, main
from tests.test_validators import GOOD


def _patch(monkeypatch):
    async def fake(_spec: str):
        return GOOD

    monkeypatch.setattr(main, "generate_assertion", fake)


def test_health():
    with TestClient(main.app) as c:
        assert c.get("/health").json()["status"] == "ok"


def test_generate_returns_checks(monkeypatch, tmp_path):
    test_db = str(tmp_path / "test.db")
    monkeypatch.setenv("DB_PATH", test_db)
    monkeypatch.setattr(db, "DB_PATH", test_db)
    _patch(monkeypatch)
    with TestClient(main.app) as c:
        r = c.post("/api/generate", json={"spec": "valid must be followed by ready"})
        assert r.status_code == 200
        body = r.json()
        assert body["deterministic_check_passed"] is True
        assert "checks" in body
        assert body["id"] is not None

        # Verify history reflects the generated item
        hist = c.get("/api/history")
        assert hist.status_code == 200
        items = hist.json()
        assert len(items) >= 1
        assert items[0]["rule_name"] == "AXI_VALID_READY"

        # Verify get history item by id
        item_id = body["id"]
        detail = c.get(f"/api/history/{item_id}")
        assert detail.status_code == 200
        assert detail.json()["rule_name"] == "AXI_VALID_READY"


def test_rejects_short_spec():
    with TestClient(main.app) as c:
        assert c.post("/api/generate", json={"spec": "x"}).status_code == 422


def test_history_not_found(monkeypatch, tmp_path):
    test_db = str(tmp_path / "test_empty.db")
    monkeypatch.setenv("DB_PATH", test_db)
    monkeypatch.setattr(db, "DB_PATH", test_db)
    with TestClient(main.app) as c:
        assert c.get("/api/history/9999").status_code == 404
