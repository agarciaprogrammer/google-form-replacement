import { google, sheets_v4 } from "googleapis";
import { env } from "../env";

let sheetsClient: sheets_v4.Sheets | null = null;

function getAuth() {
  return new google.auth.JWT({
    email: env.GOOGLE_CLIENT_EMAIL,
    key: env.GOOGLE_PRIVATE_KEY,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

export function getSheetsClient() {
  if (!sheetsClient) {
    sheetsClient = google.sheets({ version: "v4", auth: getAuth() });
  }
  return sheetsClient;
}

export async function readTestRows(limit = 5) {
  const sheets = getSheetsClient();
  const range = `${env.SHEETS_TAB_NAME}!A1:Z${limit}`;
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: env.SHEETS_SPREADSHEET_ID,
    range,
  });
  return res.data.values ?? [];
}

// ✅ NUEVA FUNCIÓN — escritura en el sheet
export async function appendRow(values: (string | number | null)[]) {
  const sheets = getSheetsClient();
  const range = `${env.SHEETS_TAB_NAME}!A:Z`; // agrega al final
  await sheets.spreadsheets.values.append({
    spreadsheetId: env.SHEETS_SPREADSHEET_ID,
    range,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [values],
    },
  });
}
