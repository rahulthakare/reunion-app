import { NextResponse, type NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { getArticleSessionUser } from "../_helpers";
import type { Article } from "@/types/article";

// GET /api/articles/mine — auth; returns user's articles regardless of status
export async function GET(request: NextRequest) {
  const user = await getArticleSessionUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const snap = await adminDb
      .collection("articles")
      .where("authorId", "==", user.uid)
      .get();
    const articles: Article[] = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Article, "id">),
    }));
    articles.sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""));
    return NextResponse.json({ articles });
  } catch (err) {
    console.error("[GET /api/articles/mine] failed:", err);
    return NextResponse.json({ error: "Failed to fetch your articles." }, { status: 500 });
  }
}
