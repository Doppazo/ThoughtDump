import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken } from "@/lib/firebase/admin";
import { processIdeaWithGemini } from "@/lib/gemini/client";
import { getUserIdeas, getUserCategories, updateUserIdea } from "@/lib/storage";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const uid = await verifyAuthToken(authHeader);

    const body = await req.json();
    const { ideaId } = body;

    if (!ideaId) {
      return NextResponse.json({ error: "ideaId is required" }, { status: 400 });
    }

    const ideas = await getUserIdeas(uid);
    const targetIdea = ideas.find((i) => i.id === ideaId);

    if (!targetIdea) {
      return NextResponse.json({ error: "Idea not found" }, { status: 404 });
    }

    const existingCats = await getUserCategories(uid);
    const existingCatNames = existingCats
      .filter((c) => c.name !== "Unsorted")
      .map((c) => c.name);

    const processed = await processIdeaWithGemini(
      targetIdea.originalText || targetIdea.summary || targetIdea.title,
      existingCatNames
    );

    const updated = await updateUserIdea(uid, ideaId, {
      title: processed.title,
      summary: processed.summary,
      category: processed.category,
      type: processed.type,
      status: "processed",
    });

    return NextResponse.json({ idea: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    console.error("Error in /api/ideas/reprocess:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
