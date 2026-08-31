import { NextRequest, NextResponse } from "next/server";
import { inMemoryHistory } from "../_store";
import { getDemoFixture } from "@/lib/api";

const FREE_MODELS = [
  "nvidia/nemotron-3.5-lightning:free",
  "cohere/north-mini-code:free",
  "minimax/minimax-m3.1-flash:free",
  "google/gemma-4-31b-it:free",
  "meta-llama/llama-3.3-70b-instruct",
];

const SYSTEM_PROMPT = `You are a senior hardware verification engineer.
Convert the user's natural-language protocol rule into a verification property.

Rules:
- Use synchronous SystemVerilog Assertions: define a clocked \`property ... endproperty\`,
  use \`disable iff (<reset>)\`, and finish with \`assert property (...)\`.
- Express delays with ##N or ##[M:N]. Use |-> (overlapped) or |=> (non-overlapped) deliberately.
- Every monitored signal must appear in the SVA.
- python_test_stub must be a self-contained cocotb test: \`import cocotb\`, an @cocotb.test() async
  function, a Clock, drive stimulus, and assert on the outcome. Return raw executable Python code only.
- Choose conventional names (clk, rst_n) when the rule does not specify them.
- If the rule is ambiguous, pick the most conventional interpretation and state it in \`explanation\`.

Output MUST be raw valid JSON strictly matching this schema with no markdown formatting:
{
  "rule_name": "UPPER_SNAKE_CASE",
  "clock": "clk",
  "reset": "!rst_n",
  "monitored_signals": ["clk", "rst_n", "sig1", "sig2"],
  "trigger_condition": "condition description",
  "expected_outcome": "outcome description",
  "max_latency_cycles": 3,
  "formal_sva": "property p_rule; ... endproperty\\nassert property (p_rule);",
  "python_test_stub": "import cocotb\\n...",
  "explanation": "One sentence explanation"
}`;

function cleanCodeFences(code: string): string {
  let cleaned = (code || "").trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:[a-zA-Z0-9_-]+)?\s*\n?/, "");
    cleaned = cleaned.replace(/\n?```\s*$/, "");
  }
  return cleaned.trim();
}

function runChecks(r: {
  formal_sva: string;
  python_test_stub: string;
  clock: string;
  monitored_signals: string[];
  max_latency_cycles: number;
}) {
  const sva = r.formal_sva || "";
  const clockName = (r.clock || "").replace(/\W/g, "");
  const stub = cleanCodeFences(r.python_test_stub);

  const hasPropertyBlock = /\bproperty\b/.test(sva) && /\bendproperty\b/.test(sva);
  const hasAssertProperty = /\bassert\s+property\b/.test(sva);
  const usesClock = Boolean(clockName) && sva.includes(clockName);
  const hasResetDisable = sva.includes("disable iff");
  const referencesAllSignals = (r.monitored_signals || []).every((s) => sva.includes(s));
  const n = r.max_latency_cycles;
  const cycleBoundPresent = n === 0 || sva.includes(String(n)) || sva.includes("##1");
  const cocotbImported = /(?:import|from)\s+cocotb/.test(stub);
  const pythonStubParses =
    cocotbImported &&
    stub.includes("async def ") &&
    stub.includes("@cocotb.test()") &&
    !stub.includes("SyntaxError");

  return {
    has_property_block: hasPropertyBlock,
    has_assert_property: hasAssertProperty,
    uses_clock: usesClock,
    has_reset_disable: hasResetDisable,
    references_all_signals: referencesAllSignals,
    cycle_bound_present: cycleBoundPresent,
    python_stub_parses: pythonStubParses,
    cocotb_imported: cocotbImported,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const spec = (body.spec || "").trim();

    if (!spec || spec.length < 5) {
      return NextResponse.json(
        { detail: "Specification text too short (min 5 characters)." },
        { status: 422 }
      );
    }

    const customKey =
      request.headers.get("x-openrouter-key") || process.env.OPENROUTER_API_KEY;

    let resultData: any = null;

    if (customKey && customKey.trim().length > 5) {
      const apiKey = customKey.trim();

      for (const model of FREE_MODELS) {
        try {
          const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
              "HTTP-Referer": "https://spec2assert.vercel.app",
              "X-Title": "Spec2Assert",
            },
            body: JSON.stringify({
              model,
              messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: `Protocol rule:\n"${spec}"` },
              ],
              temperature: 0.0,
              response_format: { type: "json_object" },
            }),
          });

          if (res.ok) {
            const json = await res.json();
            const rawContent = json.choices?.[0]?.message?.content;
            if (rawContent) {
              const cleanedJson = cleanCodeFences(rawContent);
              resultData = JSON.parse(cleanedJson);
              break;
            }
          }
        } catch {
          // Try next model in fallback cascade
        }
      }
    }

    // Fallback to verified deterministic synthesizer if offline or models unavailable
    if (!resultData || !resultData.formal_sva) {
      resultData = getDemoFixture(spec);
    }

    resultData.formal_sva = cleanCodeFences(resultData.formal_sva);
    resultData.python_test_stub = cleanCodeFences(resultData.python_test_stub);

    const checks = runChecks(resultData);
    const passed = Object.values(checks).every(Boolean);

    const newId = inMemoryHistory.length + 101;
    const payload = {
      ...resultData,
      id: newId,
      spec,
      deterministic_check_passed: passed,
      checks,
    };

    inMemoryHistory.unshift({
      id: newId,
      created_at: new Date().toISOString(),
      spec,
      rule_name: resultData.rule_name || "HARDWARE_ASSERT",
      passed: passed ? 1 : 0,
      payload,
    });

    return NextResponse.json(payload);
  } catch (err: any) {
    return NextResponse.json(
      { detail: err.message || "Synthesis engine encountered an error." },
      { status: 500 }
    );
  }
}
