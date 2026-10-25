import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken } from "@/lib/firebase/admin";
import { transcribeAudioWithGemini } from "@/lib/gemini/client";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    await verifyAuthToken(authHeader);

    const contentType = req.headers.get("content-type") || "";

    let audioBuffer: Buffer;
    let mimeType = "audio/webm";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("audio") as File | null;
      if (!file) {
        return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
      }
      mimeType = file.type || "audio/webm";
      const bytes = await file.arrayBuffer();
      audioBuffer = Buffer.from(bytes);
    } else {
      const body = await req.json();
      if (!body.audio) {
        return NextResponse.json({ error: "audio base64 data required" }, { status: 400 });
      }
      mimeType = body.mimeType || "audio/webm";
      audioBuffer = Buffer.from(body.audio, "base64");
    }

    if (audioBuffer.length === 0) {
      return NextResponse.json({ error: "Empty audio data" }, { status: 400 });
    }

    const transcript = await transcribeAudioWithGemini(audioBuffer, mimeType);
    return NextResponse.json({ transcript });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    console.error("Error in /api/transcribe:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
