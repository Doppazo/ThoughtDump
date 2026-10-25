import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken } from "@/lib/firebase/admin";
import { getUserDumps, saveUserDump, clearUserExamples } from "@/lib/storage";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const uid = await verifyAuthToken(authHeader);

    const dumps = await getUserDumps(uid);
    return NextResponse.json({ dumps });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const uid = await verifyAuthToken(authHeader);

    const body = await req.json();
    const { text } = body;

    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const saved = await saveUserDump(uid, {
      text: text.trim(),
      createdAt: Date.now(),
    });

    return NextResponse.json({ dump: saved });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const uid = await verifyAuthToken(authHeader);

    const { searchParams } = new URL(req.url);
    const clearExamples = searchParams.get("clearExamples");

    if (clearExamples === "true") {
      await clearUserExamples(uid);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
