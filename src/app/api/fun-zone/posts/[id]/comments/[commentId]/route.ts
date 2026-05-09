import { NextResponse, type NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { getSessionUser } from "../../../../_helpers";
import type { FunComment, FunPost } from "@/types/fun-zone";

// DELETE /api/fun-zone/posts/:id/comments/:commentId — author or admin
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  const user = await getSessionUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, commentId } = await params;

  try {
    const ref = adminDb.doc(`funComments/${commentId}`);
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const comment = snap.data() as FunComment;
    if (comment.userId !== user.uid && !user.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    await ref.delete();

    const postRef = adminDb.doc(`funPosts/${id}`);
    const postSnap = await postRef.get();
    if (postSnap.exists) {
      const post = postSnap.data() as FunPost;
      await postRef.update({
        commentCount: Math.max(0, (post.commentCount ?? 1) - 1),
      });
    }
    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error("[DELETE comment] failed:", err);
    return NextResponse.json({ error: "Failed to delete comment." }, { status: 500 });
  }
}
