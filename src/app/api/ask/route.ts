import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken } from "@/lib/firebase/admin";
import { askAIWithGemini } from "@/lib/gemini/client";
import { getUserIdeas } from "@/lib/storage";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const uid = await verifyAuthToken(authHeader);

    const body = await req.json();
    const { question } = body;

    if (!question || typeof question !== "string" || !question.trim()) {
      return NextResponse.json({ error: "question is required" }, { status: 400 });
    }

    const ideas = await getUserIdeas(uid);
    const compactIdeas = ideas.map((idea) => ({
      id: idea.id,
      title: idea.title,
      summary: idea.summary,
      category: idea.category,
      createdAt: idea.createdAt,
    }));

    const result = await askAIWithGemini(question.trim(), compactIdeas);

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    console.error("Error in /api/ask:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
