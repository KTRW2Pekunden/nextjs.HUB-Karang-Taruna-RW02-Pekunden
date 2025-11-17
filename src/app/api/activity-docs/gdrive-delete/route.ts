/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getDriveClient } from "@/app/apps/meeting-notes/lib/google-drive";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fileId } = body;

    if (!fileId) {
      return NextResponse.json(
        { error: "fileId wajib diisi" },
        { status: 400 }
      );
    }

    const drive = await getDriveClient();

    await drive.files.delete({
      fileId,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Delete error:", err);
    return NextResponse.json(
      { error: err.message || "Gagal menghapus file/folder" },
      { status: 500 }
    );
  }
}
