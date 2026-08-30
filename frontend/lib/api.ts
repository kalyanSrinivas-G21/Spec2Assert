export interface AssertionResult {
  id: number | null;
  spec?: string;
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
  request<AssertionResult>("/api/generate", {
    method: "POST",
    body: JSON.stringify({ spec }),
  });

export const getHistory = () => request<HistoryItem[]>("/api/history");

export const getHistoryItem = (id: number) =>
  request<AssertionResult>(`/api/history/${id}`);
