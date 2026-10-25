import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken } from "@/lib/firebase/admin";
import { getUserIdeas } from "@/lib/storage";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const uid = await verifyAuthToken(authHeader);

    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format") || "markdown";

    const ideas = await getUserIdeas(uid);

    if (format === "json") {
      const jsonContent = JSON.stringify(ideas, null, 2);
      return new NextResponse(jsonContent, {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="thinkbox-ideas-${Date.now()}.json"`,
        },
      });
    }

    // Markdown format grouped by category
    const grouped: Record<string, typeof ideas> = {};
    for (const idea of ideas) {
      const cat = idea.category || "Unsorted";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(idea);
    }

    let markdown = `# Thinkbox — Saved Ideas\n*Exported on ${new Date().toLocaleString()}*\n\n`;

    const sortedCategories = Object.keys(grouped).sort();
    for (const category of sortedCategories) {
      markdown += `## ${category}\n\n`;
      for (const idea of grouped[category]) {
        markdown += `### ${idea.title}\n`;
        markdown += `*Saved: ${new Date(idea.createdAt).toLocaleString()} | Input: ${idea.inputType}*\n\n`;
        markdown += `> **Summary:** ${idea.summary}\n\n`;
        markdown += `**Original Transcript:**\n${idea.originalText}\n\n---\n\n`;
      }
    }

    return new NextResponse(markdown, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": `attachment; filename="thinkbox-ideas-${Date.now()}.md"`,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
