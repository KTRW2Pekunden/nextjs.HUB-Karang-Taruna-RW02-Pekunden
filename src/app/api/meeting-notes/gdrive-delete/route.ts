/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { folderUrl } = body;

    if (!folderUrl) {
      return NextResponse.json({ success: false, error: "folderUrl wajib diisi" }, { status: 400 });
    }

    const refreshToken = req.cookies.get("gdrive_refresh_token")?.value;
    if (!refreshToken) {
      return NextResponse.json({ success: false, error: "GDrive refresh token tidak tersedia" }, { status: 401 });
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({ refresh_token: refreshToken });

    await oauth2Client.getAccessToken();

    const drive = google.drive({ version: "v3", auth: oauth2Client });

    const folderIdMatch = folderUrl.match(/[-\w]{25,}/);
    if (!folderIdMatch) {
      return NextResponse.json({ success: false, error: "URL folder tidak valid" }, { status: 400 });
    }
    const folderId = folderIdMatch[0];

    await drive.files.delete({ fileId: folderId });

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("Gagal menghapus folder:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Gagal menghapus folder" },
      { status: 400 }
    );
  }
}
