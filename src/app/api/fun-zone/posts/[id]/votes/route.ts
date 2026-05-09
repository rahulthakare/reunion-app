import { NextResponse, type NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { getSessionUser } from "../../../_helpers";
import { awardPoints } from "@/lib/utils/funZone";
import type { FunPost, FunVote } from "@/types/fun-zone";

type VoteType = "upvote" | "best-glow-up" | "most-changed" | "same-same";
const VALID_TYPES: VoteType[] = ["upvote", "best-glow-up", "most-changed", "same-same"];

// POST /api/fun-zone/posts/:id/votes — toggle a vote on post or comment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: postId } = await params;

  try {
    const body = (await request.json()) as { commentId?: string; voteType?: VoteType };
    const voteType = (body.voteType ?? "upvote") as VoteType;
    if (!VALID_TYPES.includes(voteType)) {
      return NextResponse.json({ error: "Invalid voteType" }, { status: 400 });
    }
    const commentId = body.commentId ?? null;

    // Deterministic vote ID prevents duplicate votes
    const voteId = commentId
      ? `${postId}_${commentId}_${user.uid}_${voteType}`
      : `${postId}_${user.uid}_${voteType}`;
    const voteRef = adminDb.doc(`funVotes/${voteId}`);
    const existing = await voteRef.get();

    if (existing.exists) {
      // Toggle off
      await voteRef.delete();
      if (commentId) {
        const cRef = adminDb.doc(`funComments/${commentId}`);
        const cSnap = await cRef.get();
        if (cSnap.exists) {
          const c = cSnap.data();
          await cRef.update({ votes: Math.max(0, ((c?.votes as number) ?? 1) - 1) });
        }
      } else {
        const pRef = adminDb.doc(`funPosts/${postId}`);
        const pSnap = await pRef.get();
        if (pSnap.exists) {
          const p = pSnap.data() as FunPost;
          await pRef.update({ voteCount: Math.max(0, (p.voteCount ?? 1) - 1) });
        }
      }
      return NextResponse.json({ status: "removed" });
    }

    // Add vote
    const vote: FunVote = {
      id: voteId,
      postId,
      commentId: commentId ?? undefined,
      userId: user.uid,
      voteType,
      createdAt: new Date().toISOString(),
    };
    await voteRef.set(vote);

    if (commentId) {
      const cRef = adminDb.doc(`funComments/${commentId}`);
      const cSnap = await cRef.get();
      if (cSnap.exists) {
        const c = cSnap.data();
        const newVotes = ((c?.votes as number) ?? 0) + 1;
        await cRef.update({ votes: newVotes });
        // For caption-this: award point to comment author
        const post = (await adminDb.doc(`funPosts/${postId}`).get()).data() as FunPost | undefined;
        if (post?.gameType === "caption-this" && c?.userId) {
          await awardPoints({
            userId: c.userId,
            userName: c.userName,
            gameType: "caption-this",
            points: 1,
          });
        }
      }
    } else {
      const pRef = adminDb.doc(`funPosts/${postId}`);
      const pSnap = await pRef.get();
      if (pSnap.exists) {
        const p = pSnap.data() as FunPost;
        await pRef.update({ voteCount: (p.voteCount ?? 0) + 1 });
      }
    }
    return NextResponse.json({ status: "added" });
  } catch (err) {
    console.error("[POST vote] failed:", err);
    return NextResponse.json({ error: "Failed to record vote." }, { status: 500 });
  }
}
