export interface HistoryRecord {
  id: number;
  created_at: string;
  spec: string;
  rule_name: string;
  passed: number;
  payload?: any;
}

export const inMemoryHistory: HistoryRecord[] = [
  {
    id: 101,
    created_at: "2026-08-30T14:20:00Z",
    spec: "When TVALID is asserted high, TREADY must be asserted within 3 clock cycles. TVALID must remain high until handshake occurs.",
    rule_name: "AXI4_HANDSHAKE_TIMEOUT",
    passed: 1,
  },
  {
    id: 102,
    created_at: "2026-08-30T15:10:00Z",
    spec: "When fifo_full is asserted, any write_en pulse must trigger overflow_err on the next clock cycle with fifo_we suppressed.",
    rule_name: "FIFO_OVERFLOW_SUPPRESS",
    passed: 1,
  },
  {
    id: 103,
    created_at: "2026-08-30T16:00:00Z",
    spec: "If PSEL and PENABLE are asserted high while PREADY remains low for more than 16 cycles, PSLVERR must assert high.",
    rule_name: "APB_TRANSFER_TIMEOUT",
    passed: 1,
  },
];
