// app/api/test-sheets/route.ts
import { NextResponse } from "next/server";
import { readTestRows } from "@/lib/google/sheets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await readTestRows(3);
    return NextResponse.json({ ok: true, rows });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
