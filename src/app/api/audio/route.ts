// Voice recordings in the user's vault.
// POST ?path=audio/<name>: upload raw audio bytes. GET ?path=: play/download it.
import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken } from "@/lib/firebase/admin";
import { getAudio, putAudio, validPath, MAX_AUDIO } from "@/lib/vault-store";

async function uidFrom(req: NextRequest) {
  try { return await verifyAuthToken(req.headers.get("authorization")); } catch { return null; }
}

export async function POST(req: NextRequest) {
  const uid = await uidFrom(req);
  if (!uid) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  const path = new URL(req.url).searchParams.get("path");
  if (!validPath(path) || !path.startsWith("audio/")) return NextResponse.json({ error: "Invalid audio path." }, { status: 400 });
  try {
    const buf = Buffer.from(await req.arrayBuffer());
    if (!buf.length) return NextResponse.json({ error: "Empty recording." }, { status: 400 });
    if (buf.length > MAX_AUDIO) return NextResponse.json({ error: "That recording is over 4 MB." }, { status: 413 });
    const type = (req.headers.get("content-type") || "audio/webm").slice(0, 80);
    const file = await putAudio(uid, path, buf, type);
    return NextResponse.json({ file });
  } catch (err) {
    console.error("audio upload failed:", err);
    return NextResponse.json({ error: "Couldn't save the recording." }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const uid = await uidFrom(req);
  if (!uid) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  const path = new URL(req.url).searchParams.get("path");
  if (!validPath(path) || !path.startsWith("audio/")) return NextResponse.json({ error: "Invalid audio path." }, { status: 400 });
  try {
    const audio = await getAudio(uid, path);
    if (!audio) return NextResponse.json({ error: "Recording not found." }, { status: 404 });
    return new NextResponse(new Uint8Array(audio.buf), {
      headers: { "Content-Type": audio.type, "Cache-Control": "private, max-age=3600" },
    });
  } catch (err) {
    console.error("audio read failed:", err);
    return NextResponse.json({ error: "Couldn't load the recording." }, { status: 500 });
  }
}
