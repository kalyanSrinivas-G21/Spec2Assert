import os
import time
from collections import defaultdict, deque
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

from . import db  # noqa: E402
from .llm import PROMPT_VERSION, generate_assertion  # noqa: E402
from .models import GenerateRequest, GenerateResponse  # noqa: E402
from .validators import all_passed, structural_checks  # noqa: E402


@asynccontextmanager
async def lifespan(_: FastAPI):
    db.init_db()
    yield


app = FastAPI(
    title="Spec2Assert API",
    version="1.0.0",
    description="Converts natural-language hardware protocol rules into SVA and cocotb tests.",
    lifespan=lifespan,
)

origins = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple in-memory rate limit: 10 requests per minute per IP (demo-grade, single instance)
_hits: dict[str, deque] = defaultdict(deque)


def rate_limit(request: Request, limit: int = 10, window: int = 60) -> None:
    ip = request.client.host if request.client else "unknown"
    now = time.time()
    q = _hits[ip]
    while q and now - q[0] > window:
        q.popleft()
    if len(q) >= limit:
        raise HTTPException(status_code=429, detail="Rate limit exceeded. Try again in a minute.")
    q.append(now)


@app.get("/health", tags=["meta"])
def health():
    return {"status": "ok", "prompt_version": PROMPT_VERSION}


@app.post("/api/generate", response_model=GenerateResponse, tags=["generate"])
async def generate(body: GenerateRequest, request: Request):
    rate_limit(request)
    try:
        result = await generate_assertion(body.spec)
    except RuntimeError as e:  # e.g. missing API key
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:  # upstream or validation failure after retries
        raise HTTPException(status_code=502, detail=f"Model call failed: {e}")

    checks = structural_checks(result)
    passed = all_passed(checks)
    payload = result.model_dump() | {"deterministic_check_passed": passed, "checks": checks}
    payload["id"] = db.save(body.spec, result.rule_name, passed, payload)
    return payload


@app.get("/api/history", tags=["history"])
def history(limit: int = 10):
    return db.recent(min(max(limit, 1), 50))


@app.get("/api/history/{item_id}", response_model=GenerateResponse, tags=["history"])
def history_item(item_id: int):
    item = db.get(item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Not found")
    return item
