/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getDriveClient } from "@/app/apps/meeting-notes/lib/google-drive";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, parentId } = body;

    if (!name || !parentId) {
      return NextResponse.json(
        { error: "name dan parentId wajib diisi" },
        { status: 400 }
      );
    }

    const drive = await getDriveClient();

    const folder = await drive.files.create({
      requestBody: {
        name,
        mimeType: "application/vnd.google-apps.folder",
        parents: [parentId],
      },
      fields: "id, name",
    });

    return NextResponse.json({
      id: folder.data.id,
      name: folder.data.name,
      type: "folder",
      parentId,
      createdAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("Create folder error:", err);
    return NextResponse.json({ error: err.message || "Failed to create folder" }, { status: 500 });
  }
}
