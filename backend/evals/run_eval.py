import asyncio
import os
import sys
import time
from pathlib import Path

# Add backend directory to sys.path so app can be imported
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

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


async def run_benchmark():
    print(f"==================================================")
    print(f"Spec2Assert Prompt Eval Harness (Prompt {PROMPT_VERSION})")
    print(f"==================================================")
    passed = 0
    start_total = time.time()
    for idx, spec in enumerate(SPECS, 1):
        t0 = time.time()
        try:
            r = await generate_assertion(spec)
            checks = structural_checks(r)
            ok = all_passed(checks)
            failed = [k for k, v in checks.items() if not v]
        except Exception as e:
            ok, failed = False, [f"exception: {e}"]
        passed += 1 if ok else 0
        elapsed = time.time() - t0
        status = "PASS" if ok else "FAIL"
        fail_summary = f" -> FAILED CHECKS: {failed}" if failed else ""
        print(f"[{idx}/{len(SPECS)}] {status:4s} ({elapsed:4.2f}s) {spec[:55]}...{fail_summary}")

    total_time = time.time() - start_total
    print(f"--------------------------------------------------")
    print(f"Summary: prompt={PROMPT_VERSION}  pass_rate={passed}/{len(SPECS)} ({passed/len(SPECS)*100:.1f}%) in {total_time:.2f}s")
    print(f"==================================================")
    return passed, len(SPECS)


if __name__ == "__main__":
    asyncio.run(run_benchmark())
