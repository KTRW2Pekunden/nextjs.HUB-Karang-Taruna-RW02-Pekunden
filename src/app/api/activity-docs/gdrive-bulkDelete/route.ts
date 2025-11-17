/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getDriveClient } from "@/app/apps/meeting-notes/lib/google-drive";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fileIds } = body;

    if (!Array.isArray(fileIds) || fileIds.length === 0) {
      return NextResponse.json(
        { error: "fileIds wajib diisi sebagai array non-kosong" },
        { status: 400 }
      );
    }

    const drive = await getDriveClient();
    const results = [];
    const errors = [];

    for (const fileId of fileIds) {
      try {
        await drive.files.delete({
          fileId,
        });
        results.push({ id: fileId, status: "success" });
      } catch (err: any) {
        console.error(`Gagal menghapus file ID ${fileId}:`, err.message);
        errors.push({ id: fileId, status: "failed", error: err.message });
      }
    }

    if (results.length === 0 && errors.length > 0) {
        return NextResponse.json(
            { 
                error: "Semua file gagal dihapus",
                details: errors
            },
            { status: 500 }
        );
    }

    return NextResponse.json({ 
        success: true, 
        deletedCount: results.length,
        failedCount: errors.length,
        failedItems: errors.map(e => e.id)
    });

  } catch (err: any) {
    console.error("Bulk Delete error:", err);
    return NextResponse.json(
      { error: err.message || "Kesalahan server saat memproses penghapusan massal" },
      { status: 500 }
    );
  }
}