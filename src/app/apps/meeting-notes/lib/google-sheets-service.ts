/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { google } from "googleapis";

function getAuth() {
  return google.auth.getClient({
    projectId: process.env.GOOGLE_PROJECT_ID,
    credentials: {
      type: "service_account",
      project_id: process.env.GOOGLE_PROJECT_ID,
      private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

export async function getSheetDataByColumn() {
  const auth = await getAuth();
  const sheets = google.sheets({ version: "v4", auth });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.SHEET_ID!,
    range: "DOC_SHEET!A:F",
  });

  const rows = response.data.values || [];
  if (rows.length <= 1) return [];

  const header = rows[0];

  return rows.slice(1).map((row) => {
    const obj: Record<string, string> = {};
    header.forEach((col, i) => (obj[col] = row[i] || ""));
    return obj;
  });
}

export async function addMeetingNote(data: {
  TANGGAL: string;
  "WAKTU MULAI": string;
  "WAKTU SELESAI": string;
  NOTULEN: string;
  "LINK DOKUMENTASI": string;
}) {
  const auth = await getAuth();
  const sheets = google.sheets({ version: "v4", auth });

  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.SHEET_ID!,
    range: "DOC_SHEET!A:F",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [
        [
          data.TANGGAL,
          data["WAKTU MULAI"],
          data["WAKTU SELESAI"],
          data.NOTULEN,
          data["LINK DOKUMENTASI"],
        ],
      ],
    },
  });

  return { success: true };
}

export async function deleteMeetingNote(rowIndex: number) {
  const auth = await getAuth();
  const sheets = google.sheets({ version: "v4", auth });

  const result = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.SHEET_ID!,
    range: "DOC_SHEET!A:A",
  });

  const rowCount = result.data.values?.length || 0;

  if (rowIndex === 1) {
    return { success: false, message: "Header tidak boleh dihapus." };
  }

  if (rowCount <= 2) {
    await sheets.spreadsheets.values.clear({
      spreadsheetId: process.env.SHEET_ID!,
      range: `DOC_SHEET!A${rowIndex}:Z${rowIndex}`,
    });
    return { success: true, method: "clearOnly" };
  }

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: process.env.SHEET_ID!,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: 0,
              dimension: "ROWS",
              startIndex: rowIndex - 1,
              endIndex: rowIndex,
            },
          },
        },
      ],
    },
  });

  return { success: true, method: "deleteDimension" };
}

export const updateMeetingNote = async (rowNumber: number, data: any) => {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      type: "service_account",
      project_id: process.env.GOOGLE_PROJECT_ID,
      private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });
  const sheetId = process.env.SHEET_ID;

  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: `DOC_SHEET!A${rowNumber}:E${rowNumber}`,
    valueInputOption: "RAW",
    requestBody: {
      values: [
        [
          data.TANGGAL,
          data["WAKTU MULAI"],
          data["WAKTU SELESAI"],
          data.NOTULEN,
          data["LINK DOKUMENTASI"] || "",
        ],
      ],
    },
  });
};

async function getDriveAuth() {
  return google.auth.getClient({
    projectId: process.env.GOOGLE_PROJECT_ID,
    credentials: {
      type: "service_account",
      project_id: process.env.GOOGLE_PROJECT_ID,
      private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
    },
    scopes: ["https://www.googleapis.com/auth/drive"],
  });
}

export async function deleteFolderByUrl(folderUrl: string) {
  if (!folderUrl) return { success: false, message: "Folder URL kosong" };

  const auth = await getDriveAuth();
  const drive = google.drive({ version: "v3", auth });

  const match = folderUrl.match(/[-\w]{25,}/);
  if (!match) return { success: false, message: "Tidak bisa ambil folder ID" };

  const folderId = match[0];

  try {
    await drive.files.delete({ fileId: folderId });
    return { success: true };
  } catch (err) {
    console.error("Gagal menghapus folder:", err);
    return { success: false, message: "Gagal menghapus folder di Drive" };
  }
}
