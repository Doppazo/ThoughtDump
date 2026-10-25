import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken } from "@/lib/firebase/admin";
import { askAIWithGemini } from "@/lib/gemini/client";
import { getUserIdeas } from "@/lib/storage";

// AI lookup: answers a question using only the user's saved notes.
// Thought Dump sends its vault notes in the request ({ question, notes });
// without notes it falls back to the original ideas store.
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const uid = await verifyAuthToken(authHeader);

    const body = await req.json();
    const { question } = body;

    if (!question || typeof question !== "string" || !question.trim()) {
      return NextResponse.json({ error: "question is required" }, { status: 400 });
    }

    let compactIdeas;
    if (Array.isArray(body.notes)) {
      compactIdeas = body.notes.slice(0, 200).map((n: any) => ({
        id: String(n.id || "").slice(0, 200),
        title: String(n.title || "").slice(0, 120),
        summary: String(n.summary || "").slice(0, 500),
        category: String(n.category || "").slice(0, 40),
        type: String(n.type || "note").slice(0, 12),
        done: Boolean(n.done),
        createdAt: Number(n.createdAt) || 0,
      }));
    } else {
      const ideas = await getUserIdeas(uid);
      compactIdeas = ideas.map((idea) => ({
        id: idea.id,
        title: idea.title,
        summary: idea.summary,
        category: idea.category,
        createdAt: idea.createdAt,
      }));
    }

    const result = await askAIWithGemini(question.trim().slice(0, 1000), compactIdeas);

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    console.error("Error in /api/ask:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
