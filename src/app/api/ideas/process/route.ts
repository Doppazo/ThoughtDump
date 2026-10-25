import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken } from "@/lib/firebase/admin";
import { processDumpWithGemini, findRelatedIdeasWithGemini } from "@/lib/gemini/client";
import { getUserCategories, getUserIdeas, saveUserIdea, saveUserDump } from "@/lib/storage";
import { Idea, IdeaLink } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const uid = await verifyAuthToken(authHeader);

    const body = await req.json();
    const { text, inputType = "text" } = body;

    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    if (text.length > 5000) {
      return NextResponse.json(
        { error: "Text exceeds maximum limit of 5,000 characters" },
        { status: 400 }
      );
    }

    const trimmedText = text.trim();

    // Fetch existing categories and ideas
    const existingCats = await getUserCategories(uid);
    const existingCatNames = existingCats.map((c) => c.name);
    const existingIdeas = await getUserIdeas(uid);

    let thoughts;
    let status: "processed" | "unprocessed" = "processed";

    try {
      thoughts = await processDumpWithGemini(trimmedText, existingCatNames, existingIdeas);
    } catch (aiErr) {
      console.error("AI processing error, fallback:", aiErr);
      thoughts = [
        {
          title: "Untitled thought",
          summary: trimmedText,
          category: "Unsorted",
          type: "note" as const,
          tags: [],
          links: [],
        },
      ];
      status = "unprocessed";
    }

    const now = Date.now();
    const dumpId = `dump_${now}_${Math.random().toString(36).substring(2, 7)}`;

    // Save raw dump
    await saveUserDump(uid, {
      text: trimmedText,
      createdAt: now,
    }, dumpId);

    // Save thoughts with AI linking
    const savedIdeas: Idea[] = [];
    for (const t of thoughts) {
      let aiLinks: IdeaLink[] = [];

      try {
        // Link to existing ideas (up to 100 recent)
        const related = await findRelatedIdeasWithGemini(
          { title: t.title, summary: t.summary, category: t.category },
          [...savedIdeas, ...existingIdeas]
        );

        aiLinks = related.map((r) => ({
          ideaId: r.ideaId,
          reason: r.reason,
          source: "ai" as const,
        }));
      } catch (linkErr) {
        console.warn("AI linking error, proceeding without links:", linkErr);
      }

      const saved = await saveUserIdea(uid, {
        title: t.title,
        summary: t.summary,
        originalText: trimmedText,
        category: t.category || "Unsorted",
        type: t.type,
        tags: t.tags || [],
        links: aiLinks,
        backlinks: [],
        done: false,
        dumpId,
        inputType: inputType === "voice" ? "voice" : "text",
        status,
        createdAt: now,
        updatedAt: now,
      });
      savedIdeas.push(saved);
    }

    const primaryIdea = savedIdeas[0];
    const isNew = !existingCatNames.some(
      (c) => c.toLowerCase() === primaryIdea?.category?.toLowerCase()
    );

    return NextResponse.json({
      idea: primaryIdea,
      ideas: savedIdeas,
      category: primaryIdea?.category || "Unsorted",
      isNewCategory: isNew,
      dumpId,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    console.error("Error in /api/ideas/process:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
