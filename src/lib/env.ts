// lib/env.ts
import { z } from "zod";

const EnvSchema = z.object({
  GOOGLE_PROJECT_ID: z.string(),
  GOOGLE_CLIENT_EMAIL: z.string(),
  GOOGLE_PRIVATE_KEY: z.string(),
  SHEETS_SPREADSHEET_ID: z.string(),
  SHEETS_TAB_NAME: z.string(),
});

const raw = {
  GOOGLE_PROJECT_ID: process.env.GOOGLE_PROJECT_ID,
  GOOGLE_CLIENT_EMAIL: process.env.GOOGLE_CLIENT_EMAIL,
  GOOGLE_PRIVATE_KEY: process.env.GOOGLE_PRIVATE_KEY,
  SHEETS_SPREADSHEET_ID: process.env.SHEETS_SPREADSHEET_ID,
  SHEETS_TAB_NAME: process.env.SHEETS_TAB_NAME,
};

// Convertir "\n" a saltos reales si es necesario
if (raw.GOOGLE_PRIVATE_KEY?.includes("\\n")) {
  raw.GOOGLE_PRIVATE_KEY = raw.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n");
}

export const env = EnvSchema.parse(raw);
