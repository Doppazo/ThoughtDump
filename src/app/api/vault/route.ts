// The signed-in user's vault files.
// GET: list all files. PUT {path, data}: save a text file. DELETE ?path=: remove a file.
import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken } from "@/lib/firebase/admin";
import { listFiles, putText, removeFile, validPath, usingFirebase, MAX_TEXT } from "@/lib/vault-store";

async function uidFrom(req: NextRequest) {
  try { return await verifyAuthToken(req.headers.get("authorization")); } catch { return null; }
}

export async function GET(req: NextRequest) {
  const uid = await uidFrom(req);
  if (!uid) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  try {
    const files = await listFiles(uid);
    return NextResponse.json({ files, cloud: usingFirebase() });
  } catch (err) {
    console.error("vault list failed:", err);
    return NextResponse.json({ error: "Couldn't load your vault." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const uid = await uidFrom(req);
  if (!uid) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  try {
    const { path, data } = await req.json();
    if (!validPath(path) || path.startsWith("audio/")) return NextResponse.json({ error: "Invalid file path." }, { status: 400 });
    if (typeof data !== "string" || data.length > MAX_TEXT) return NextResponse.json({ error: "Invalid file contents." }, { status: 400 });
    const file = await putText(uid, path, data);
    return NextResponse.json({ file });
  } catch (err) {
    console.error("vault write failed:", err);
    return NextResponse.json({ error: "Couldn't save that note." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const uid = await uidFrom(req);
  if (!uid) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  const path = new URL(req.url).searchParams.get("path");
  if (!validPath(path)) return NextResponse.json({ error: "Invalid file path." }, { status: 400 });
  try {
    await removeFile(uid, path);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("vault delete failed:", err);
    return NextResponse.json({ error: "Couldn't delete that file." }, { status: 500 });
  }
}
