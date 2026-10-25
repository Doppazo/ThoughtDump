import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken } from "@/lib/firebase/admin";
import { getUserIdeas, updateUserIdea, deleteUserIdea } from "@/lib/storage";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const uid = await verifyAuthToken(authHeader);

    const ideas = await getUserIdeas(uid);
    return NextResponse.json({ ideas });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const uid = await verifyAuthToken(authHeader);

    const body = await req.json();
    const { ideaId, title, summary, category, status, done, type, tags, links } = body;

    if (!ideaId) {
      return NextResponse.json({ error: "ideaId is required" }, { status: 400 });
    }

    const updated = await updateUserIdea(uid, ideaId, {
      ...(title !== undefined && { title }),
      ...(summary !== undefined && { summary }),
      ...(category !== undefined && { category }),
      ...(status !== undefined && { status }),
      ...(done !== undefined && { done }),
      ...(type !== undefined && { type }),
      ...(tags !== undefined && { tags }),
      ...(links !== undefined && { links }),
    });

    if (!updated) {
      return NextResponse.json({ error: "Idea not found" }, { status: 404 });
    }

    return NextResponse.json({ idea: updated });
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
    const ideaId = searchParams.get("id");

    if (!ideaId) {
      return NextResponse.json({ error: "id param is required" }, { status: 400 });
    }

    const success = await deleteUserIdea(uid, ideaId);
    if (!success) {
      return NextResponse.json({ error: "Idea not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
