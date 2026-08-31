import { NextResponse } from "next/server";
import { inMemoryHistory } from "../_store";

export async function GET() {
  return NextResponse.json(inMemoryHistory);
}
