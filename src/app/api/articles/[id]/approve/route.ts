import { NextResponse, type NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { getArticleSessionUser } from "../../_helpers";

// POST /api/articles/:id/approve — admin only
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getArticleSessionUser(request);
  if (!user || !user.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  try {
    const ref = adminDb.doc(`articles/${id}`);
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const now = new Date().toISOString();
    await ref.update({
      status: "published",
      reviewedAt: now,
      reviewedBy: user.uid,
      publishedAt: now,
      rejectionReason: "",
      updatedAt: now,
    });
    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error("[POST approve] failed:", err);
    return NextResponse.json({ error: "Failed to approve." }, { status: 500 });
  }
}
