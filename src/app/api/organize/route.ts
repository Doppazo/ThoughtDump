// POST { text, context } -> { thoughts, usedAI }
// The AI splits a dump into notes following docs/ai-note-rules.md.
// The app then saves them into the user's vault.
import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken } from "@/lib/firebase/admin";
import { organizeDumpWithGemini, OrganizeContext } from "@/lib/gemini/client";

const arr = (v: unknown) => (Array.isArray(v) ? v : []);

export async function POST(req: NextRequest) {
  try {
    await verifyAuthToken(req.headers.get("authorization"));
  } catch {
    return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  }
  try {
    const body = await req.json();
    const text = String(body.text || "").trim();
    if (!text) return NextResponse.json({ error: "Nothing to sort." }, { status: 400 });
    if (text.length > 20000) return NextResponse.json({ error: "That's too long. Try a shorter dump." }, { status: 413 });

    const c = body.context || {};
    const context: OrganizeContext = {
      categories: arr(c.categories).map((x: any) => ({ name: String(x?.name || "").slice(0, 40), count: Number(x?.count) || 0 })).filter((x) => x.name),
      tags: arr(c.tags).map((x) => String(x).slice(0, 30)),
      entities: arr(c.entities).map((x: any) => ({
        name: String(x?.name || "").slice(0, 60),
        kind: String(x?.kind || "").slice(0, 12),
        aliases: arr(x?.aliases).map((a) => String(a).slice(0, 60)).slice(0, 8),
      })).filter((x) => x.name),
      candidates: arr(c.candidates).map((x: any) => ({
        title: String(x?.title || "").slice(0, 120),
        type: String(x?.type || "").slice(0, 12),
        categories: arr(x?.categories).map((a) => String(a).slice(0, 40)).slice(0, 3),
      })).filter((x) => x.title),
    };

    const result = await organizeDumpWithGemini(text, context);
    return NextResponse.json(result);
  } catch (err) {
    console.error("organize failed:", err);
    return NextResponse.json({ error: "Couldn't sort that. Try again." }, { status: 500 });
  }
}
