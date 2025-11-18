"use server";
import { google } from "googleapis";

const SHEET_RANGE = "TRANSACTION!A:F";

interface SheetTransaction {
  Tanggal: string;
  Jenis: "income" | "expense";
  Keterangan: string;
  Jumlah: number;
}

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

export async function getAllTransactionsFromSheet() {
  const auth = await getAuth();
  const sheets = google.sheets({ version: "v4", auth });
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SHEET_ID_CASH_MANAGEMENT!,
      range: SHEET_RANGE,
    });
    const rows = response.data.values || [];
    if (rows.length <= 1) return [];
    return rows.slice(1).map((row, index) => ({
      id: row[0] || `TRX-${(index + 1).toString().padStart(4, "0")}`,
      date: row[1] || "",
      type: (row[2]?.toLowerCase() as "income" | "expense") || "expense",
      description: row[3] || "",
      amount: Number((row[4] || "0").toString().replace(/\./g, "")) || 0,
    }));
  } catch (error) {
    console.error("Gagal mengambil data:", error);
    return [];
  }
}

async function updateAllSaldo() {
  const auth = await getAuth();
  const sheets = google.sheets({ version: "v4", auth });
  const all = await getAllTransactionsFromSheet();
  let saldo = 0;
  const values = all.map((t) => {
    saldo += t.type === "income" ? t.amount : -t.amount;
    return [saldo.toLocaleString("id-ID")];
  });
  if (values.length === 0) return;
  await sheets.spreadsheets.values.update({
    spreadsheetId: process.env.SHEET_ID_CASH_MANAGEMENT!,
    range: "TRANSACTION!F2:F",
    valueInputOption: "USER_ENTERED",
    requestBody: { values },
  });
}

export async function addTransactionToSheet(data: SheetTransaction) {
  const auth = await getAuth();
  const sheets = google.sheets({ version: "v4", auth });
  try {
    const generateRandomId = () => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let result = "";
      for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    const transactionId = `TRX-${generateRandomId()}`;
    const formattedAmount = data.Jumlah.toLocaleString("id-ID");

    const values = [
      transactionId,
      data.Tanggal,
      data.Jenis,
      data.Keterangan,
      formattedAmount
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SHEET_ID_CASH_MANAGEMENT!,
      range: "TRANSACTION!A:F",
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [values] },
    });

    await updateAllSaldo();
    return { success: true };
  } catch (error) {
    console.error("Gagal tambah transaksi:", error);
    return { success: false };
  }
}

export async function updateTransactionToSheet(
  id: string,
  data: SheetTransaction
) {
  const auth = await getAuth();
  const sheets = google.sheets({ version: "v4", auth });
  try {
    const all = await getAllTransactionsFromSheet();
    const rowIndex = all.findIndex((t) => t.id === id);
    if (rowIndex === -1) return { success: false };
    const sheetRow = rowIndex + 2;
    const formattedAmount = data.Jumlah.toLocaleString("id-ID");

    const values = [
      id,
      data.Tanggal,
      data.Jenis,
      data.Keterangan,
      formattedAmount,
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.SHEET_ID_CASH_MANAGEMENT!,
      range: `TRANSACTION!A${sheetRow}:E${sheetRow}`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [values] },
    });

    await updateAllSaldo(); 
    return { success: true };
  } catch (error) {
    console.error("Gagal update + saldo:", error);
    return { success: false };
  }
}

export async function deleteTransactionFromSheet(id: string) {
  const auth = await getAuth();
  const sheets = google.sheets({ version: "v4", auth });
  try {
    const all = await getAllTransactionsFromSheet();
    const rowIndex = all.findIndex((t) => t.id === id);
    if (rowIndex === -1) return { success: false };
    const sheetRow = rowIndex + 2;
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: process.env.SHEET_ID_CASH_MANAGEMENT!,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: 0,
                dimension: "ROWS",
                startIndex: sheetRow - 1,
                endIndex: sheetRow,
              },
            },
          },
        ],
      },
    });
    await updateAllSaldo();
    return { success: true };
  } catch (error) {
    console.error("Gagal hapus + saldo:", error);
    return { success: false };
  }
}
