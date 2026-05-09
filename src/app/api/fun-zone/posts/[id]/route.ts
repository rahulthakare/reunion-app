import { NextResponse, type NextRequest } from "next/server";
import { adminDb, getAdminApp } from "@/lib/firebase/admin";
import { getStorage } from "firebase-admin/storage";
import { getSessionUser } from "../../_helpers";
import { awardPoints } from "@/lib/utils/funZone";
import type { FunPost, FunComment } from "@/types/fun-zone";

// GET /api/fun-zone/posts/:id — auth required
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  try {
    const snap = await adminDb.doc(`funPosts/${id}`).get();
    if (!snap.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const data = { id: snap.id, ...(snap.data() as Omit<FunPost, "id">) };
    const sanitized =
      data.gameType === "guess-who" && data.isAnonymous && !data.isRevealed
        ? { ...data, uploadedByName: "?? Mystery batchmate" }
        : data;
    return NextResponse.json({ post: sanitized });
  } catch (err) {
    console.error("[GET /api/fun-zone/posts/:id] failed:", err);
    return NextResponse.json({ error: "Failed to fetch post." }, { status: 500 });
  }
}

// PATCH /api/fun-zone/posts/:id — owner reveals (guess-who) or admin moderates
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  try {
    const ref = adminDb.doc(`funPosts/${id}`);
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const post = snap.data() as FunPost;

    const isOwner = post.uploadedBy === user.uid;
    if (!isOwner && !user.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = (await request.json()) as Partial<FunPost> & { reveal?: boolean };

    // Handle reveal flow for guess-who
    if (body.reveal && post.gameType === "guess-who" && !post.isRevealed) {
      const correctAnswer = (body.correctAnswer || user.name).trim();
      await ref.update({
        isRevealed: true,
        revealedAt: new Date().toISOString(),
        correctAnswer,
        uploadedByName: user.name, // un-mask
      });

      // Auto-mark correct comments + award points
      const commentSnap = await adminDb
        .collection("funComments")
        .where("postId", "==", id)
        .get();
      const comments: FunComment[] = commentSnap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<FunComment, "id">),
      }));
      const sorted = comments.sort((a, b) =>
        (a.createdAt ?? "").localeCompare(b.createdAt ?? "")
      );
      const normalized = correctAnswer.toLowerCase();
      let firstCorrectAwarded = false;
      let wrongCount = 0;
      const batch = adminDb.batch();
      for (const c of sorted) {
        const guess = c.text.toLowerCase();
        const isCorrect =
          guess.includes(normalized) || normalized.includes(guess);
        batch.update(adminDb.doc(`funComments/${c.id}`), { isCorrect });
        if (isCorrect) {
          const points = firstCorrectAwarded ? 5 : 20;
          firstCorrectAwarded = true;
          await awardPoints({
            userId: c.userId,
            userName: c.userName,
            gameType: "guess-who",
            points,
            correctGuess: true,
          });
        } else {
          wrongCount += 1;
        }
      }
      await batch.commit();
      // Reward uploader for fooling people (capped)
      if (wrongCount > 0) {
        await awardPoints({
          userId: post.uploadedBy,
          userName: user.name,
          gameType: "guess-who",
          points: Math.min(wrongCount * 2, 20),
        });
      }
      return NextResponse.json({ status: "ok", revealed: true });
    }

    // Generic admin moderation updates
    const updates: Record<string, unknown> = {};
    if (typeof body.prompt === "string") updates.prompt = body.prompt.trim();
    if (typeof body.hint === "string") updates.hint = body.hint.trim();
    if (typeof body.question === "string") updates.question = body.question.trim();
    if (typeof body.correctAnswer === "string") updates.correctAnswer = body.correctAnswer.trim();
    if (Array.isArray(body.options)) updates.options = body.options;
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No updates provided." }, { status: 400 });
    }
    await ref.update(updates);
    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error("[PATCH /api/fun-zone/posts/:id] failed:", err);
    return NextResponse.json({ error: "Failed to update post." }, { status: 500 });
  }
}

// DELETE /api/fun-zone/posts/:id — owner or admin; also removes Storage file & comments
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  try {
    const ref = adminDb.doc(`funPosts/${id}`);
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const post = snap.data() as FunPost;
    if (post.uploadedBy !== user.uid && !user.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Best-effort cleanup of Storage files
    const paths = [
      post.imageStoragePath,
      post.imageThenStoragePath,
      post.imageNowStoragePath,
    ].filter(Boolean) as string[];
    if (paths.length > 0) {
      try {
        const bucket = getStorage(getAdminApp()).bucket();
        await Promise.all(
          paths.map((p) => bucket.file(p).delete({ ignoreNotFound: true }))
        );
      } catch (err) {
        console.warn("[DELETE post] storage cleanup warning:", err);
      }
    }

    // Delete comments + votes for this post
    const commentSnap = await adminDb
      .collection("funComments")
      .where("postId", "==", id)
      .get();
    const voteSnap = await adminDb
      .collection("funVotes")
      .where("postId", "==", id)
      .get();
    const batch = adminDb.batch();
    commentSnap.docs.forEach((d) => batch.delete(d.ref));
    voteSnap.docs.forEach((d) => batch.delete(d.ref));
    batch.delete(ref);
    await batch.commit();
    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error("[DELETE /api/fun-zone/posts/:id] failed:", err);
    return NextResponse.json({ error: "Failed to delete post." }, { status: 500 });
  }
}
