import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken } from "@/lib/firebase/admin";
import { getUserCategories, renameCategory, mergeCategories } from "@/lib/storage";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const uid = await verifyAuthToken(authHeader);

    const categories = await getUserCategories(uid);
    return NextResponse.json({ categories });
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
    const { action, oldName, newName, sourceCategory, targetCategory } = body;

    if (action === "rename") {
      if (!oldName || !newName) {
        return NextResponse.json({ error: "oldName and newName are required" }, { status: 400 });
      }
      await renameCategory(uid, oldName.trim(), newName.trim());
      const categories = await getUserCategories(uid);
      return NextResponse.json({ success: true, categories });
    }

    if (action === "merge") {
      if (!sourceCategory || !targetCategory) {
        return NextResponse.json(
          { error: "sourceCategory and targetCategory are required" },
          { status: 400 }
        );
      }
      await mergeCategories(uid, sourceCategory.trim(), targetCategory.trim());
      const categories = await getUserCategories(uid);
      return NextResponse.json({ success: true, categories });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
