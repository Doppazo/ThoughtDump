import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken } from "@/lib/firebase/admin";
import { addManualIdeaLink, removeIdeaLink } from "@/lib/storage";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const uid = await verifyAuthToken(authHeader);

    const body = await req.json();
    const { sourceIdeaId, targetIdeaId, reason = "Connected thought" } = body;

    if (!sourceIdeaId || !targetIdeaId) {
      return NextResponse.json(
        { error: "sourceIdeaId and targetIdeaId are required" },
        { status: 400 }
      );
    }

    const result = await addManualIdeaLink(uid, sourceIdeaId, targetIdeaId, reason);
    if (!result) {
      return NextResponse.json({ error: "Failed to create link" }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const uid = await verifyAuthToken(authHeader);

    const body = await req.json();
    const { sourceIdeaId, targetIdeaId } = body;

    if (!sourceIdeaId || !targetIdeaId) {
      return NextResponse.json(
        { error: "sourceIdeaId and targetIdeaId are required" },
        { status: 400 }
      );
    }

    const success = await removeIdeaLink(uid, sourceIdeaId, targetIdeaId);
    return NextResponse.json({ success });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
