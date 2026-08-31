# Spec2Assert

<div align="center">

![Spec2Assert Banner](https://img.shields.io/badge/Spec2Assert-Deterministic_EDA_Engine-0066FF?style=for-the-badge&logo=cpu&logoColor=white)

**A deterministic agentic workbench converting natural-language hardware protocol specifications into formal SystemVerilog Assertions (SVA) and executable cocotb testbenches.**

[![Python](https://img.shields.io/badge/Python-3.11%20%7C%203.12%20%7C%203.14-3776AB?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Pydantic AI](https://img.shields.io/badge/Pydantic_AI-Structured_Agents-E92063?style=flat-square)](https://ai.pydantic.dev/)
[![Next.js](https://img.shields.io/badge/Next.js-16.4_Turbopack-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

[Architecture](#architecture) • [Key Features](#key-features) • [Quickstart](#quickstart) • [Evaluation Benchmark](#evaluations--prompt-benchmarking) • [API Reference](#api-reference)

</div>

---

## Overview

In digital ASIC and FPGA design, verification consumes up to 70% of engineering cycles. While Large Language Models (LLMs) excel at natural-language comprehension, standard off-the-shelf LLMs are fundamentally stochastic—generating conversational preambles, subtle clock boundary errors (`##[M:N]`), and unvalidated code that causes hardware synthesis failures.

**Spec2Assert** is an open-source experimental project built to research and test **deterministic agentic workflows** within Electronic Design Automation (EDA). By combining typed **Pydantic AI schema constraints**, **Python AST validation (`ast.parse`)**, and **regex-based formal SVA structural guards**, Spec2Assert guarantees zero unstructured text, verified syntax, and mathematically bounded assertions.

```
[ Natural Language Spec ]
         │
         ▼
[ Pydantic AI Structured Agent ] (Temperature: 0.0, OpenRouter Fallback Cascade)
         │
         ├──────────────────────────────────────────┐
         ▼                                          ▼
[ Formal SVA Syntax Checker ]              [ Python AST Linter (ast.parse) ]
 - Clock Domain Binding (@posedge clk)      - Validates Python syntax tree
 - Reset Guard (disable iff)                - Verifies cocotb test harness
 - Cycle Latency Bounding (##[1:N])         - Ensures executable stimulus
         │                                          │
         └────────────────────┬─────────────────────┘
                              ▼
        [ Verified Formal Assertion & Cocotb Testbench ]
```

---

## Key Features

- **Strict Structured Outputs via Pydantic AI:** Direct extraction of schema-validated fields (`rule_name`, `clock`, `reset`, `monitored_signals`, `trigger_condition`, `expected_outcome`, `max_latency_cycles`, `formal_sva`, `python_test_stub`) with zero markdown code-fence bleeding.
- **Dual-Layer Deterministic Validation:**
  - **Python AST Parsing:** Executes `ast.parse()` on generated cocotb harnesses to ensure syntactically flawless Python testbenches before presentation.
  - **Structural Formal SVA Linting:** Regex and heuristic checks guarantee clock domains (`@(posedge clk)`), reset guards (`disable iff (!rst_n)`), antecedent/consequent implications (`|->`, `|=>`), and temporal bounds (`##N`).
- **Multi-Model Failover Cascades:** Built on OpenRouter with automatic zero-downtime failovers spanning high-performance reasoning models and free open-weights tiers (`meta-llama/llama-3.3-70b-instruct`, `cohere/north-mini-code`, `nvidia/nemotron-3.5-lightning`, `google/gemma-4-31b-it`).
- **High-Density EDA Workbench UI:**
  - **Signal-to-Assertion Canvas Hero:** Fluid analog-to-digital signal synthesis animation displaying continuous wave morphing (sine waves sharpening into digital square waves with clock capture events).
  - **AI-Native Thinking Polygon:** Real-time 3D polyhedral tensor projection displaying depth-sorted Electric Blue facets during synthesis.
  - **Split-Pane IDE:** Real-time syntax coloring, line numbers, one-click clipboard copy, and protocol presets (AXI4-Stream, FIFO Overflow, APB3 Timeout).
  - **Offline Demo Mode:** Full interactive evaluation mode with pre-compiled fixtures for instant offline testing without requiring an API key.
- **Automated Prompt Evaluation Benchmark:** An 8-spec regression harness evaluating assertion pass rates, signal completeness, and AST validity across prompt versions.

---

## Architecture

```
Spec2Assert/
├── backend/                       # FastAPI REST API & Agent Engine
│   ├── app/
│   │   ├── main.py                # FastAPI routes, CORS, rate limiting, and endpoints
│   │   ├── llm.py                 # Pydantic AI agent, multi-model cascades, and prompts
│   │   ├── models.py              # Pydantic data contracts and schemas
│   │   ├── validators.py          # Python AST parser & SVA structural linters
│   │   └── db.py                  # SQLite compilation history store
│   ├── tests/                     # Unit and integration test suite
│   │   ├── test_api.py            # API endpoint and rate limit tests
│   │   └── test_validators.py     # Deterministic validator unit tests
│   ├── evals/
│   │   └── run_eval.py            # Automated prompt benchmark harness
│   └── requirements.txt           # Python backend dependencies
│
├── frontend/                      # Next.js 16 (App Router + Turbopack)
│   ├── app/
│   │   ├── page.tsx               # Tech-aesthetic landing page & interactive showcase
│   │   ├── layout.tsx             # Root typography and metadata configuration
│   │   ├── globals.css            # Dark theme foundation & custom scrollbars
│   │   └── workbench/
│   │       └── page.tsx           # Full-featured EDA verification workbench
│   ├── components/
│   │   ├── HeroAnimation.tsx      # Analog-to-digital signal morphing canvas
│   │   ├── HeroWorkbenchMockup.tsx# Interactive hero IDE preview
│   │   ├── ThinkingPolygon.tsx    # GPU-accelerated 3D polyhedral AI thinking animation
│   │   ├── CompilationProgress.tsx# Multi-stage synthesis stepper
│   │   ├── CodeTabs.tsx           # Line-numbered SVA and cocotb viewer
│   │   ├── ApiKeyModal.tsx        # Client-side OpenRouter token management
│   │   └── Navbar.tsx             # High-density navigation bar
│   ├── lib/
│   │   └── api.ts                 # Typed API client with offline fixture fallbacks
│   └── package.json               # Frontend dependencies & scripts
│
├── PROMPTS.md                     # Versioned prompt engineering & evaluation log
├── render.yaml                    # Production backend deployment configuration
├── vercel.json                    # Production frontend deployment configuration
└── README.md                      # Project documentation
```

---

## Quickstart

### Prerequisites

- **Python:** 3.11 or higher
- **Node.js:** 18.18+ (Node 20+ recommended)
- **OpenRouter API Key:** (Optional: an offline demo mode is built-in)

---

### 1. Backend Setup

```bash
# Clone the repository
git clone https://github.com/kalyanSrinivas-G21/Spec2Assert.git
cd Spec2Assert/backend

# Create and activate a virtual environment
python -m venv .venv

# On Linux/macOS:
source .venv/bin/activate
# On Windows (PowerShell):
.venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
```

Edit `backend/.env` with your settings:
```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
MODEL_NAME=meta-llama/llama-3.3-70b-instruct
ALLOWED_ORIGINS=http://localhost:3000
DB_PATH=spec2assert.db
MOCK_LLM=false
```

Launch the FastAPI development server:
```bash
uvicorn app.main:app --reload --port 8000
```

- API Base: `http://localhost:8000`
- Interactive Swagger UI: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/health`

---

### 2. Frontend Setup

In a separate terminal:
```bash
cd Spec2Assert/frontend

# Install dependencies
npm install

# Start Next.js development server
npm run dev
```

Open `http://localhost:3000` in your browser. You can enter an OpenRouter key in the UI or select **"Use Offline Demo Fixtures"** to immediately test verified protocol benchmarks.

---

## Running Tests

The test suite validates AST parsing, SVA structural rules, database logging, and API endpoints using mocked LLM agents for deterministic, zero-cost continuous integration.

```bash
cd backend
pytest -v
```

Expected output:
```text
tests/test_api.py::test_health PASSED
tests/test_api.py::test_generate_returns_checks PASSED
tests/test_api.py::test_rejects_short_spec PASSED
tests/test_api.py::test_history_not_found PASSED
tests/test_validators.py::test_all_good PASSED
tests/test_validators.py::test_missing_clock PASSED
tests/test_validators.py::test_syntax_error_in_python_stub PASSED
tests/test_validators.py::test_missing_signal PASSED
tests/test_validators.py::test_missing_cycle_bound PASSED

============================== 9 passed in 2.85s ==============================
```

---

## Evaluations & Prompt Benchmarking

Spec2Assert includes an automated benchmark harness (`backend/evals/run_eval.py`) that tests candidate prompts and models against 8 standardized hardware interface specifications:

1. **AXI4-Stream Handshake:** `TVALID` asserted high requires `TREADY` within 3 clock cycles without `TVALID` dropping.
2. **FIFO Overflow:** `fifo_full` high causes `write_en` to trigger `overflow_err` on next cycle.
3. **APB3 Transfer Timeout:** `psel && penable` with stalled `pready` triggers `pslverr` within 16 cycles.
4. **Req/Ack Latency:** Request pulse requires an acknowledge within 5 cycles.
5. **Mutual Exclusion:** Two bus masters cannot hold `grant` simultaneously.
6. **Reset Invariant:** Outputs remain low for the initial cycle following reset deassertion.
7. **FSM Busy State:** `start` pulse forces `busy` high until `done` asserts.
8. **Data Stability:** `data` must remain stable during wait states while `valid` is asserted and `ready` is low.

Run the evaluation suite:
```bash
cd backend
python -m evals.run_eval
```

### Benchmark History

| Version | Focus | Pass Rate | Key Finding |
|---|---|:---:|---|
| **v1** | Baseline Zero-Shot Prompt | 4 / 8 (50.0%) | Frequent omissions of `disable iff` reset guards and missing `import cocotb` statements. |
| **v2** | Schema & AST Validation | 7 / 8 (87.5%) | Added strict `@cocotb.test()` structure and clocked property bounds; resolved all reset omissions. |
| **v3** | Latency Bounds & Signal Coverage | **8 / 8 (100.0%)** | Clean AST parsing, temporal `##[M:N]` constraints, and 100% signal completeness. |

See [`PROMPTS.md`](PROMPTS.md) for full benchmark logs and prompt diffs.

---

## API Reference

### `POST /api/generate`
Compiles a natural-language specification into formal assertions and cocotb testbenches.

**Request Body:**
```json
{
  "spec": "When TVALID is asserted high, TREADY must be asserted within 3 clock cycles. TVALID must remain high until handshake occurs."
}
```

**Response Payload:**
```json
{
  "id": 1,
  "rule_name": "AXI4_HANDSHAKE_TIMEOUT",
  "clock": "posedge(aclk)",
  "reset": "!aresetn",
  "monitored_signals": ["aclk", "aresetn", "tvalid", "tready"],
  "trigger_condition": "tvalid && !tready",
  "expected_outcome": "##[1:3] tready",
  "max_latency_cycles": 3,
  "formal_sva": "property p_axi4_handshake_timeout;\n  @(posedge aclk) disable iff (!aresetn)\n  (tvalid && !tready) |-> ##[1:3] tready;\nendproperty\n\na_axi4_handshake_timeout: assert property(p_axi4_handshake_timeout)\n  else $error(\"[S2A_VIOLATION]: AXI4 tready latency exceeded 3 cycles.\");",
  "python_test_stub": "import cocotb\nfrom cocotb.clock import Clock\nfrom cocotb.triggers import RisingEdge\n\n@cocotb.test()\nasync def test_axi4_handshake_timeout(dut):\n    clock = Clock(dut.aclk, 10, units=\"ns\")\n    cocotb.start_soon(clock.start())\n    dut.aresetn.value = 1\n    dut.tvalid.value = 1\n    dut.tready.value = 0\n    for _ in range(4):\n        await RisingEdge(dut.aclk)\n        if dut.tready.value == 1:\n            return\n    assert False, \"Latency violation\"",
  "explanation": "Ensures tready asserts within 3 clock cycles of an unacknowledged tvalid request.",
  "deterministic_check_passed": true,
  "checks": {
    "has_property_block": true,
    "has_assert_property": true,
    "uses_clock": true,
    "has_reset_disable": true,
    "references_all_signals": true,
    "cycle_bound_present": true,
    "python_stub_parses": true,
    "cocotb_imported": true
  }
}
```

### `GET /api/history`
Retrieves recent compilation sessions from local SQLite store.

### `GET /api/history/{id}`
Retrieves a specific historical compilation record by ID.

### `GET /health`
Returns service status and active prompt iteration version.

---

## Contributing

Contributions, feedback, and experiment ideas are welcome! To contribute:
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/new-validator`).
3. Commit your changes (`git commit -m "feat: add Verilator syntax linting"`).
4. Push to the branch (`git push origin feature/new-validator`).
5. Open a Pull Request.

---

## License

This project is licensed under the [MIT License](LICENSE).
