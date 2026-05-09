import { NextResponse, type NextRequest } from "next/server";
import { adminDb, getAdminApp } from "@/lib/firebase/admin";
import { getStorage } from "firebase-admin/storage";
import { getArticleSessionUser } from "../_helpers";
import { deriveExcerpt } from "@/types/article";
import type { Article, ArticleContentType } from "@/types/article";

const VALID_CONTENT_TYPES: ArticleContentType[] = ["text", "pdf"];

// GET /api/articles/:id — public for published; owner+admin for others
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const snap = await adminDb.doc(`articles/${id}`).get();
    if (!snap.exists) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const article = { id: snap.id, ...(snap.data() as Omit<Article, "id">) };

    if (article.status !== "published") {
      const user = await getArticleSessionUser(request);
      if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      if (article.authorId !== user.uid && !user.isAdmin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }
    return NextResponse.json({ article });
  } catch (err) {
    console.error("[GET /api/articles/:id] failed:", err);
    return NextResponse.json({ error: "Failed to fetch article." }, { status: 500 });
  }
}

// PATCH /api/articles/:id — admin only
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getArticleSessionUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!user.isAdmin) {
    return NextResponse.json({ error: "Only admins can edit articles." }, { status: 403 });
  }
  const { id } = await params;

  try {
    const ref = adminDb.doc(`articles/${id}`);
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = (await request.json()) as Partial<Article>;
    const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() };

    if (typeof body.title === "string") updates.title = body.title.trim();
    if (typeof body.body === "string") {
      updates.body = body.body.trim();
      updates.excerpt = body.excerpt?.trim() || deriveExcerpt(body.body);
    } else if (typeof body.excerpt === "string") {
      updates.excerpt = body.excerpt.trim();
    }
    if (typeof body.coverImageUrl === "string") updates.coverImageUrl = body.coverImageUrl;
    if (typeof body.coverImageStoragePath === "string") {
      updates.coverImageStoragePath = body.coverImageStoragePath;
    }
    if (body.contentType && VALID_CONTENT_TYPES.includes(body.contentType)) {
      updates.contentType = body.contentType;
    }
    if (typeof body.pdfUrl === "string") updates.pdfUrl = body.pdfUrl;
    if (typeof body.pdfStoragePath === "string") updates.pdfStoragePath = body.pdfStoragePath;
    if (typeof body.pdfFilename === "string") updates.pdfFilename = body.pdfFilename;
    if (typeof body.pdfSizeBytes === "number") updates.pdfSizeBytes = body.pdfSizeBytes;
    if (typeof body.displayAuthorName === "string") {
      updates.displayAuthorName = body.displayAuthorName.trim();
    }
    if (typeof body.section === "string") updates.section = body.section.trim();
    if (Array.isArray(body.tags)) {
      updates.tags = body.tags.map((t) => String(t).trim()).filter(Boolean);
    }

    await ref.update(updates);
    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error("[PATCH /api/articles/:id] failed:", err);
    return NextResponse.json({ error: "Failed to update article." }, { status: 500 });
  }
}

// DELETE /api/articles/:id — admin only; cleans up cover image + PDF
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getArticleSessionUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!user.isAdmin) {
    return NextResponse.json({ error: "Only admins can delete articles." }, { status: 403 });
  }
  const { id } = await params;

  try {
    const ref = adminDb.doc(`articles/${id}`);
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const article = snap.data() as Article;

    const paths = [article.coverImageStoragePath, article.pdfStoragePath].filter(
      Boolean
    ) as string[];
    if (paths.length > 0) {
      try {
        const bucket = getStorage(getAdminApp()).bucket();
        await Promise.all(paths.map((p) => bucket.file(p).delete({ ignoreNotFound: true })));
      } catch (err) {
        console.warn("[DELETE article] storage cleanup warning:", err);
      }
    }
    await ref.delete();
    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error("[DELETE /api/articles/:id] failed:", err);
    return NextResponse.json({ error: "Failed to delete article." }, { status: 500 });
  }
}
