/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getDriveClient } from "@/app/apps/activity-docs/lib/google-drive";
import { Readable } from "stream";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const drive = await getDriveClient(); 

    const formData = await req.formData();
    const parentId = formData.get("parentId") as string;

    const files: File[] = [];
    formData.forEach((value) => {
      if (value instanceof File) files.push(value);
    });

    if (files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    const uploadedFiles = [];

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const stream = Readable.from(buffer);

      const response = await drive.files.create({
        requestBody: {
          name: file.name,
          parents: parentId ? [parentId] : [],
        },
        media: {
          mimeType: file.type || "application/octet-stream",
          body: stream,
        },
        fields: "id, name, mimeType, size, parents, createdTime",
      });

      uploadedFiles.push(response.data);
    }

    return NextResponse.json({ uploadedFiles });
  } catch (err: any) {
    console.error("GDrive upload error:", err);
    return NextResponse.json(
      { error: err.message || "Upload failed" },
      { status: 500 }
    );
  }
}
