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


def test_missing_reset_fails():
    bad = GOOD.model_copy(update={"formal_sva": "property p; @(posedge clk) valid |-> ready; endproperty\nassert property (p);"})
    assert not structural_checks(bad)["has_reset_disable"]
