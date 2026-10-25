import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken } from "@/lib/firebase/admin";
import { getUserIdeas, getUserCategories } from "@/lib/storage";
import JSZip from "jszip";

function sanitizeFilename(name: string): string {
  const cleaned = name.replace(/[/\\:*?"<>|]/g, "").trim();
  return cleaned || "Untitled Note";
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const uid = await verifyAuthToken(authHeader);

    const [ideas, categories] = await Promise.all([
      getUserIdeas(uid),
      getUserCategories(uid),
    ]);

    const zip = new JSZip();
    const vaultFolder = zip.folder("Thinkbox Vault") || zip;

    // Track sanitized filenames per category and global map
    const idToFilename = new Map<string, string>();
    const usedNamesGlobal = new Set<string>();

    for (const idea of ideas) {
      let base = sanitizeFilename(idea.title);
      let candidate = base;
      let counter = 2;

      while (usedNamesGlobal.has(candidate.toLowerCase())) {
        candidate = `${base} (${counter})`;
        counter++;
      }

      usedNamesGlobal.add(candidate.toLowerCase());
      idToFilename.set(idea.id, candidate);
    }

    // Group ideas by category
    const categoryGroups = new Map<string, typeof ideas>();
    for (const idea of ideas) {
      const cat = idea.category || "Unsorted";
      if (!categoryGroups.has(cat)) {
        categoryGroups.set(cat, []);
      }
      categoryGroups.get(cat)!.push(idea);
    }

    // Ensure all registered categories exist
    for (const cat of categories) {
      if (!categoryGroups.has(cat.name)) {
        categoryGroups.set(cat.name, []);
      }
    }

    // Generate files in each category folder
    for (const [categoryName, categoryIdeas] of categoryGroups.entries()) {
      const sanitizedCatFolder = sanitizeFilename(categoryName);
      const catFolder = vaultFolder.folder(sanitizedCatFolder);
      if (!catFolder) continue;

      const hubFilename = `_${sanitizedCatFolder}`;

      // 1. Create Category Hub Note
      let hubContent = `# ${categoryName}\n\n`;
      hubContent += `Category hub note for [[${hubFilename}]]. Total notes: ${categoryIdeas.length}\n\n`;
      hubContent += `## Notes in this Category\n`;

      if (categoryIdeas.length === 0) {
        hubContent += `*(No notes in this category yet)*\n`;
      } else {
        for (const idea of categoryIdeas) {
          const fn = idToFilename.get(idea.id) || sanitizeFilename(idea.title);
          hubContent += `- [[${fn}]]\n`;
        }
      }

      catFolder.file(`${hubFilename}.md`, hubContent);

      // 2. Create Idea Notes
      for (const idea of categoryIdeas) {
        const fn = idToFilename.get(idea.id) || sanitizeFilename(idea.title);
        const createdDate = new Date(idea.createdAt).toISOString().split("T")[0];
        const tags = ["thinkbox", ...(idea.tags || [])].map((t) => t.replace(/[^a-zA-Z0-9_-]/g, "")).filter(Boolean);

        let noteContent = `---\n`;
        noteContent += `category: "${idea.category}"\n`;
        noteContent += `created: ${createdDate}\n`;
        noteContent += `tags: [${tags.join(", ")}]\n`;
        noteContent += `---\n`;
        noteContent += `# ${idea.title}\n\n`;
        noteContent += `${idea.summary}\n\n`;

        // Related ideas section with wikilinks
        const links = (idea.links || []).filter((l) => idToFilename.has(l.ideaId));
        if (links.length > 0) {
          noteContent += `## Related\n`;
          for (const l of links) {
            const targetFn = idToFilename.get(l.ideaId)!;
            noteContent += `- [[${targetFn}]] — ${l.reason}\n`;
          }
          noteContent += `\n`;
        }

        // Backlinks section if any
        const backlinks = (idea.backlinks || []).filter((b) => idToFilename.has(b.ideaId));
        if (backlinks.length > 0) {
          noteContent += `## Backlinks\n`;
          for (const b of backlinks) {
            const sourceFn = idToFilename.get(b.ideaId)!;
            noteContent += `- [[${sourceFn}]] — ${b.reason}\n`;
          }
          noteContent += `\n`;
        }

        // Category wikilink
        noteContent += `## Category\n[[${hubFilename}]]\n\n`;

        // Original transcript
        noteContent += `## Original\n> ${idea.originalText.replace(/\n/g, "\n> ")}\n`;

        catFolder.file(`${fn}.md`, noteContent);
      }
    }

    const zipBuffer = await zip.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    });

    return new NextResponse(new Uint8Array(zipBuffer), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="Thinkbox-Vault-${Date.now()}.zip"`,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    console.error("Vault export error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
