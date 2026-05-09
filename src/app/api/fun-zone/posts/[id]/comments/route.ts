import { NextResponse, type NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { getSessionUser } from "../../../_helpers";
import { awardPoints } from "@/lib/utils/funZone";
import type { FunComment, FunPost } from "@/types/fun-zone";

// GET /api/fun-zone/posts/:id/comments — auth required
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  try {
    const snap = await adminDb
      .collection("funComments")
      .where("postId", "==", id)
      .get();
    const comments: FunComment[] = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<FunComment, "id">),
    }));
    comments.sort((a, b) => (a.createdAt ?? "").localeCompare(b.createdAt ?? ""));
    return NextResponse.json({ comments });
  } catch (err) {
    console.error("[GET comments] failed:", err);
    return NextResponse.json({ error: "Failed to fetch comments." }, { status: 500 });
  }
}

// POST /api/fun-zone/posts/:id/comments — auth required; create guess/caption/answer
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  try {
    const body = (await request.json()) as { text?: string };
    const text = body.text?.trim();
    if (!text) return NextResponse.json({ error: "Comment text required." }, { status: 400 });

    const postRef = adminDb.doc(`funPosts/${id}`);
    const postSnap = await postRef.get();
    if (!postSnap.exists) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    const post = postSnap.data() as FunPost;

    const now = new Date().toISOString();
    const comment: Omit<FunComment, "id"> = {
      postId: id,
      userId: user.uid,
      userName: user.name,
      userPhotoURL: user.photoURL ?? null,
      text,
      votes: 0,
      createdAt: now,
    };

    // For memory-quiz: auto-grade against correctAnswer + award points
    if (post.gameType === "memory-quiz" && post.correctAnswer) {
      const normalized = post.correctAnswer.trim().toLowerCase();
      const guess = text.toLowerCase();
      const isCorrect = guess === normalized || guess.includes(normalized);
      comment.isCorrect = isCorrect;
      if (isCorrect) {
        // Check if any prior correct comment exists (first-correct bonus)
        const prior = await adminDb
          .collection("funComments")
          .where("postId", "==", id)
          .where("isCorrect", "==", true)
          .limit(1)
          .get();
        const points = prior.empty ? 15 : 10;
        await awardPoints({
          userId: user.uid,
          userName: user.name,
          gameType: "memory-quiz",
          points,
          correctGuess: true,
        });
      }
    }

    const ref = await adminDb.collection("funComments").add(comment);
    // Update denormalized counts
    await postRef.update({
      commentCount: (post.commentCount ?? 0) + 1,
      guessCount:
        post.gameType === "guess-who"
          ? (post.guessCount ?? 0) + 1
          : post.guessCount ?? 0,
    });

    return NextResponse.json(
      { id: ref.id, isCorrect: comment.isCorrect, status: "ok" },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST comment] failed:", err);
    return NextResponse.json({ error: "Failed to add comment." }, { status: 500 });
  }
}
