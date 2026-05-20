# Spec2Assert v2: Build Guide Aligned to the PurpleCodeAI Internship

**Target role:** Software Engineering Intern (Python APIs, AI/ML & Modern UI), PurpleCodeAI, remote, part-time, 3-6 months.
**Source:** https://wellfound.com/jobs/4824537-software-engineering-intern-python-apis-ai-ml-modern-ui

Spec2Assert turns natural-language hardware protocol specs (AXI, APB, FIFO rules) into SystemVerilog Assertions (SVA) plus a Python/cocotb test stub. PurpleCodeAI works on EDA tools and verification, so the domain matches the company, and the architecture below is chosen to match the listing line by line.

**Time to complete:** about 6-10 hours across a few sessions.
**Cost:** free tiers (Vercel, Render) plus a few cents of OpenRouter credit.

> **Honesty note.** Build this for real, commit as you go, and describe it accurately: "I built this to show how I'd approach the role." The commit history and `BUILD_LOG.md` are your evidence. Do not backdate commits or claim it was built earlier than it was.

---

## 1. Job Requirements Mapped to Project Features

| Listing requirement | Where Spec2Assert demonstrates it | Section |
|---|---|---|
| Develop, test and document RESTful APIs with FastAPI or Django | FastAPI backend, pytest suite, auto-generated OpenAPI docs at `/docs` | 5, 6, 7 |
| Integrate LLMs, prompt engineering, orchestration libraries (LangChain, Pydantic AI, DSPy) | Pydantic AI agent with typed structured output; versioned prompts in `PROMPTS.md`; small eval harness comparing prompt versions | 6, 10 |
| Use Vercel v0 and React/Next.js/Tailwind to generate and iterate on UI | Frontend generated and refined in v0, exported to a Next.js app; v0 prompts logged | 8 |
| Wire UI to backend: state, data fetching, interactions | Typed API client, loading/error state, history panel fed by the API | 9 |
| Collaborate and troubleshoot across the stack | `BUILD_LOG.md` records every problem, cause and fix | 0 |
| Python proficiency, OOP, data structures | Pydantic models, validator classes, typed Python | 5, 6 |
| HTTP, REST, JSON basics | Clear endpoint design, status codes, JSON schemas | 7 |
| Basic SQL | SQLite history table with real queries | 5 |
| Git and command line | Branching, conventional commits, scripted logging | 11 |
| GitHub portfolio of full-stack and AI work | Public repo with README, tests, docs, log | 12 |

---

## 0. Logging Protocol (Read First)

Every session, whether you or an AI assistant is doing the work, keeps an append-only `BUILD_LOG.md` at the repo root.

### 0.1 Rules

1. Log every step before moving to the next.
2. Log every problem the moment it appears, with the exact error text, **before** attempting a fix.
3. Log the outcome of every fix: WORKED, PARTLY WORKED, or FAILED. Failures matter as much as successes.
4. Never delete entries. If an entry was wrong, append a correction.
5. Timestamps are local time, `YYYY-MM-DD HH:MM`.
6. Never write API keys or secrets into the log.

### 0.2 Entry Tags

| Tag | Meaning |
|---|---|
| `[STEP]` | A planned action completed |
| `[CMD]` | A terminal command and its outcome |
| `[PROBLEM]` | Error, warning or unexpected behavior |
| `[FIX]` | Change made to resolve a problem |
| `[DECISION]` | A choice between alternatives, with the reason |
| `[VERIFY]` | A check that confirms something works |
| `[PROMPT]` | An LLM or v0 prompt used, and how the output compared with what was wanted |
| `[NOTE]` | Anything else worth remembering |

### 0.3 Entry Format

```markdown
### 2026-10-20 14:32 [PROBLEM] Pydantic AI import error
- **Where:** backend/app/llm.py
- **Symptom:** `ImportError: cannot import name 'OpenAIModel'`
- **Suspected cause:** installed pydantic-ai version renamed the class to OpenAIChatModel
- **Next action:** check installed version with `pip show pydantic-ai`, use the matching class name
```

```markdown
### 2026-10-20 14:40 [FIX] Added import fallback for the renamed class
- **Result:** WORKED
- **Linked problem:** 2026-10-20 14:32
```

### 0.4 Log File Header

```markdown
# Spec2Assert Build Log

Append-only. Every step and every problem goes here.

| Field | Value |
|---|---|
| Project | Spec2Assert |
| Started | YYYY-MM-DD HH:MM |
| Builder | <your name / AI assistant> |
| Python | <python --version> |
| Node | <node -v> |
| OS | <your OS> |

---
```

### 0.5 Helper Script: `scripts/log.sh`

```bash
#!/usr/bin/env bash
# Usage: ./scripts/log.sh STEP "Created FastAPI app skeleton"
TAG="${1:?tag required (STEP|CMD|PROBLEM|FIX|DECISION|VERIFY|PROMPT|NOTE)}"
MSG="${2:?message required}"
printf '\n### %s [%s] %s\n' "$(date '+%Y-%m-%d %H:%M')" "$TAG" "$MSG" >> BUILD_LOG.md
echo "logged: [$TAG] $MSG"
```

Run `chmod +x scripts/log.sh`.

### 0.6 Block to Paste into Your AI Coding Assistant (`.cursorrules` or `CLAUDE.md`)

```text
LOGGING PROTOCOL (MANDATORY):
- Maintain BUILD_LOG.md at the repo root for the entire session.
- After EVERY completed step, append an entry tagged [STEP], [CMD], [DECISION], [PROMPT] or [VERIFY].
- The moment ANY error, warning, failed command, failed test or unexpected output occurs,
  append a [PROBLEM] entry with the exact error text BEFORE attempting a fix.
- After each fix attempt, append a [FIX] entry marked WORKED, PARTLY WORKED or FAILED.
- Never delete or rewrite earlier entries; only append.
- Commit after each logged step with a conventional commit message. Commit timestamps must be real.
- Do not report the task complete until BUILD_LOG.md ends with a [VERIFY] entry confirming:
  all pytest tests pass, the frontend builds, and one end-to-end request succeeds.
```

---

## 2. Architecture

```
spec2assert/
├── BUILD_LOG.md
├── PROMPTS.md                 # versioned LLM prompts + eval results
├── README.md
├── scripts/log.sh
├── backend/                   # Python REST API (FastAPI + Pydantic AI + SQLite)
│   ├── app/
│   │   ├── main.py            # routes, CORS, rate limit
│   │   ├── models.py          # Pydantic schemas
│   │   ├── llm.py             # Pydantic AI agent via OpenRouter
│   │   ├── validators.py      # deterministic structural checks
│   │   └── db.py              # SQLite history
│   ├── tests/
│   ├── evals/run_eval.py      # prompt evaluation harness
│   ├── requirements.txt
│   └── .env                   # not committed
└── frontend/                  # Next.js + Tailwind, UI generated with v0
    └── ...
```

**Flow:** Browser (Next.js) -> `POST /api/generate` (FastAPI) -> Pydantic AI agent -> OpenRouter LLM -> typed `AssertionResult` -> server-side structural checks -> saved to SQLite -> JSON back to the UI.

**Deployment:** frontend on Vercel, backend on Render (free web service). SQLite on Render's free tier does not persist across redeploys, so history is demo-grade only. Log this as a `[DECISION]` and say so in the README.

---

## 3. Prerequisites

| Requirement | Check |
|---|---|
| Python 3.11+ | `python --version` |
| Node 18.18+ (20 LTS preferred) | `node -v` |
| Git | `git --version` |
| GitHub, Vercel, Render accounts | n/a |
| OpenRouter API key | https://openrouter.ai/settings/keys |
| v0 account | https://v0.dev |

Log: `[STEP] Prerequisites verified: python X, node Y, git Z`.

---

## 4. Repository Setup

```bash
mkdir spec2assert && cd spec2assert
git init
mkdir -p scripts backend/app backend/tests backend/evals
# create BUILD_LOG.md (header from 0.4) and scripts/log.sh (from 0.5)
chmod +x scripts/log.sh
printf '.env\n.venv/\n__pycache__/\n*.db\nnode_modules/\n.next/\n.env.local\n' > .gitignore
git add . && git commit -m "chore: init repo with build log and logging helper"
```

---

## 5. Backend Part 1: Models, Validators, Database

```bash
cd backend
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install fastapi "uvicorn[standard]" pydantic pydantic-ai python-dotenv pytest httpx
pip freeze > requirements.txt
```

Log each command. Expect `[PROBLEM]` entries here for venv activation or version conflicts.

### `backend/app/models.py`

```python
from pydantic import BaseModel, Field


class GenerateRequest(BaseModel):
    spec: str = Field(min_length=5, max_length=2000, description="Natural-language protocol rule")


class AssertionResult(BaseModel):
    """Schema the LLM must fill. Pydantic AI validates and retries against it."""

    rule_name: str = Field(pattern=r"^[A-Z][A-Z0-9_]*$", description="UPPER_SNAKE_CASE identifier")
    clock: str = Field(description="Clock signal name, e.g. clk or aclk")
    reset: str = Field(description="Reset condition, e.g. !rst_n")
    monitored_signals: list[str] = Field(min_length=1)
    trigger_condition: str
    expected_outcome: str
    max_latency_cycles: int = Field(ge=0, le=4096)
    formal_sva: str = Field(description="Complete SVA: property...endproperty plus assert property")
    python_test_stub: str = Field(description="Runnable cocotb test")
    explanation: str = Field(description="One sentence: which silicon bug this prevents")


class GenerateResponse(AssertionResult):
    id: int | None = None
    deterministic_check_passed: bool
    checks: dict[str, bool]
```

### `backend/app/validators.py`

These checks run on the server and do not trust the model. The Python stub is actually parsed with `ast`; the SVA checks are structural heuristics, not a simulator.

```python
import ast
import re

from .models import AssertionResult


def structural_checks(r: AssertionResult) -> dict[str, bool]:
    sva = r.formal_sva
    clock_name = re.sub(r"\W", "", r.clock)

    try:
        ast.parse(r.python_test_stub)
        stub_parses = True
    except SyntaxError:
        stub_parses = False

    n = r.max_latency_cycles
    return {
        "has_property_block": bool(re.search(r"\bproperty\b", sva) and re.search(r"\bendproperty\b", sva)),
        "has_assert_property": bool(re.search(r"\bassert\s+property\b", sva)),
        "uses_clock": bool(clock_name) and clock_name in sva,
        "has_reset_disable": "disable iff" in sva,
        "references_all_signals": all(s in sva for s in r.monitored_signals),
        "cycle_bound_present": n == 0 or str(n) in sva or "##1" in sva,
        "python_stub_parses": stub_parses,
        "cocotb_imported": bool(re.search(r"(import|from)\s+cocotb", r.python_test_stub)),
    }


def all_passed(checks: dict[str, bool]) -> bool:
    return all(checks.values())
```

### `backend/app/db.py`

```python
import json
import os
import sqlite3
from contextlib import contextmanager

DB_PATH = os.getenv("DB_PATH", "spec2assert.db")


@contextmanager
def conn():
    c = sqlite3.connect(DB_PATH)
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
```

Commit: `feat(backend): add pydantic models, structural validators and sqlite history`.

---

## 6. Backend Part 2: LLM Orchestration with Pydantic AI

This is the listing's "LLM integration, prompt engineering, orchestration libraries" item. Pydantic AI gives typed structured output with automatic validation retries, which replaces the regex fence-stripping from the first version of this guide.

Pydantic AI renames things between releases. The code below handles the two most common differences; if something still breaks, log it as a `[PROBLEM]`, check `pip show pydantic-ai` and the official docs for your installed version, then log the `[FIX]`.

### `backend/app/llm.py`

```python
import os
from functools import lru_cache

from pydantic_ai import Agent
from pydantic_ai.providers.openai import OpenAIProvider

try:
    from pydantic_ai.models.openai import OpenAIChatModel as ChatModel
except ImportError:  # older versions
    from pydantic_ai.models.openai import OpenAIModel as ChatModel

from .models import AssertionResult

PROMPT_VERSION = "v1"

SYSTEM_PROMPT = """You are a senior hardware verification engineer.
Convert the user's natural-language protocol rule into a verification property.

Rules:
- Use synchronous SystemVerilog Assertions: define a clocked `property ... endproperty`,
  use `disable iff (<reset>)`, and finish with `assert property (...)`.
- Express delays with ##N or ##[M:N]. Use |-> (overlapped) or |=> (non-overlapped) deliberately.
- Every monitored signal must appear in the SVA.
- python_test_stub must be a self-contained cocotb test: `import cocotb`, an @cocotb.test() async
  function, a Clock, drive stimulus, and assert on the outcome.
- Choose conventional names (clk, rst_n) when the rule does not specify them.
- If the rule is ambiguous, pick the most conventional interpretation and state it in `explanation`."""


@lru_cache(maxsize=1)
def get_agent() -> Agent:
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        raise RuntimeError("OPENROUTER_API_KEY is not configured")
    model = ChatModel(
        os.getenv("MODEL_NAME", "meta-llama/llama-3.3-70b-instruct"),
        provider=OpenAIProvider(base_url="https://openrouter.ai/api/v1", api_key=api_key),
    )
    try:
        return Agent(model, output_type=AssertionResult, system_prompt=SYSTEM_PROMPT, retries=2)
    except TypeError:  # older versions used result_type
        return Agent(model, result_type=AssertionResult, system_prompt=SYSTEM_PROMPT, retries=2)


async def generate_assertion(spec: str) -> AssertionResult:
    result = await get_agent().run(f'Protocol rule:\n"{spec}"')
    return result.output if hasattr(result, "output") else result.data
```

Prompt engineering workflow (log each as `[PROMPT]`):
1. Run the three presets with prompt v1 and note weaknesses (wrong implication operator, missing reset, unrunnable cocotb).
2. Create `PROMPTS.md` and record v1 text, the failures seen, then v2 with the fix, then results.
3. Bump `PROMPT_VERSION` each time so eval results are traceable.

Commit: `feat(backend): add pydantic-ai agent via openrouter with versioned prompt`.

---

## 7. Backend Part 3: REST API

### `backend/app/main.py`

```python
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

origins = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")]
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_methods=["*"], allow_headers=["*"])

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
```

Create `backend/.env`:

```env
OPENROUTER_API_KEY=your_key_here
ALLOWED_ORIGINS=http://localhost:3000
```

Create an empty `backend/app/__init__.py`. Run:

```bash
uvicorn app.main:app --reload --port 8000
```

Open http://localhost:8000/docs. FastAPI generates interactive API documentation automatically; this covers the listing's "document RESTful APIs".

Smoke test:

```bash
curl -s -X POST http://localhost:8000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"spec":"When AXI valid is asserted, ready must assert within 3 clock cycles without valid dropping."}'
```

Likely `[PROBLEM]` entries:

| Symptom | Likely cause | Fix to try |
|---|---|---|
| `ModuleNotFoundError: app` | running uvicorn from the wrong directory | run from `backend/` |
| `RuntimeError: OPENROUTER_API_KEY is not configured` | `.env` missing or not loaded | check path, restart server |
| `502 Model call failed` with 401 | bad or revoked key | regenerate key |
| 402 in the error text | no OpenRouter credits | add credits or use a `:free` model |
| Repeated validation retries then failure | model not following the schema | try a stronger model via `MODEL_NAME`, tighten the prompt |

Commit: `feat(backend): add fastapi endpoints, cors, rate limiting and history`.

---

## 8. Backend Part 4: Tests

Tests mock the LLM so they run offline, fast and free.

### `backend/tests/test_validators.py`

```python
from app.models import AssertionResult
from app.validators import all_passed, structural_checks

GOOD = AssertionResult(
    rule_name="AXI_VALID_READY",
    clock="clk",
    reset="!rst_n",
    monitored_signals=["valid", "ready"],
    trigger_condition="valid rises",
    expected_outcome="ready within 3 cycles",
    max_latency_cycles=3,
    formal_sva=(
        "property p; @(posedge clk) disable iff (!rst_n) "
        "valid && !ready |-> ##[1:3] ready; endproperty\n"
        "assert property (p);"
    ),
    python_test_stub="import cocotb\n\n@cocotb.test()\nasync def t(dut):\n    pass\n",
    explanation="Prevents handshake deadlock.",
)


def test_good_result_passes():
    assert all_passed(structural_checks(GOOD))


def test_missing_assert_fails():
    bad = GOOD.model_copy(update={"formal_sva": GOOD.formal_sva.replace("assert property (p);", "")})
    assert not structural_checks(bad)["has_assert_property"]


def test_unparseable_python_fails():
    bad = GOOD.model_copy(update={"python_test_stub": "def broken(:"})
    assert not structural_checks(bad)["python_stub_parses"]


def test_missing_signal_fails():
    bad = GOOD.model_copy(update={"monitored_signals": ["valid", "ready", "nonexistent_sig"]})
    assert not structural_checks(bad)["references_all_signals"]
```

### `backend/tests/test_api.py`

```python
import os

os.environ["DB_PATH"] = ":memory:"

from fastapi.testclient import TestClient

from app import main
from tests.test_validators import GOOD

client = TestClient(main.app)


def _patch(monkeypatch):
    async def fake(_spec: str):
        return GOOD

    monkeypatch.setattr(main, "generate_assertion", fake)


def test_health():
    with TestClient(main.app) as c:
        assert c.get("/health").json()["status"] == "ok"


def test_generate_returns_checks(monkeypatch):
    _patch(monkeypatch)
    with TestClient(main.app) as c:
        r = c.post("/api/generate", json={"spec": "valid must be followed by ready"})
        assert r.status_code == 200
        body = r.json()
        assert body["deterministic_check_passed"] is True
        assert "checks" in body


def test_rejects_short_spec():
    with TestClient(main.app) as c:
        assert c.post("/api/generate", json={"spec": "x"}).status_code == 422
```

Note: with `:memory:` SQLite, each new connection gets a fresh empty database, so history tests across calls will fail. If you hit this, log it as a `[PROBLEM]`; the fix is to use a temp file path via `tmp_path` and `monkeypatch.setenv`/`db.DB_PATH`. Logging this kind of snag is exactly what the log is for.

Run: `pytest -q`. Add an empty `backend/tests/__init__.py` if imports fail.

Commit: `test(backend): add validator and api tests with mocked llm`.

---

## 9. AI/ML Evaluation Harness (Prompt Engineering Evidence)

This is the part that separates "called an API" from "experimented with an AI workflow". It measures how often each prompt version produces output that passes the server-side checks.

### `backend/evals/run_eval.py`

```python
import asyncio
import time

from dotenv import load_dotenv

load_dotenv()

from app.llm import PROMPT_VERSION, generate_assertion  # noqa: E402
from app.validators import all_passed, structural_checks  # noqa: E402

SPECS = [
    "When AXI valid is asserted, ready must be asserted within 3 clock cycles without valid dropping.",
    "When fifo_full is high, any write_en pulse must trigger overflow_err on the next clock cycle.",
    "If psel and penable are high and pready is low for more than 16 cycles, pslverr must assert.",
    "After req is asserted, ack must be asserted within 5 cycles.",
    "grant must never be high for two requesters at the same time.",
    "After reset deassertion, valid must be low for the first cycle.",
    "If start is asserted, busy must go high on the next cycle and stay high until done.",
    "data must remain stable while valid is high and ready is low.",
]


async def main():
    passed = 0
    for spec in SPECS:
        t0 = time.time()
        try:
            r = await generate_assertion(spec)
            checks = structural_checks(r)
            ok = all_passed(checks)
            failed = [k for k, v in checks.items() if not v]
        except Exception as e:
            ok, failed = False, [f"exception: {e}"]
        passed += ok
        print(f"{'PASS' if ok else 'FAIL'}  {time.time() - t0:5.1f}s  {spec[:60]}  {failed or ''}")
    print(f"\nprompt={PROMPT_VERSION}  pass_rate={passed}/{len(SPECS)}")


asyncio.run(main())
```

Run from `backend/`: `python -m evals.run_eval`. Add an empty `backend/evals/__init__.py` first.

Workflow:
1. Run with prompt v1, paste the output into `PROMPTS.md`, log `[PROMPT]`.
2. Read the failures, improve the prompt, bump `PROMPT_VERSION`, run again, record both pass rates side by side.
3. Report only what you measured. Do not claim an accuracy figure you did not run.

Stretch goal: try the same eval with two different models via `MODEL_NAME`, and record cost and latency. If you have time, explore DSPy for automatic prompt optimization and describe honestly what you learned.

Commit: `feat(evals): add prompt evaluation harness and prompt history`.

---

## 10. Frontend: Generate the UI with v0, Then Wire It Up

The listing names v0 explicitly. Use it for real and log the prompts; that log is your evidence of the workflow.

### 10.1 Generate in v0

Open https://v0.dev and use a prompt like this (log it as `[PROMPT]`):

```text
Build a dark-themed, responsive developer tool called "Spec2Assert" using Next.js, Tailwind and shadcn/ui.
Two-column layout. Left: a textarea for a natural-language hardware protocol rule, three preset
buttons (AXI4 Handshake, FIFO Overflow, APB Timeout), and a "Compile Assertion" button with a
loading spinner and disabled state. Below it, a "Recent compilations" list.
Right: an empty state before running; after a result, show badges for clock, reset, max latency
cycles, a list of monitored signal chips, a checklist of pass/fail validation checks, and tabs for
"SystemVerilog (SVA)" and "Python / cocotb" code with a copy button. Use monospace for code.
Accept props and callbacks rather than fetching data inside the components.
```

Iterate in v0 two or three times (log each refinement and what you asked for). Then bring it into the project:

```bash
cd ..   # repo root
npx create-next-app@latest frontend --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"
cd frontend
# Use the "Add to codebase" command shown in v0, or copy the generated components in.
```

Log `[PROBLEM]` entries for missing shadcn components or dependency mismatches (v0 exports usually need `npx shadcn@latest init` and `npx shadcn@latest add <component>`), and the `[FIX]` for each.

### 10.2 Wire the UI to the FastAPI Backend

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

`frontend/lib/api.ts`:

```typescript
export interface AssertionResult {
  id: number | null;
  rule_name: string;
  clock: string;
  reset: string;
  monitored_signals: string[];
  trigger_condition: string;
  expected_outcome: string;
  max_latency_cycles: number;
  formal_sva: string;
  python_test_stub: string;
  explanation: string;
  deterministic_check_passed: boolean;
  checks: Record<string, boolean>;
}

export interface HistoryItem {
  id: number;
  created_at: string;
  spec: string;
  rule_name: string;
  passed: number;
}

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail ?? `Request failed (${res.status})`);
  }
  return res.json();
}

export const generate = (spec: string) =>
  request<AssertionResult>("/api/generate", { method: "POST", body: JSON.stringify({ spec }) });

export const getHistory = () => request<HistoryItem[]>("/api/history");
export const getHistoryItem = (id: number) => request<AssertionResult>(`/api/history/${id}`);
```

In `app/page.tsx` (a client component), hold this state and pass it down to the v0-generated components:

- `spec`, `loading`, `error`, `result`, `history`, `activeTab`
- `handleCompile`: set loading, call `generate`, set result, refresh `getHistory()`, catch errors into `error`
- `handleSelectHistory(id)`: call `getHistoryItem(id)` and show it
- On mount, load history with `useEffect`

Add a small footnote under the output: *"Generated assertions must be simulated or formally checked in your EDA tool before use."*

Verify: run backend on 8000 and frontend on 3000, compile all three presets, confirm the validation checklist and history list update. Log `[VERIFY]`.

Typical `[PROBLEM]` entries: CORS errors (fix `ALLOWED_ORIGINS`), `fetch failed` (backend not running), hydration warnings from generated code.

Commit: `feat(frontend): add v0-generated UI wired to fastapi backend`.

---

## 11. Git Workflow (Real History)

Use short feature branches and conventional commits, committing after each logged step. A realistic history for this project looks like:

```
chore: init repo with build log and logging helper
feat(backend): add pydantic models, structural validators and sqlite history
feat(backend): add pydantic-ai agent via openrouter with versioned prompt
feat(backend): add fastapi endpoints, cors, rate limiting and history
test(backend): add validator and api tests with mocked llm
feat(evals): add prompt evaluation harness and prompt history
feat(frontend): add v0-generated UI wired to fastapi backend
fix(frontend): handle cors and error states
docs: add readme, architecture notes and deployment steps
chore(deploy): add render and vercel configuration
```

Rules: small commits, one logical change each, messages that match the log entries, and no commits made to look like they happened earlier than they did.

Push to a new public GitHub repo once the first end-to-end flow works, then keep pushing as you improve it.

---

## 12. Deployment

### Backend on Render

1. Push the repo to GitHub.
2. Render dashboard -> New -> Web Service -> select the repo.
3. Settings:
   - Root directory: `backend`
   - Build command: `pip install -r requirements.txt`
   - Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Environment variables: `OPENROUTER_API_KEY`, `ALLOWED_ORIGINS` (set after the frontend URL exists), optionally `PYTHON_VERSION` and `MODEL_NAME`.
5. Open `https://<service>.onrender.com/docs` and `/health`.

Free Render services sleep when idle, so the first request after a pause can take about a minute. Mention this in the README and add a loading hint in the UI.

### Frontend on Vercel

1. Vercel -> Add New Project -> import the repo, set **Root Directory** to `frontend`.
2. Environment variable: `NEXT_PUBLIC_API_URL=https://<service>.onrender.com`.
3. Deploy.
4. Go back to Render and set `ALLOWED_ORIGINS` to the Vercel URL, then redeploy the backend.

`NEXT_PUBLIC_*` variables are baked in at build time, so changing one requires a Vercel redeploy.

| Symptom | Likely cause | Fix |
|---|---|---|
| Browser CORS error in production | `ALLOWED_ORIGINS` missing the Vercel URL | set it, redeploy backend |
| UI calls localhost in production | `NEXT_PUBLIC_API_URL` not set before build | set it, redeploy frontend |
| Render deploy fails on dependencies | Python version mismatch | set `PYTHON_VERSION`, check `requirements.txt` |
| Render "no open ports detected" | not binding to `$PORT` | fix the start command |

Log every deploy step and problem. Set a spend limit on your OpenRouter key before sharing the public link.

---

## 13. README and Final Verification

The README should include: what it does, architecture diagram (the tree and flow above), run instructions for both apps, link to `/docs`, prompt-version results from `PROMPTS.md`, and a Limitations section (below). Final checklist, each logged as `[VERIFY]`:

- [ ] `pytest -q` passes
- [ ] `python -m evals.run_eval` runs and results are recorded in `PROMPTS.md`
- [ ] `npm run lint` and `npm run build` pass in `frontend/`
- [ ] All three presets work on the deployed site
- [ ] `/docs` loads on the deployed backend
- [ ] `BUILD_LOG.md` is committed and ends with a final `[VERIFY]` entry

---

## 14. Application Message

Replace the bracketed parts with real details after you have finished the project and measured the results.

```text
Hi Vaibhav,

I'm applying for the Software Engineering Intern (Python APIs, AI/ML & Modern UI) role.
PurpleCodeAI's focus on deterministic verification made me want to build something in that
space, so I built Spec2Assert: it turns natural-language hardware protocol rules into
SystemVerilog Assertions and cocotb test stubs.

It covers the stack in your listing:
- Python backend: FastAPI REST API with auto-generated OpenAPI docs and a pytest suite
- LLM workflow: Pydantic AI with typed structured output, versioned prompts, and a small
  eval harness (pass rate [X/8] on prompt v[N], up from [Y/8] on v1)
- UI: generated and iterated in v0, built on Next.js and Tailwind, wired to the API
- Data: SQLite history of compilations
- Process: BUILD_LOG.md in the repo records every step and problem I hit

Live demo: [Vercel URL]
Code: [GitHub URL]

I built this recently to show how I'd approach the role, and I'd be glad to walk through
the design choices and what I'd improve next.
```

---

## 15. Known Limitations (State These Plainly)

| Limitation | Why it matters | Next step |
|---|---|---|
| "Deterministic" here means schema-validated output plus server-side structural checks, not formal proof | Verification engineers will notice an overstated claim | Run generated SVA through Verilator or another tool to check syntax, then simulate with cocotb |
| SVA checks are regex heuristics | They catch missing structure, not wrong logic | Parse SVA into an AST and compare against extracted timing constraints |
| In-memory rate limiter | Resets on restart, not shared across instances | Use Redis or a hosted rate limiter |
| SQLite on Render free tier is ephemeral | History disappears on redeploy | Use a hosted Postgres |
| Eval set is 8 hand-written specs | Small sample, results are indicative only | Grow the set and add reference assertions |

---

## Appendix: Sample Log Excerpt

```markdown
### 2026-10-20 15:02 [CMD] pip install fastapi "uvicorn[standard]" pydantic pydantic-ai ...
- Result: OK

### 2026-10-20 15:20 [PROBLEM] ImportError: cannot import name 'OpenAIModel'
- Where: backend/app/llm.py
- Suspected cause: installed pydantic-ai renamed the class

### 2026-10-20 15:24 [FIX] Added try/except import for OpenAIChatModel
- Result: WORKED
- Linked problem: 2026-10-20 15:20

### 2026-10-20 16:10 [PROMPT] v1 system prompt, 8 eval specs
- Result: 5/8 pass. Failures: missing disable iff (2), stub did not parse (1)

### 2026-10-20 16:45 [PROMPT] v2 adds explicit disable iff and stub rules
- Result: 7/8 pass

### 2026-10-20 17:30 [VERIFY] pytest: 7 passed; frontend build OK; end-to-end preset test OK
```
