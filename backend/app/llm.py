import os
import re
from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv

# Search for .env in backend/ directory or root directory
_backend_env = Path(__file__).resolve().parent.parent / ".env"
if _backend_env.exists():
    load_dotenv(dotenv_path=_backend_env)
load_dotenv()

from pydantic_ai import Agent
from pydantic_ai.providers.openai import OpenAIProvider

try:
    from pydantic_ai.models.openai import OpenAIChatModel as ChatModel
except ImportError:  # older versions
    from pydantic_ai.models.openai import OpenAIModel as ChatModel

from .models import AssertionResult

PROMPT_VERSION = "v3"

SYSTEM_PROMPT = """You are a senior hardware verification engineer.
Convert the user's natural-language protocol rule into a verification property.

Rules:
- Use synchronous SystemVerilog Assertions: define a clocked `property ... endproperty`,
  use `disable iff (<reset>)`, and finish with `assert property (...)`.
- Express delays with ##N or ##[M:N]. Use |-> (overlapped) or |=> (non-overlapped) deliberately.
- Every monitored signal must appear in the SVA.
- python_test_stub must be a self-contained cocotb test: `import cocotb`, an @cocotb.test() async
  function, a Clock, drive stimulus, and assert on the outcome. Return raw executable Python code only.
- Choose conventional names (clk, rst_n) when the rule does not specify them.
- If the rule is ambiguous, pick the most conventional interpretation and state it in `explanation`."""

FREE_FALLBACK_MODELS = [
    "cohere/north-mini-code:free",
    "nvidia/nemotron-3.5-lightning:free",
    "nvidia/nemotron-3-super-120b-a12b:free",
    "minimax/minimax-m3.1-flash:free",
    "google/gemma-4-31b-it:free",
]


def create_agent(model_name: str) -> Agent:
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        raise RuntimeError("OPENROUTER_API_KEY is not configured")
    model = ChatModel(
        model_name,
        provider=OpenAIProvider(base_url="https://openrouter.ai/api/v1", api_key=api_key),
    )
    try:
        return Agent(model, output_type=AssertionResult, system_prompt=SYSTEM_PROMPT, retries=2)
    except TypeError:  # older versions used result_type
        return Agent(model, result_type=AssertionResult, system_prompt=SYSTEM_PROMPT, retries=2)


@lru_cache(maxsize=8)
def get_agent(model_name: str | None = None) -> Agent:
    target = model_name or os.getenv("MODEL_NAME", "nvidia/nemotron-3.5-lightning:free")
    return create_agent(target)


def _clean_markdown_fences(code: str) -> str:
    cleaned = code.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:[a-zA-Z0-9_-]+)?\s*\n?", "", cleaned)
        cleaned = re.sub(r"\n?```\s*$", "", cleaned)
    return cleaned.strip()


async def generate_assertion(spec: str) -> AssertionResult:
    # If MOCK_LLM is enabled or mock mode requested
    if os.getenv("MOCK_LLM", "false").lower() in ("true", "1", "yes"):
        return _mock_assertion(spec)

    last_error = None
    primary = os.getenv("MODEL_NAME", "nvidia/nemotron-3.5-lightning:free")
    models_to_try = []
    for m in [primary] + FREE_FALLBACK_MODELS:
        if m not in models_to_try:
            models_to_try.append(m)

    for m in models_to_try:
        try:
            agent = get_agent(m)
            result = await agent.run(
                f'Protocol rule:\n"{spec}"',
                model_settings={"temperature": 0.0},
            )
            data = result.output if hasattr(result, "output") else result.data
            data.formal_sva = _clean_markdown_fences(data.formal_sva)
            data.python_test_stub = _clean_markdown_fences(data.python_test_stub)
            return data
        except Exception as e:
            last_error = e
            # Try next free model in case of upstream 429 / provider failure
            continue

    if last_error:
        raise last_error


def _mock_assertion(spec: str) -> AssertionResult:
    spec_lower = spec.lower()
    if "fifo" in spec_lower or "full" in spec_lower or "overflow" in spec_lower:
        return AssertionResult(
            rule_name="FIFO_OVERFLOW_ASSERT",
            clock="clk",
            reset="!rst_n",
            monitored_signals=["fifo_full", "write_en", "overflow_err"],
            trigger_condition="fifo_full && write_en",
            expected_outcome="overflow_err asserted on next cycle",
            max_latency_cycles=1,
            formal_sva=(
                "property p_fifo_overflow;\n"
                "  @(posedge clk) disable iff (!rst_n)\n"
                "  (fifo_full && write_en) |-> ##1 overflow_err;\n"
                "endproperty\n"
                "assert property (p_fifo_overflow);"
            ),
            python_test_stub=(
                "import cocotb\n"
                "from cocotb.triggers import RisingEdge\n\n"
                "@cocotb.test()\n"
                "async def test_fifo_overflow(dut):\n"
                "    dut.rst_n.value = 1\n"
                "    dut.fifo_full.value = 1\n"
                "    dut.write_en.value = 1\n"
                "    await RisingEdge(dut.clk)\n"
                "    assert dut.overflow_err.value == 1\n"
            ),
            explanation="Prevents silent data loss by verifying overflow_err flags invalid writes when FIFO is full.",
        )
    elif "apb" in spec_lower or "psel" in spec_lower or "pready" in spec_lower or "pslverr" in spec_lower:
        return AssertionResult(
            rule_name="APB_TIMEOUT_ASSERT",
            clock="pclk",
            reset="!presetn",
            monitored_signals=["psel", "penable", "pready", "pslverr"],
            trigger_condition="psel && penable && !pready for 16 cycles",
            expected_outcome="pslverr asserted",
            max_latency_cycles=16,
            formal_sva=(
                "property p_apb_timeout;\n"
                "  @(posedge pclk) disable iff (!presetn)\n"
                "  (psel && penable && !pready) [*16] |-> ##1 pslverr;\n"
                "endproperty\n"
                "assert property (p_apb_timeout);"
            ),
            python_test_stub=(
                "import cocotb\n"
                "from cocotb.triggers import RisingEdge\n\n"
                "@cocotb.test()\n"
                "async def test_apb_timeout(dut):\n"
                "    dut.presetn.value = 1\n"
                "    dut.psel.value = 1\n"
                "    dut.penable.value = 1\n"
                "    dut.pready.value = 0\n"
                "    for _ in range(16):\n"
                "        await RisingEdge(dut.pclk)\n"
                "    assert dut.pslverr.value == 1\n"
            ),
            explanation="Prevents bus stall when APB slave device becomes unresponsive for over 16 cycles.",
        )
    else:
        return AssertionResult(
            rule_name="AXI4_HANDSHAKE_ASSERT",
            clock="clk",
            reset="!rst_n",
            monitored_signals=["valid", "ready"],
            trigger_condition="valid high and ready low",
            expected_outcome="ready asserted within 3 cycles without valid dropping",
            max_latency_cycles=3,
            formal_sva=(
                "property p_axi_handshake;\n"
                "  @(posedge clk) disable iff (!rst_n)\n"
                "  valid && !ready |-> (valid [*1:3]) intersect (##[1:3] ready);\n"
                "endproperty\n"
                "assert property (p_axi_handshake);"
            ),
            python_test_stub=(
                "import cocotb\n"
                "from cocotb.triggers import RisingEdge\n\n"
                "@cocotb.test()\n"
                "async def test_handshake(dut):\n"
                "    dut.rst_n.value = 1\n"
                "    dut.valid.value = 1\n"
                "    dut.ready.value = 0\n"
                "    await RisingEdge(dut.clk)\n"
                "    dut.ready.value = 1\n"
                "    await RisingEdge(dut.clk)\n"
                "    assert dut.ready.value == 1\n"
            ),
            explanation="Prevents AXI protocol deadlock by enforcing ready response within 3 cycles.",
        )
