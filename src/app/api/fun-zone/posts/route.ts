import { NextResponse, type NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { getSessionUser } from "../_helpers";
import type { FunPost, GameType } from "@/types/fun-zone";

const VALID_GAMES: GameType[] = ["guess-who", "caption-this", "memory-quiz", "then-and-now"];

// GET /api/fun-zone/posts?gameType=guess-who — auth required; lists posts
export async function GET(request: NextRequest) {
  const user = await getSessionUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const gameType = searchParams.get("gameType") as GameType | null;

  try {
    let query: FirebaseFirestore.Query = adminDb.collection("funPosts");
    if (gameType && VALID_GAMES.includes(gameType)) {
      query = query.where("gameType", "==", gameType);
    }
    const snap = await query.get();
    const posts: FunPost[] = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<FunPost, "id">),
    }));
    posts.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
    const sanitized = posts.map((p) =>
      p.gameType === "guess-who" && p.isAnonymous && !p.isRevealed
        ? { ...p, uploadedByName: "?? Mystery batchmate" }
        : p
    );
    return NextResponse.json({ posts: sanitized });
  } catch (err) {
    console.error("[GET /api/fun-zone/posts] failed:", err);
    return NextResponse.json({ error: "Failed to fetch posts." }, { status: 500 });
  }
}

// POST /api/fun-zone/posts — auth required; create a new game post
export async function POST(request: NextRequest) {
  const user = await getSessionUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = (await request.json()) as Partial<FunPost>;
    if (!body.gameType || !VALID_GAMES.includes(body.gameType)) {
      return NextResponse.json({ error: "Invalid gameType." }, { status: 400 });
    }

    // Game-specific validation
    if (body.gameType === "guess-who" && !body.imageUrl) {
      return NextResponse.json({ error: "imageUrl required for guess-who." }, { status: 400 });
    }
    if (body.gameType === "caption-this" && !body.imageUrl) {
      return NextResponse.json({ error: "imageUrl required for caption-this." }, { status: 400 });
    }
    if (body.gameType === "memory-quiz") {
      if (!body.question?.trim() || !body.correctAnswer?.trim()) {
        return NextResponse.json(
          { error: "question and correctAnswer required for memory-quiz." },
          { status: 400 }
        );
      }
      // Only admins can create quiz questions
      if (!user.isAdmin) {
        return NextResponse.json({ error: "Forbidden — admins only" }, { status: 403 });
      }
    }
    if (body.gameType === "then-and-now" && (!body.imageThen || !body.imageNow)) {
      return NextResponse.json(
        { error: "imageThen and imageNow required for then-and-now." },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const post: Omit<FunPost, "id"> = {
      gameType: body.gameType,
      uploadedBy: user.uid,
      uploadedByName: user.name,
      uploadedByPhotoURL: user.photoURL ?? null,
      isAnonymous:
        body.gameType === "guess-who"
          ? body.isAnonymous ?? true
          : body.isAnonymous ?? false,
      imageUrl: body.imageUrl ?? "",
      imageStoragePath: body.imageStoragePath ?? "",
      imageThen: body.imageThen ?? "",
      imageThenStoragePath: body.imageThenStoragePath ?? "",
      imageNow: body.imageNow ?? "",
      imageNowStoragePath: body.imageNowStoragePath ?? "",
      width: body.width ?? 0,
      height: body.height ?? 0,
      prompt: body.prompt?.trim() ?? "",
      question: body.question?.trim() ?? "",
      hint: body.hint?.trim() ?? "",
      correctAnswer: body.correctAnswer?.trim() ?? "",
      options: Array.isArray(body.options) ? body.options : [],
      isRevealed: body.gameType === "guess-who" ? false : true,
      createdAt: now,
      guessCount: 0,
      commentCount: 0,
      voteCount: 0,
    };
    const ref = await adminDb.collection("funPosts").add(post);
    return NextResponse.json({ id: ref.id, status: "ok" }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/fun-zone/posts] failed:", err);
    return NextResponse.json({ error: "Failed to create post." }, { status: 500 });
  }
}
