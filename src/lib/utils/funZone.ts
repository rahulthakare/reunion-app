import { adminDb } from "@/lib/firebase/admin";
import type { FunPost, FunComment, FunScore, GameType } from "@/types/fun-zone";

/**
 * Server-side: fetch posts, optionally filtered by gameType, newest first.
 */
export async function getFunPosts(gameType?: GameType): Promise<FunPost[]> {
  try {
    let query: FirebaseFirestore.Query = adminDb.collection("funPosts");
    if (gameType) query = query.where("gameType", "==", gameType);
    const snapshot = await query.get();
    const posts: FunPost[] = snapshot.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<FunPost, "id">),
    }));
    posts.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
    // Hide identity for unrevealed guess-who posts
    return posts.map((p) =>
      p.gameType === "guess-who" && p.isAnonymous && !p.isRevealed
        ? { ...p, uploadedByName: "?? Mystery batchmate" }
        : p
    );
  } catch (err) {
    console.error("[getFunPosts] failed:", err);
    return [];
  }
}

export async function getFunPost(id: string): Promise<FunPost | null> {
  try {
    const doc = await adminDb.doc(`funPosts/${id}`).get();
    if (!doc.exists) return null;
    const data = { id: doc.id, ...(doc.data() as Omit<FunPost, "id">) };
    if (data.gameType === "guess-who" && data.isAnonymous && !data.isRevealed) {
      return { ...data, uploadedByName: "?? Mystery batchmate" };
    }
    return data;
  } catch (err) {
    console.error("[getFunPost] failed:", err);
    return null;
  }
}

export async function getComments(postId: string): Promise<FunComment[]> {
  try {
    const snap = await adminDb
      .collection("funComments")
      .where("postId", "==", postId)
      .get();
    const comments: FunComment[] = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<FunComment, "id">),
    }));
    comments.sort((a, b) => (a.createdAt ?? "").localeCompare(b.createdAt ?? ""));
    return comments;
  } catch (err) {
    console.error("[getComments] failed:", err);
    return [];
  }
}

export async function getLeaderboard(limit = 50): Promise<FunScore[]> {
  try {
    const snap = await adminDb.collection("funScores").get();
    const scores: FunScore[] = snap.docs.map((d) => d.data() as FunScore);
    scores.sort((a, b) => (b.totalPoints ?? 0) - (a.totalPoints ?? 0));
    return scores.slice(0, limit).map((s, i) => ({ ...s, rank: i + 1 }));
  } catch (err) {
    console.error("[getLeaderboard] failed:", err);
    return [];
  }
}

/**
 * Award points to a user for a given game type.
 * Uses a transaction so concurrent writes don't clobber each other.
 */
export async function awardPoints(opts: {
  userId: string;
  userName: string;
  gameType: GameType;
  points: number;
  correctGuess?: boolean;
}): Promise<void> {
  const ref = adminDb.doc(`funScores/${opts.userId}`);
  await adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const prev: FunScore = snap.exists
      ? (snap.data() as FunScore)
      : {
          userId: opts.userId,
          userName: opts.userName,
          totalPoints: 0,
          guessWhoPoints: 0,
          captionPoints: 0,
          quizPoints: 0,
          correctGuesses: 0,
        };

    const next: FunScore = {
      ...prev,
      userName: opts.userName || prev.userName,
      totalPoints: (prev.totalPoints ?? 0) + opts.points,
      correctGuesses: (prev.correctGuesses ?? 0) + (opts.correctGuess ? 1 : 0),
    };
    if (opts.gameType === "guess-who")
      next.guessWhoPoints = (prev.guessWhoPoints ?? 0) + opts.points;
    if (opts.gameType === "caption-this")
      next.captionPoints = (prev.captionPoints ?? 0) + opts.points;
    if (opts.gameType === "memory-quiz")
      next.quizPoints = (prev.quizPoints ?? 0) + opts.points;

    tx.set(ref, next);
  });
}
