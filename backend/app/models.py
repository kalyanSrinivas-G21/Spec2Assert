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
