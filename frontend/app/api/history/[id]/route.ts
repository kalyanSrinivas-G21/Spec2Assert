import { NextRequest, NextResponse } from "next/server";
import { inMemoryHistory } from "../../_store";
import { DEMO_FIXTURES } from "@/lib/api";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numId = parseInt(id, 10);

  const found = inMemoryHistory.find((item) => item.id === numId);
  if (found?.payload) {
    return NextResponse.json(found.payload);
  }

  if (numId === 101) return NextResponse.json(DEMO_FIXTURES.axi4);
  if (numId === 102) return NextResponse.json(DEMO_FIXTURES.fifo);
  if (numId === 103) return NextResponse.json(DEMO_FIXTURES.apb);

  return NextResponse.json({ detail: "History item not found" }, { status: 404 });
}
