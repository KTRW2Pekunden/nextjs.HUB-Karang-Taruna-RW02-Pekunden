/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getDriveClient } from "@/app/apps/meeting-notes/lib/google-drive";

export const runtime = "nodejs";

interface FileItem {
  id: string;
  name: string;
  type: "file" | "folder";
  size?: number;
  createdAt: string;
  parentId?: string;
}

async function getAllFiles(drive: any, folderId: string): Promise<FileItem[]> {
  const res = await drive.files.list({
    q: `'${folderId}' in parents and trashed=false`,
    fields: "files(id, name, mimeType, size, createdTime)",
    pageSize: 1000,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });

  const files: FileItem[] = [];

  for (const f of res.data.files || []) {
    const item: FileItem = {
      id: f.id!,
      name: f.name!,
      type:
        f.mimeType === "application/vnd.google-apps.folder" ? "folder" : "file",
      size: f.size ? Number(f.size) : undefined,
      createdAt: f.createdTime || new Date().toISOString(),
      parentId: folderId,
    };
    files.push(item);

    if (item.type === "folder") {
      const subFiles = await getAllFiles(drive, item.id);
      files.push(...subFiles);
    }
  }

  return files;
}

export async function GET() {
  try {
    const drive = await getDriveClient();
    const rootFolderId = process.env.GDRIVE_PARENT_ACTIVITY!;

    const folderRes = await drive.files.list({
      q: `'${rootFolderId}' in parents and name='DOKUMENTASI' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: "files(id, name)",
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    if (!folderRes.data.files || folderRes.data.files.length === 0) {
      return NextResponse.json(
        { error: "Folder DOKUMENTASI tidak ditemukan" },
        { status: 404 }
      );
    }

    const dokumentasiId = folderRes.data.files[0].id!;
    const allFiles = await getAllFiles(drive, dokumentasiId);

    return NextResponse.json(allFiles);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
