// Server storage for each user's vault: Obsidian-style .md files and audio.
// With Supabase configured: PostgreSQL (vault_files table) and Supabase Storage (vault_audio bucket).
// Without Supabase: kept in server memory, which resets when the server restarts (offline test mode).
import { supabaseServer, usingSupabase } from "@/lib/supabase-server";

export interface VaultFile {
  path: string;
  data: string | null; // text for .md and .json files; null for audio (streamed separately)
  modified: number;
  audio?: boolean;
  size?: number;
  contentType?: string;
}

const PATH_RE = /^(raw|audio|ideas|thoughts|todos|hubs|\.thoughtdump)\/[^/\\]{1,160}$/;
export const MAX_TEXT = 200_000;          // characters per note
export const MAX_AUDIO = 8 * 1024 * 1024; // 8 MB per recording on Supabase Storage

export function validPath(p: unknown): p is string {
  return typeof p === "string" && PATH_RE.test(p) && !p.includes("..");
}

export const usingFirebase = () => usingSupabase();
export const usingCloud = () => usingSupabase();

// ---------- Memory fallback (offline test mode) ----------
type Mem = { files: Map<string, VaultFile>; audio: Map<string, { buf: Buffer; type: string }> };
const g = globalThis as unknown as { __thoughtDumpVault?: Map<string, Mem> };
const memory = g.__thoughtDumpVault ?? (g.__thoughtDumpVault = new Map());
function mem(uid: string): Mem {
  let m = memory.get(uid);
  if (!m) {
    m = { files: new Map(), audio: new Map() };
    memory.set(uid, m);
  }
  return m;
}

// ---------- Supabase Storage & Database ----------
const audioKey = (uid: string, path: string) => `${uid}/${encodeURIComponent(path)}`;

export async function listFiles(uid: string): Promise<VaultFile[]> {
  if (supabaseServer) {
    // 1. Text files from database
    const { data: dbFiles, error: dbErr } = await supabaseServer
      .from("vault_files")
      .select("path, data, modified")
      .eq("user_id", uid);

    if (dbErr) {
      console.error("Error querying vault_files from Supabase:", dbErr);
      throw dbErr;
    }

    const textList: VaultFile[] = (dbFiles || []).map((f) => ({
      path: f.path,
      data: f.data,
      modified: Number(f.modified || Date.now()),
    }));

    // 2. Audio recordings from storage bucket
    let audioList: VaultFile[] = [];
    try {
      const { data: storageFiles } = await supabaseServer.storage
        .from("vault_audio")
        .list(uid);

      if (storageFiles && storageFiles.length) {
        audioList = storageFiles
          .filter((f) => f.name && !f.name.startsWith("."))
          .map((f) => ({
            path: decodeURIComponent(f.name),
            data: null,
            modified: new Date(f.updated_at || f.created_at || Date.now()).getTime(),
            audio: true,
            size: f.metadata?.size || 0,
            contentType: f.metadata?.mimetype || "audio/webm",
          }));
      }
    } catch (storageErr) {
      console.warn("Notice: could not list vault_audio bucket (bucket may need creation):", storageErr);
    }

    return [...textList, ...audioList];
  }

  return [...mem(uid).files.values()];
}

export async function putText(uid: string, path: string, data: string): Promise<VaultFile> {
  const modified = Date.now();
  const rec: VaultFile = { path, data, modified };

  if (supabaseServer) {
    const { error } = await supabaseServer
      .from("vault_files")
      .upsert(
        {
          user_id: uid,
          path,
          data,
          modified,
        },
        { onConflict: "user_id,path" }
      );

    if (error) {
      console.error("Error upserting vault_files in Supabase:", error);
      throw error;
    }
    return rec;
  }

  mem(uid).files.set(path, rec);
  return rec;
}

export async function removeFile(uid: string, path: string): Promise<void> {
  if (supabaseServer) {
    if (path.startsWith("audio/")) {
      await supabaseServer.storage.from("vault_audio").remove([audioKey(uid, path)]);
    } else {
      const { error } = await supabaseServer
        .from("vault_files")
        .delete()
        .match({ user_id: uid, path });
      if (error) throw error;
    }
    return;
  }

  mem(uid).files.delete(path);
  mem(uid).audio.delete(path);
}

export async function putAudio(uid: string, path: string, buf: Buffer, type: string): Promise<VaultFile> {
  const rec: VaultFile = {
    path,
    data: null,
    modified: Date.now(),
    audio: true,
    size: buf.length,
    contentType: type,
  };

  if (supabaseServer) {
    const { error } = await supabaseServer.storage
      .from("vault_audio")
      .upload(audioKey(uid, path), buf, {
        contentType: type,
        upsert: true,
      });

    if (error) {
      console.error("Error uploading audio to Supabase storage:", error);
      throw error;
    }
    return rec;
  }

  mem(uid).audio.set(path, { buf, type });
  mem(uid).files.set(path, rec);
  return rec;
}

export async function getAudio(uid: string, path: string): Promise<{ buf: Buffer; type: string } | null> {
  if (supabaseServer) {
    const { data, error } = await supabaseServer.storage
      .from("vault_audio")
      .download(audioKey(uid, path));

    if (error || !data) {
      console.warn("Could not download audio from Supabase:", error);
      return null;
    }

    const arrayBuffer = await data.arrayBuffer();
    return {
      buf: Buffer.from(arrayBuffer),
      type: data.type || "audio/webm",
    };
  }

  return mem(uid).audio.get(path) || null;
}
