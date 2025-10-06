// app/api/test-sheets/route.ts
import { NextResponse } from "next/server";
import { readTestRows } from "@/lib/google/sheets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await readTestRows(3);
    return NextResponse.json({ ok: true, rows });
    } catch (err: unknown) {
    console.error(err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
