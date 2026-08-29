import ast
import re

from .models import AssertionResult


def structural_checks(r: AssertionResult) -> dict[str, bool]:
    sva = r.formal_sva
    clock_name = re.sub(r"\W", "", r.clock)

    stub = r.python_test_stub.strip()
    if stub.startswith("```"):
        stub = re.sub(r"^```(?:python)?\s*", "", stub, flags=re.IGNORECASE)
        stub = re.sub(r"```\s*$", "", stub)

    try:
        ast.parse(stub)
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
