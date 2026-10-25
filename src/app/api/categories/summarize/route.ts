import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken } from "@/lib/firebase/admin";
import { summarizeCategoryWithGemini } from "@/lib/gemini/client";
import { getUserIdeas } from "@/lib/storage";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const uid = await verifyAuthToken(authHeader);

    const body = await req.json();
    const { categoryName } = body;

    if (!categoryName) {
      return NextResponse.json({ error: "categoryName is required" }, { status: 400 });
    }

    const ideas = await getUserIdeas(uid);
    const categoryIdeas = ideas.filter(
      (i) => i.category.toLowerCase() === categoryName.toLowerCase()
    );

    const summary = await summarizeCategoryWithGemini(
      categoryName,
      categoryIdeas.map((i) => ({ title: i.title, summary: i.summary }))
    );

    return NextResponse.json({ summary });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
