import { NextResponse, type NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { getArticleSessionUser } from "../../_helpers";

// POST /api/articles/:id/reject — admin only
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
    const body = (await request.json().catch(() => ({}))) as { reason?: string };
    const reason = body.reason?.trim() ?? "";
    const ref = adminDb.doc(`articles/${id}`);
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const now = new Date().toISOString();
    await ref.update({
      status: "rejected",
      reviewedAt: now,
      reviewedBy: user.uid,
      rejectionReason: reason,
      updatedAt: now,
    });
    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error("[POST reject] failed:", err);
    return NextResponse.json({ error: "Failed to reject." }, { status: 500 });
  }
}
