/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getDriveClient } from "@/app/apps/meeting-notes/lib/google-drive";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const fileId = body.fileId;
    const newName = body.newName;

    if (!fileId || !newName) {
      return NextResponse.json({ error: "fileId and newName are required" }, { status: 400 });
    }

    const drive = await getDriveClient();

    const updated = await drive.files.update({
      fileId,
      requestBody: { name: newName },
      fields: "id, name, webViewLink",
    });

    return NextResponse.json({ success: true, file: updated.data });
  } catch (err: any) {
    console.error("Rename error:", err);
    return NextResponse.json({ error: err.message || "Failed to rename" }, { status: 500 });
  }
}
