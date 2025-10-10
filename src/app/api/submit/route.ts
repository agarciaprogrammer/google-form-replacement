import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { appendRow } from "@/lib/google/sheets";
import { Resend } from "resend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const formSchema = z.object({
  email: z.string().email(),
  activity: z.enum(["Working Day", "Vacation", "Sick Leave"]),
  location: z.string().optional(),
  projects: z.array(z.string()).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
});

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const parsed = formSchema.parse(data);

    const TZ = "Europe/Kyiv";
    const now = new Date();
    const ddNow = new Intl.DateTimeFormat("en-GB", { day: "2-digit", timeZone: TZ }).format(now);
    const monNow = new Intl.DateTimeFormat("en-GB", { month: "short", timeZone: TZ }).format(now);
    const yyyyNow = new Intl.DateTimeFormat("en-GB", { year: "numeric", timeZone: TZ }).format(now);
    const hhmm = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: TZ,
    }).format(now);
    const timestamp = `${ddNow} ${monNow} ${yyyyNow} (${hhmm})`;

    // Procesar fecha enviada
    const [yyyyStr, mmStr, ddStr] = parsed.date.split("-");
    const day = parseInt(ddStr, 10);
    const month = new Date(`${parsed.date}T00:00:00Z`).toLocaleString("en-US", { month: "short" });
    const year = 2025;

    const ddPadded = ddStr.padStart(2, "0");
    const dateNumeric = `${ddPadded} ${month} ${year} (00:00)`;

    let location = parsed.location ?? "";
    let projectsJoined = (parsed.projects || []).join(", ");

    if (parsed.activity === "Vacation") {
      location = "Home";
      projectsJoined = "Vacation";
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

    const resend = new Resend(process.env.RESEND_API_KEY);

    const sendResult = await resend.emails.send({
      from: "SyncME Daily <onboarding@resend.dev>",
      to: parsed.email,
      subject: "Daily Status Confirmation",
      html: `
        <h2>Hi ${parsed.email.split("@")[0]}, your daily status has been received ✅</h2>
        <p><strong>Activity:</strong> ${parsed.activity}</p>
        <p><strong>Location:</strong> ${location || "N/A"}</p>
        <p><strong>Projects:</strong> ${projectsJoined || "N/A"}</p>
        <p><strong>Date:</strong> ${dateNumeric}</p>
        <hr/>
        <p>Submitted at: ${timestamp}</p>
        <p style="font-size:12px;color:#888;">This is an automatic confirmation email from SyncME Daily Status Form.</p>
      `,
    });
    
    console.log("📧 Resend result:", sendResult);
    
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Submit error:", err);
    return NextResponse.json(
      { ok: false, error: (err as Error).message },
      { status: 400 }
    );
  }
}
