// Voice recordings in the user's vault.
// POST ?path=audio/<name>: upload raw audio bytes. GET ?path=: play/download it.
import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken } from "@/lib/supabase-server";
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

    const totalSize = audio.buf.length;
    const contentType = audio.type || (path.endsWith(".m4a") ? "audio/mp4" : "audio/webm");
    const rangeHeader = req.headers.get("range");

    if (rangeHeader && rangeHeader.startsWith("bytes=")) {
      const parts = rangeHeader.slice(6).split("-");
      const start = parseInt(parts[0], 10) || 0;
      const end = parts[1] ? parseInt(parts[1], 10) : totalSize - 1;

      if (start >= totalSize || end >= totalSize || start > end) {
        return new NextResponse(null, {
          status: 416,
          headers: { "Content-Range": `bytes */${totalSize}` },
        });
      }

      const chunk = audio.buf.subarray(start, end + 1);
      return new NextResponse(new Uint8Array(chunk), {
        status: 206,
        headers: {
          "Content-Range": `bytes ${start}-${end}/${totalSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": String(chunk.length),
          "Content-Type": contentType,
          "Cache-Control": "private, max-age=3600",
        },
      });
    }

    return new NextResponse(new Uint8Array(audio.buf), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(totalSize),
        "Accept-Ranges": "bytes",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (err) {
    console.error("audio read failed:", err);
    return NextResponse.json({ error: "Couldn't load the recording." }, { status: 500 });
  }
}
