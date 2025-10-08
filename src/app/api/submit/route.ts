import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { appendRow } from "@/lib/google/sheets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const formSchema = z.object({
  email: z.string().email(),
  activity: z.enum(["Working Day", "Vacation", "Sick Leave"]),
  location: z.string().optional(),
  projects: z.array(z.string()).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const parsed = formSchema.parse(data);

    // Fecha actual y derivados
    const TZ = "Asia/Jerusalem";
    const now = new Date();

    const dd = new Intl.DateTimeFormat("en-GB", { day: "2-digit", timeZone: TZ }).format(now);
    const mon = new Intl.DateTimeFormat("en-GB", { month: "short", timeZone: TZ }).format(now);
    const yyyyTz = new Intl.DateTimeFormat("en-GB", { year: "numeric", timeZone: TZ }).format(now);
    const hhmm = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: TZ,
    }).format(now);

    // 👉 Timestamp EXACTO: 01 Sep 2025 (17:13)
    const timestamp = `${dd} ${mon} ${yyyyTz} (${hhmm})`;

    // Month/Day/Year para columnas separadas (Day sin cero a la izquierda)
    const month = mon;
    const day = parseInt(dd, 10);
    const year = 2025; // fijo como pediste

    // "Date" estilo ejemplo: 01 Sep 2025 (00:00)
    const dateNumeric = `${dd} ${mon} ${year} (00:00)`;

    // Defaults según tipo de actividad
    let location = parsed.location ?? "";
    let projectsJoined = (parsed.projects || []).join(", ");

    if (parsed.activity === "Vacation") {
      location = "Home";           // 🏠 siempre Home
      projectsJoined = "Vacation"; // 📅 override
    } else if (parsed.activity === "Sick Leave") {
      location = "Home";
      projectsJoined = "Sick";
    }

    const row = [
      timestamp,
      parsed.email,
      parsed.activity,
      projectsJoined,
      month,
      day,
      year,
      dateNumeric,
      location,
    ];

    await appendRow(row);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Submit error:", err);
    return NextResponse.json(
      { ok: false, error: (err as Error).message },
      { status: 400 }
    );
  }
}
