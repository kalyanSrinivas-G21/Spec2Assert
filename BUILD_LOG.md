# Spec2Assert Build Log

Append-only. Every step and every problem goes here.

| Field | Value |
|---|---|
| Project | Spec2Assert |
| Started | 2026-05-20 14:15 |
| Builder | Kalyansrinivas-G21 (PurpleCodeAI Internship Build) |
| Python | Python 3.14.2 / 3.11+ |
| Node | v25.6.1 / Node 20+ LTS |
| OS | Windows 11 (win32 x64) |

---

### 2026-05-20 14:15 [STEP] Prerequisites verified: python 3.14.2, node 25.6.1, git 2.52.0

### 2026-05-20 14:20 [DECISION] Repository Structure and Tech Stack Selection
- Selected FastAPI for backend REST API due to native Pydantic schema validation, async speed, and auto-generated OpenAPI documentation.
- Selected Pydantic AI for LLM orchestration to obtain typed, validated structured outputs with automated retries.
- Selected Next.js 15 (App Router) + Tailwind CSS for developer UI aligned with modern EDA tooling aesthetics.
- Selected SQLite with connection context manager for local compilation history.

### 2026-05-20 14:32 [STEP] Initialized project repository and created directory skeleton
- Created directories: `scripts/`, `backend/app/`, `backend/tests/`, `backend/evals/`, `frontend/`.
- Created root `.gitignore` to prevent tracking `.env`, virtualenvs, `.next`, and databases.

### 2026-05-21 10:10 [CMD] Created logging helper script `scripts/log.sh` and `scripts/log.ps1`
- Outcome: WORKED

### 2026-05-23 15:45 [STEP] Defined core Pydantic data schemas in `backend/app/models.py`
- Created `GenerateRequest`, `AssertionResult`, and `GenerateResponse`.
- Added regex validation for `rule_name` (`^[A-Z][A-Z0-9_]*$`).

### 2026-05-27 11:20 [PROBLEM] Validation error with latency range
- Where: `backend/app/models.py`
- Symptom: Negative cycle values or excessively large bounds causing synthesis timeouts.
- Suspected cause: Unbounded integer field in Pydantic schema.
- Next action: Add `ge=0, le=4096` field constraints.

### 2026-05-27 11:35 [FIX] Added range boundaries to `max_latency_cycles`
- Result: WORKED
- Linked problem: 2026-05-27 11:20

### 2026-06-02 16:15 [STEP] Implemented server-side deterministic structural checks in `backend/app/validators.py`
- Added AST syntax parsing for Python cocotb test stubs (`ast.parse`).
- Added regex checks for SVA property blocks, assert property directives, clock usage, reset disable, and cycle bounds.

### 2026-06-04 09:30 [PROBLEM] cocotb test stub parse false positives
- Where: `backend/app/validators.py`
- Symptom: Valid multi-line cocotb async stubs with tabs failing AST parse.
- Suspected cause: Indentation inconsistency in generated string.
- Next action: Ensure AST parser receives normalized string.

### 2026-06-04 10:05 [FIX] Standardized stub AST check and added check for cocotb import presence
- Result: WORKED
- Linked problem: 2026-06-04 09:30

### 2026-06-08 14:10 [STEP] Implemented SQLite persistence layer in `backend/app/db.py`
- Created `conn()` context manager with automatic commit/close.
- Created `init_db()`, `save()`, `recent()`, and `get()` functions.

### 2026-06-11 11:40 [PROBLEM] SQLite database locked error under concurrent requests
- Where: `backend/app/db.py`
- Symptom: `sqlite3.OperationalError: database is locked` during rapid successive queries.
- Suspected cause: Connection remaining open across request lifecycle without proper timeout.
- Next action: Wrap connections strictly inside context manager with row factory.

### 2026-06-11 12:05 [FIX] Refactored `conn()` context manager to isolate each transaction
- Result: WORKED
- Linked problem: 2026-06-11 11:40

### 2026-06-15 15:20 [STEP] Integrated Pydantic AI agent in `backend/app/llm.py`
- Configured OpenRouter OpenAIProvider targeting `meta-llama/llama-3.3-70b-instruct`.
- Set up schema-guided inference with automatic retries.

### 2026-06-17 14:32 [PROBLEM] Pydantic AI import error
- Where: `backend/app/llm.py`
- Symptom: `ImportError: cannot import name 'OpenAIModel' from 'pydantic_ai.models.openai'`
- Suspected cause: Installed pydantic-ai 2.58 renamed class to `OpenAIChatModel`.
- Next action: Check installed package version and add try/except fallback.

### 2026-06-17 14:40 [FIX] Added import fallback for OpenAIChatModel vs OpenAIModel
- Result: WORKED
- Linked problem: 2026-06-17 14:32

### 2026-06-20 16:10 [PROMPT] Evaluated prompt v1 across 8 protocol test cases
- Result: 4 / 8 pass rate. Failures: missing `disable iff` reset condition (2), stub syntax parse (1), missing latency cycle bound (1).

### 2026-06-22 10:45 [STEP] Prompt v2 Refinement
- Added explicit instruction enforcing clocked `property ... endproperty` blocks and `disable iff (<reset>)`.
- Specified deliberate selection of `|->` (overlapped) vs `|=>` (non-overlapped) implication operators.

### 2026-06-22 11:30 [PROMPT] Evaluated prompt v2 across benchmark suite
- Result: 7 / 8 pass rate. One failure due to signal omission.

### 2026-06-25 14:00 [STEP] Implemented FastAPI application routes in `backend/app/main.py`
- Added lifespan context to initialize SQLite table on startup.
- Configured CORS middleware for local Next.js frontend (`http://localhost:3000`).
- Implemented `/health`, `POST /api/generate`, `GET /api/history`, and `GET /api/history/{id}`.

### 2026-06-28 17:15 [STEP] Added in-memory rate limiting to `backend/app/main.py`
- Enforced sliding-window limit of 10 requests per minute per IP address.

### 2026-06-29 11:20 [PROBLEM] KeyError in rate limiter on test client requests
- Where: `backend/app/main.py`
- Symptom: `request.client` evaluated to `None` in certain test scenarios.
- Suspected cause: Missing IP address when using test client without host mock.
- Next action: Added fallback to `"unknown"` when `request.client` is None.

### 2026-06-29 11:35 [FIX] Added fallback client IP handling in rate_limit function
- Result: WORKED
- Linked problem: 2026-06-29 11:20

### 2026-07-03 14:00 [STEP] Added test suite in `backend/tests/test_validators.py`
- Tested good assertions, missing assert statements, unparseable python stubs, missing signals, and missing reset clauses.

### 2026-07-06 16:30 [STEP] Added API integration tests in `backend/tests/test_api.py`
- Created mock LLM fixture to run test suite offline, fast, and free.

### 2026-07-08 10:15 [PROBLEM] In-memory SQLite isolation issue across test calls
- Where: `backend/tests/test_api.py`
- Symptom: `SELECT result_json FROM history WHERE id = ?` returned None in subsequent test queries.
- Suspected cause: `:memory:` SQLite creates a fresh blank in-memory database on every new connection closure.
- Next action: Use pytest `tmp_path` fixture to point `DB_PATH` to a temporary sqlite file per test session.

### 2026-07-08 10:45 [FIX] Configured `tmp_path` SQLite database in `test_api.py`
- Result: WORKED
- Linked problem: 2026-07-08 10:15

### 2026-07-12 15:00 [CMD] Ran pytest suite (`pytest backend/tests -q`)
- Result: 9 passed in 2.27s

### 2026-07-16 11:00 [STEP] Built automated prompt evaluation harness in `backend/evals/run_eval.py`
- Implemented 8 standard bus protocol test specifications with latency and pass/fail reporting.

### 2026-07-20 14:20 [PROMPT] Prompt v3 Iteration and Verification
- Enforced self-contained cocotb harness with `import cocotb` and explicit async test decorator.
- Pass rate achieved: 8 / 8 (100.0%). Recorded comparative benchmark table in `PROMPTS.md`.

### 2026-07-25 10:00 [STEP] Scaffolding Next.js 15 frontend with TypeScript & Tailwind CSS
- Generated application shell in `frontend/`.
- Configured dark-themed color palette and Geist fonts.

### 2026-07-29 16:15 [STEP] Created typed REST API client in `frontend/lib/api.ts`
- Added TypeScript interfaces for `AssertionResult` and `HistoryItem`.
- Implemented `generate()`, `getHistory()`, and `getHistoryItem()`.

### 2026-08-02 11:30 [STEP] Built UI Component Hierarchy
- `Navbar.tsx`: Header branding, verification badge, and OpenAPI docs link.
- `MetadataBadges.tsx`: Clock domain, reset guard, max latency cycles, and monitored signals chip list.
- `ValidationChecklist.tsx`: Live pass/fail checklist of deterministic checks.
- `CodeTabs.tsx`: Tabbed editor view for SystemVerilog (SVA) and Python cocotb test stubs with copy to clipboard.
- `HistoryList.tsx`: Sidebar list of previous compilations stored in SQLite.

### 2026-08-06 15:40 [PROBLEM] Hydration mismatch on history timestamp rendering
- Where: `frontend/components/HistoryList.tsx`
- Symptom: Warning: Text content did not match. Server: "" Client: "14:32".
- Suspected cause: Date rendering formatting difference between SSR and client clock.
- Next action: Use raw ISO or split string format from backend payload without locale-dependent date formatting.

### 2026-08-06 16:05 [FIX] Sanitized timestamp rendering to avoid hydration divergence
- Result: WORKED
- Linked problem: 2026-08-06 15:40

### 2026-08-11 14:00 [STEP] Built interactive workbench in `frontend/app/page.tsx`
- Two-column responsive developer layout.
- Added preset buttons for AXI4 Handshake, FIFO Overflow, and APB Timeout.
- Connected compile button with loading spinner and disabled state.
- Added EDA formal verification disclaimer footnote.

### 2026-08-15 11:20 [STEP] Created deployment manifests
- `render.yaml` for Render backend web service with uvicorn start command.
- `vercel.json` for Vercel frontend deployment.

### 2026-08-20 16:30 [DECISION] Render Free Tier SQLite Ephemerality Notice
- Logged decision in README and UI: Render free web services sleep when idle and do not persist local SQLite files across redeploys. Added cold-start tooltip and recommendations for hosted Postgres in production.

### 2026-08-25 14:00 [STEP] Documentation and Artifact Finalization
- Completed comprehensive `README.md` with architecture diagram, quickstart, API documentation, and known limitations.
- Logged all 3 prompt versions and benchmark eval results in `PROMPTS.md`.

### 2026-08-28 17:30 [VERIFY] Final End-to-End Verification Pass
- Backend tests: 9 of 9 passed (`pytest backend/tests -q`).
- Eval harness: 8 of 8 benchmark specs passed (`python -m evals.run_eval`).
- Frontend production build: compiled cleanly with 0 errors (`npm run build`).
- End-to-end flow: Preset compilation, deterministic checks checklist, code copy, and history retrieval verified.
