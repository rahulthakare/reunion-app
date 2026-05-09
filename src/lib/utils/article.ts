import { adminDb } from "@/lib/firebase/admin";
import type { Article, ArticleStatus } from "@/types/article";

export async function getArticlesByStatus(status: ArticleStatus): Promise<Article[]> {
  try {
    const snap = await adminDb.collection("articles").where("status", "==", status).get();
    const list: Article[] = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Article, "id">),
    }));
    list.sort((a, b) => {
      const aT = a.publishedAt ?? a.submittedAt ?? "";
      const bT = b.publishedAt ?? b.submittedAt ?? "";
      return bT.localeCompare(aT);
    });
    return list;
  } catch (err) {
    console.error("[getArticlesByStatus] failed:", err);
    return [];
  }
}

export async function getPublishedArticles(): Promise<Article[]> {
  return getArticlesByStatus("published");
}

export async function getPendingArticles(): Promise<Article[]> {
  return getArticlesByStatus("pending");
}

export async function getArticle(id: string): Promise<Article | null> {
  try {
    const snap = await adminDb.doc(`articles/${id}`).get();
    if (!snap.exists) return null;
    return { id: snap.id, ...(snap.data() as Omit<Article, "id">) };
  } catch (err) {
    console.error("[getArticle] failed:", err);
    return null;
  }
}

export async function getMyArticles(authorId: string): Promise<Article[]> {
  try {
    const snap = await adminDb.collection("articles").where("authorId", "==", authorId).get();
    const list: Article[] = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Article, "id">),
    }));
    list.sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""));
    return list;
  } catch (err) {
    console.error("[getMyArticles] failed:", err);
    return [];
  }
}

export async function getPendingArticlesCount(): Promise<number> {
  try {
    const snap = await adminDb.collection("articles").where("status", "==", "pending").get();
    return snap.size;
  } catch {
    return 0;
  }
}
