import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    prompt_version: "v3",
    runtime: "vercel-serverless",
  });
}
