// Server storage for each user's vault: Obsidian-style .md files and audio.
// With Firebase set up: Firestore, users/{uid}/files/{path} (and audio in chunks,
// since Firestore documents max out at 1 MB and Firebase Storage needs a paid plan).
// Without Firebase: kept in server memory, which resets when the server restarts.
import { adminDb } from "@/lib/firebase-admin";

export interface VaultFile {
  path: string;
  data: string | null; // text for .md and .json files; null for audio (fetched separately)
  modified: number;
  audio?: boolean;
  size?: number;
  contentType?: string;
  chunks?: number;
}

const PATH_RE = /^(raw|audio|ideas|thoughts|todos|hubs|\.thoughtdump)\/[^/\\]{1,160}$/;
export const MAX_TEXT = 200_000;           // characters per note
export const MAX_AUDIO = 4 * 1024 * 1024;  // bytes per recording (hosting limit is about 4.5 MB)
const CHUNK = 700_000;                     // audio bytes per Firestore document

export function validPath(p: unknown): p is string {
  return typeof p === "string" && PATH_RE.test(p) && !p.includes("..");
}
export const usingFirebase = () => Boolean(adminDb);

// ---------- Memory fallback (no Firebase) ----------
type Mem = { files: Map<string, VaultFile>; audio: Map<string, { buf: Buffer; type: string }> };
const g = globalThis as unknown as { __thoughtDumpVault?: Map<string, Mem> };
const memory = g.__thoughtDumpVault ?? (g.__thoughtDumpVault = new Map());
function mem(uid: string): Mem {
  let m = memory.get(uid);
  if (!m) { m = { files: new Map(), audio: new Map() }; memory.set(uid, m); }
  return m;
}

// ---------- Firestore ----------
const docId = (path: string) => encodeURIComponent(path);
const filesCol = (uid: string) => adminDb!.collection("users").doc(uid).collection("files");
const audioCol = (uid: string) => adminDb!.collection("users").doc(uid).collection("audio");

export async function listFiles(uid: string): Promise<VaultFile[]> {
  if (adminDb) {
    const snap = await filesCol(uid).get();
    return snap.docs.map((d) => d.data() as VaultFile);
  }
  return [...mem(uid).files.values()];
}

export async function putText(uid: string, path: string, data: string): Promise<VaultFile> {
  const rec: VaultFile = { path, data, modified: Date.now() };
  if (adminDb) await filesCol(uid).doc(docId(path)).set(rec);
  else mem(uid).files.set(path, rec);
  return rec;
}

export async function removeFile(uid: string, path: string): Promise<void> {
  if (adminDb) {
    const ref = filesCol(uid).doc(docId(path));
    const snap = await ref.get();
    const chunks = snap.exists ? Number((snap.data() as VaultFile).chunks || 0) : 0;
    const batch = adminDb.batch();
    batch.delete(ref);
    for (let i = 0; i < chunks; i++) batch.delete(audioCol(uid).doc(`${docId(path)}__${i}`));
    await batch.commit();
    return;
  }
  mem(uid).files.delete(path);
  mem(uid).audio.delete(path);
}

export async function putAudio(uid: string, path: string, buf: Buffer, type: string): Promise<VaultFile> {
  const chunks = Math.max(1, Math.ceil(buf.length / CHUNK));
  const rec: VaultFile = { path, data: null, modified: Date.now(), audio: true, size: buf.length, contentType: type, chunks };
  if (adminDb) {
    const batch = adminDb.batch();
    for (let i = 0; i < chunks; i++) {
      batch.set(audioCol(uid).doc(`${docId(path)}__${i}`), {
        data: buf.subarray(i * CHUNK, (i + 1) * CHUNK).toString("base64"),
      });
    }
    batch.set(filesCol(uid).doc(docId(path)), rec);
    await batch.commit();
    return rec;
  }
  mem(uid).audio.set(path, { buf, type });
  mem(uid).files.set(path, rec);
  return rec;
}

export async function getAudio(uid: string, path: string): Promise<{ buf: Buffer; type: string } | null> {
  if (adminDb) {
    const snap = await filesCol(uid).doc(docId(path)).get();
    if (!snap.exists) return null;
    const rec = snap.data() as VaultFile;
    const chunkCount = Number(rec.chunks || 0);
    const chunkPromises = Array.from({ length: chunkCount }, (_, i) =>
      audioCol(uid).doc(`${docId(path)}__${i}`).get()
    );
    const snaps = await Promise.all(chunkPromises);
    const parts: Buffer[] = [];
    for (const c of snaps) {
      if (!c.exists) return null;
      parts.push(Buffer.from(String(c.data()?.data || ""), "base64"));
    }
    return { buf: Buffer.concat(parts), type: rec.contentType || "audio/webm" };
  }
  return mem(uid).audio.get(path) || null;
}
