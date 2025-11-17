/* eslint-disable @typescript-eslint/no-explicit-any */
import { google } from "googleapis";

export default async function handler(
  req: { method: string; body: { rowNumber: any; data: any } },
  res: {
    status: (arg0: number) => {
      (): any;
      new (): any;
      end: { (): any; new (): any };
      json: { (arg0: { success: boolean }): void; new (): any };
    };
  }
) {
  if (req.method !== "POST") return res.status(405).end();

  const { rowNumber, data } = req.body;

  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT || "{}"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  const sheetId = process.env.SHEET_ID;

  const values = [
    [
      data.TANGGAL,
      data["WAKTU MULAI"],
      data["WAKTU SELESAI"],
      data.NOTULEN,
      data["LINK DOKUMENTASI"] || "",
    ],
  ];

  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: `DOC_SHEET!A${rowNumber}:E${rowNumber}`, 
    valueInputOption: "RAW",
    requestBody: { values },
  });

  res.status(200).json({ success: true });
}
