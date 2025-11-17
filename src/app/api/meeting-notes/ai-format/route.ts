/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { rawNote } = await req.json();
    if (!rawNote) return NextResponse.json({ error: "rawNote wajib diisi" }, { status: 400 });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: rawNote,
      config: {
        temperature: 0.3,
        systemInstruction:
          "Format isi notulen rapat rapi, keluarkan hanya isi notulen tanpa kata pengantar/pembuka/penutup, gunakan bullet points bila perlu, dan jangan ubah makna kata-kata."
      },
    });

    return NextResponse.json({ formattedNote: response.text ?? "" });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Gagal memformat notulen" }, { status: 500 });
  }
}
