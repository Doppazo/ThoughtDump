import { GoogleGenerativeAI } from "@google/generative-ai";
import { ThoughtType, ThoughtLink } from "@/types";

const apiKey = process.env.GEMINI_API_KEY || "";
const primaryModel = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
const CANDIDATE_MODELS = Array.from(new Set([primaryModel, "gemini-3.5-flash-lite", "gemini-3-flash-preview", "gemini-3.8-flash"]));

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export interface ProcessedThought {
  title: string;
  summary: string;
  category: string;
  type: ThoughtType;
  tags: string[];
  links: ThoughtLink[];
}

export interface ProcessedIdeaResult {
  title: string;
  summary: string;
  category: string;
  type?: ThoughtType;
  tags?: string[];
  links?: ThoughtLink[];
}

export interface AskAIResult {
  answer: string;
  ideaIds: string[];
}

const VALID_TYPES: ThoughtType[] = ["idea", "task", "question", "reminder", "note"];

export function cleanType(t: string | undefined): ThoughtType {
  const clean = String(t || "").toLowerCase();
  return VALID_TYPES.includes(clean as ThoughtType) ? (clean as ThoughtType) : "note";
}

export async function processDumpWithGemini(
  rawText: string,
  existingCategories: string[],
  existingThoughts: Array<{ id: string; category: string; type?: string; title: string }>
): Promise<ProcessedThought[]> {
  const catsStr = existingCategories.length > 0 ? existingCategories.join(", ") : "(none yet)";
  const brainIndex = existingThoughts
    .slice(-120)
    .map((i) => `${i.id} | ${i.category} | ${i.type || "note"} | ${i.title}`)
    .join("\n") || "(empty)";

  const prompt = `You organize a person's "thought dump" into their second brain.

The person typed or dictated this messy dump:
"""
${rawText}
"""

Their existing categories: ${catsStr}
Their existing thoughts (id | category | type | title):
${brainIndex}

Do this:
1. Split the dump into separate thoughts. One thought = one idea, task, question, reminder, or note. Drop filler words.
2. For each thought give:
   - "title": short, max 8 words, clear on its own
   - "summary": 1-2 plain sentences in the person's voice, cleaned up. Keep their meaning; don't add facts.
   - "category": reuse an existing category if it fits; otherwise make a new one, 1-3 words, Title Case (e.g. "Business Ideas", "School", "Personal").
   - "type": one of idea, task, question, reminder, note. Use "task" for things they need to do.
   - "tags": up to 3 short lowercase tags
   - "links": existing thought ids that this genuinely connects to, each with "why" (max 10 words). Use [] if none. Only use ids from the list above.

Reply with only JSON in this shape:
{"thoughts":[{"title":"","summary":"","category":"","type":"task","tags":[""],"links":[{"id":"","why":""}]}]}`;

  if (genAI) {
    for (const targetModel of CANDIDATE_MODELS) {
      try {
        const model = genAI.getGenerativeModel({
          model: targetModel,
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.2,
          },
        });

        const response = await model.generateContent(prompt);
        const text = response.response.text();
        const parsed = JSON.parse(text);

        const arr = Array.isArray(parsed)
          ? parsed
          : parsed && Array.isArray(parsed.thoughts)
          ? parsed.thoughts
          : null;

        if (arr && arr.length > 0) {
          return arr.map((item: any) => ({
            title: String(item.title || "Untitled thought").trim().slice(0, 90),
            summary: String(item.summary || rawText).trim().slice(0, 300),
            category: String(item.category || "Unsorted").trim().slice(0, 30),
            type: cleanType(item.type),
            tags: (Array.isArray(item.tags) ? item.tags : [])
              .slice(0, 3)
              .map((t: any) => String(t).toLowerCase().replace(/^#/, "").slice(0, 20))
              .filter(Boolean),
            links: (Array.isArray(item.links) ? item.links : [])
              .filter((l: any) => l && l.id)
              .map((l: any) => ({ id: String(l.id), why: String(l.why || "").slice(0, 80) })),
          }));
        }
      } catch (err) {
        console.warn(`Gemini processing with model ${targetModel} failed:`, err);
        // Try next candidate model
      }
    }
  }

  // Fallback heuristic matching thought-dump.html
  return fallbackSortDump(rawText);
}

export async function processIdeaWithGemini(
  rawText: string,
  existingCategories: string[]
): Promise<ProcessedIdeaResult> {
  const thoughts = await processDumpWithGemini(rawText, existingCategories, []);
  if (thoughts.length > 0) {
    return thoughts[0];
  }
  return {
    title: "Untitled thought",
    summary: rawText,
    category: "Unsorted",
    type: "note",
    tags: [],
    links: [],
  };
}

export function fallbackSortDump(text: string): ProcessedThought[] {
  const parts = text
    .split(/\n+|(?<=[.!?])\s+|\s+(?:also|and also|oh and|plus)\s+/i)
    .map((s) => s.trim())
    .filter((s) => s.length > 3);

  const list = parts.length > 0 ? parts : [text.trim()];

  return list.map((p) => {
    const low = p.toLowerCase();
    let type: ThoughtType = "note";
    if (
      /^(need to|have to|gotta|must|email|call|buy|book|send|finish|start|i need to|remind me)/.test(low) ||
      /\b(need to|have to|remind me)\b/.test(low)
    ) {
      type = "task";
    } else if (/\?$/.test(p) || /\b(i wonder|what if|should i|would)\b/.test(low)) {
      type = /what if|app|business|startup/.test(low) ? "idea" : "question";
    } else if (/\b(idea|app|business|startup)\b/.test(low)) {
      type = "idea";
    }

    const title = p
      .replace(/^(ok so|so|and|oh|also|random but)\s+/i, "")
      .split(/\s+/)
      .slice(0, 8)
      .join(" ")
      .replace(/[,.]$/, "");

    let category = "Unsorted";
    if (type === "idea" || /\b(startup|app|business|subscription|product)\b/i.test(low)) {
      category = "Business Ideas";
    } else if (/\b(midterm|exam|class|prof|stats|study|lecture|homework)\b/i.test(low)) {
      category = "School";
    } else if (/\b(sql|python|learn|book|read|skill|course)\b/i.test(low)) {
      category = "Learning";
    } else if (/\b(grandma|sister|birthday|family|call|gift|mom|dad)\b/i.test(low)) {
      category = "Personal";
    }

    const tags: string[] = [];
    if (/\bstartup\b/i.test(low)) tags.push("startup");
    if (/\bcampus\b/i.test(low)) tags.push("campus");
    if (/\bvalidation\b/i.test(low)) tags.push("validation");

    return {
      title: title.charAt(0).toUpperCase() + title.slice(1),
      summary: p,
      category,
      type,
      tags,
      links: [],
    };
  });
}

export async function askAIWithGemini(
  question: string,
  ideas: Array<{ id: string; title: string; summary: string; category: string; type?: string; done?: boolean; createdAt: number }>
): Promise<AskAIResult> {
  const notes = ideas
    .slice(-150)
    .map((i) => `- [${i.title}] (${i.category}, ${i.type || "note"}${i.done ? ", done" : ""}): ${i.summary}`)
    .join("\n");

  const prompt = `You are the person's second brain. Answer their question using ONLY their notes below. Write simply and briefly (under 120 words), speaking to them as "you". When you use a note, mention its title in [square brackets]. If the notes don't cover it, say so plainly.

Their notes:
${notes || "(no notes yet)"}

Their question: ${question}

Return ONLY JSON:
{ "answer": "string", "ideaIds": ["string"] }`;

  if (genAI) {
    for (const targetModel of CANDIDATE_MODELS) {
      try {
        const model = genAI.getGenerativeModel({
          model: targetModel,
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.2,
          },
        });

        const response = await model.generateContent(prompt);
        const text = response.response.text();
        const parsed = JSON.parse(text);

        return {
          answer: parsed.answer || "No relevant thoughts found.",
          ideaIds: Array.isArray(parsed.ideaIds) ? parsed.ideaIds : [],
        };
      } catch (err) {
        console.warn(`Gemini Ask AI with ${targetModel} failed:`, err);
      }
    }
  }

  return fallbackAskAI(question, ideas);
}

function fallbackAskAI(
  question: string,
  ideas: Array<{ id: string; title: string; summary: string; category: string; type?: string; done?: boolean; createdAt: number }>
): AskAIResult {
  const q = question.toLowerCase();
  const qWords = q.split(/\s+/).filter((w) => w.length > 2);

  const matched = ideas.filter((idea) => {
    const text = `${idea.title} ${idea.summary} ${idea.category} ${idea.type || ""}`.toLowerCase();
    return qWords.some((word) => text.includes(word));
  });

  if (matched.length === 0) {
    return {
      answer: "I couldn't find any saved thoughts matching your question.",
      ideaIds: [],
    };
  }

  const titles = matched.map((m) => `[${m.title}]`).join(", ");
  return {
    answer: `Found ${matched.length} related thought(s): ${titles}.`,
    ideaIds: matched.map((m) => m.id),
  };
}

export async function transcribeAudioWithGemini(
  audioBuffer: Buffer,
  mimeType: string = "audio/webm"
): Promise<string> {
  if (!genAI) {
    throw new Error("GEMINI_API_KEY is not configured for audio transcription fallback.");
  }

  const model = genAI.getGenerativeModel({ model: primaryModel });
  const response = await model.generateContent([
    {
      inlineData: {
        mimeType: mimeType.split(";")[0],
        data: audioBuffer.toString("base64"),
      },
    },
    {
      text: "Transcribe the spoken words in this audio exactly as said. Return ONLY the transcription text, nothing else.",
    },
  ]);

  return response.response.text().trim();
}

export interface RelatedIdeaResult {
  ideaId: string;
  reason: string;
}

export async function findRelatedIdeasWithGemini(
  newIdea: { id?: string; title: string; summary: string; category: string },
  existingIdeas: Array<{ id: string; title: string; summary: string; category: string }>
): Promise<RelatedIdeaResult[]> {
  const candidateIdeas = existingIdeas
    .filter((i) => i.id !== newIdea.id)
    .slice(0, 100)
    .map((i) => ({
      id: i.id,
      title: i.title,
      summary: i.summary,
      category: i.category,
    }));

  if (candidateIdeas.length === 0) return [];

  const prompt = `You find genuine connections between a new idea and existing notes in a person's second brain.

NEW IDEA:
Title: ${newIdea.title}
Summary: ${newIdea.summary}
Category: ${newIdea.category}

EXISTING IDEAS:
${JSON.stringify(candidateIdeas)}

RULES:
- Link ONLY when ideas share a real topic, goal, project, or problem.
- DO NOT link ideas just because they are in the same category.
- Return up to 5 related ideas with a short reason (under 12 words).
- Return an empty list if nothing is genuinely related.
- Use ONLY idea IDs from the provided EXISTING IDEAS list.

Return valid JSON with format:
{ "related": [ { "ideaId": "string", "reason": "string" } ] }`;

  if (genAI) {
    for (const targetModel of CANDIDATE_MODELS) {
      try {
        const model = genAI.getGenerativeModel({
          model: targetModel,
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.1,
          },
        });

        const response = await model.generateContent(prompt);
        const text = response.response.text();
        const parsed = JSON.parse(text);

        if (parsed && Array.isArray(parsed.related)) {
          const validIds = new Set(candidateIdeas.map((c) => c.id));
          return parsed.related
            .filter((r: any) => r && r.ideaId && validIds.has(String(r.ideaId)))
            .map((r: any) => ({
              ideaId: String(r.ideaId),
              reason: String(r.reason || "Connected thought").slice(0, 80),
            }))
            .slice(0, 5);
        }
      } catch (err) {
        console.warn(`Related ideas lookup failed with model ${targetModel}:`, err);
      }
    }
  }

  // Fallback keyword / topic heuristic
  const newTokens = `${newIdea.title} ${newIdea.summary}`.toLowerCase().split(/\W+/).filter((w) => w.length > 4);
  const matched: RelatedIdeaResult[] = [];

  for (const item of candidateIdeas) {
    const itemTokens = `${item.title} ${item.summary}`.toLowerCase();
    const common = newTokens.filter((token) => itemTokens.includes(token));
    if (common.length >= 2) {
      matched.push({
        ideaId: item.id,
        reason: `Both touch on ${common.slice(0, 2).join(" & ")}`,
      });
      if (matched.length >= 3) break;
    }
  }

  return matched;
}

export async function summarizeCategoryWithGemini(
  categoryName: string,
  ideas: Array<{ title: string; summary: string }>
): Promise<string> {
  const ideasText = ideas.map((i) => `- ${i.title}: ${i.summary}`).join("\n");
  const prompt = `Provide a concise 2-3 paragraph executive summary of all the notes in the "${categoryName}" category. Highlight key themes, recurring goals, and next steps for the student.

NOTES:
${ideasText || "(No notes in this category yet)"}`;

  if (genAI) {
    for (const targetModel of CANDIDATE_MODELS) {
      try {
        const model = genAI.getGenerativeModel({ model: targetModel });
        const response = await model.generateContent(prompt);
        return response.response.text().trim();
      } catch (err) {
        console.warn(`Category summary with ${targetModel} failed:`, err);
      }
    }
  }

  return `This category contains ${ideas.length} ideas focusing on ${categoryName.toLowerCase()}, including ${ideas.slice(0, 3).map((i) => `"${i.title}"`).join(", ")}.`;
}
