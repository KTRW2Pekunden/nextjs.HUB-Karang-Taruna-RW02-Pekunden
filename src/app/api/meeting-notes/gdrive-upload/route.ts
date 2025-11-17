import { Readable } from "stream";
import { NextResponse } from "next/server";
import { getDriveClient } from "@/app/apps/meeting-notes/lib/google-drive";
import { drive_v3 } from "googleapis";

export const runtime = "nodejs";

async function getOrCreateFolder(
  drive: drive_v3.Drive,
  name: string,
  parentId: string
): Promise<string> {
  const query = `'${parentId}' in parents and name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
  const res = await drive.files.list({ q: query, fields: "files(id)" });
  const existingFolder = res.data.files?.[0]?.id;
  if (existingFolder) return existingFolder;

  const folder = await drive.files.create({
    requestBody: {
      name,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentId],
    },
    fields: "id",
  });

  if (!folder.data.id) throw new Error("Failed to create folder");
  return folder.data.id;
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const files = form.getAll("files") as File[];
    const date = (form.get("date") as string) || new Date().toISOString().slice(0, 10);

    if (!files.length) {
      return NextResponse.json({ error: "No files" }, { status: 400 });
    }

    const parentId = process.env.GDRIVE_PARENT_MEETING!;
    const drive = await getDriveClient();

    const dokumentasiFolder = await getOrCreateFolder(drive, "DOKUMENTASI", parentId);
    const dateFolder = await getOrCreateFolder(drive, date, dokumentasiFolder);

    const uploadedFiles: string[] = [];

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const stream = Readable.from(buffer);

      const f = await drive.files.create({
        requestBody: { name: file.name, parents: [dateFolder] },
        media: { mimeType: file.type, body: stream },
        fields: "id, webViewLink",
      });

      if (f.data.webViewLink) {
        uploadedFiles.push(f.data.webViewLink);
      }
    }

    return NextResponse.json({
      folderUrl: `https://drive.google.com/drive/folders/${dateFolder}`,
      uploadedFiles,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
