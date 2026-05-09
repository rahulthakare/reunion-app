import { NextResponse, type NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { getArticleSessionUser } from "./_helpers";
import { deriveExcerpt } from "@/types/article";
import type { Article, ArticleContentType, ArticleStatus } from "@/types/article";

const VALID_STATUSES: ArticleStatus[] = ["draft", "pending", "published", "rejected"];
const VALID_CONTENT_TYPES: ArticleContentType[] = ["text", "pdf"];

// GET /api/articles?status=published — public for "published"; admin for other statuses
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = (searchParams.get("status") ?? "published") as ArticleStatus;
  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  if (status !== "published") {
    const user = await getArticleSessionUser(request);
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  try {
    const snap = await adminDb.collection("articles").where("status", "==", status).get();
    const articles: Article[] = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Article, "id">),
    }));
    articles.sort((a, b) => {
      const aT = a.publishedAt ?? a.submittedAt ?? "";
      const bT = b.publishedAt ?? b.submittedAt ?? "";
      return bT.localeCompare(aT);
    });
    return NextResponse.json({ articles, count: articles.length });
  } catch (err) {
    console.error("[GET /api/articles] failed:", err);
    return NextResponse.json({ error: "Failed to fetch articles." }, { status: 500 });
  }
}

// POST /api/articles — admin only; create article (text or PDF)
//   Articles created by an admin are auto-published.
export async function POST(request: NextRequest) {
  const user = await getArticleSessionUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!user.isAdmin) {
    return NextResponse.json(
      { error: "Only admins can create articles." },
      { status: 403 }
    );
  }

  try {
    const body = (await request.json()) as Partial<Article> & { saveAsDraft?: boolean };
    const title = body.title?.trim();
    if (!title) {
      return NextResponse.json({ error: "Title is required." }, { status: 400 });
    }

    const contentType: ArticleContentType =
      body.contentType && VALID_CONTENT_TYPES.includes(body.contentType)
        ? body.contentType
        : "text";

    if (contentType === "text") {
      if (!body.body?.trim()) {
        return NextResponse.json(
          { error: "Body is required for text articles." },
          { status: 400 }
        );
      }
    } else if (contentType === "pdf") {
      if (!body.pdfUrl) {
        return NextResponse.json(
          { error: "PDF file is required for PDF articles." },
          { status: 400 }
        );
      }
    }

    const now = new Date().toISOString();
    const status: ArticleStatus = body.saveAsDraft ? "draft" : "published";

    const article: Omit<Article, "id"> = {
      title,
      body: body.body?.trim() ?? "",
      excerpt:
        body.excerpt?.trim() ||
        (body.body ? deriveExcerpt(body.body) : ""),
      coverImageUrl: body.coverImageUrl ?? "",
      coverImageStoragePath: body.coverImageStoragePath ?? "",
      contentType,
      pdfUrl: body.pdfUrl ?? "",
      pdfStoragePath: body.pdfStoragePath ?? "",
      pdfFilename: body.pdfFilename ?? "",
      pdfSizeBytes: typeof body.pdfSizeBytes === "number" ? body.pdfSizeBytes : 0,
      authorId: user.uid,
      authorName: user.name,
      authorPhotoURL: user.photoURL ?? null,
      displayAuthorName: body.displayAuthorName?.trim() ?? "",
      section: body.section?.trim() ?? "",
      status,
      submittedAt: now,
      updatedAt: now,
      publishedAt: status === "published" ? now : undefined,
      reviewedAt: status === "published" ? now : undefined,
      reviewedBy: status === "published" ? user.uid : undefined,
      tags: Array.isArray(body.tags)
        ? body.tags.map((t) => String(t).trim()).filter(Boolean)
        : [],
    };

    const cleaned = Object.fromEntries(
      Object.entries(article).filter(([, v]) => v !== undefined)
    );

    const ref = await adminDb.collection("articles").add(cleaned);
    return NextResponse.json({ id: ref.id, status, articleStatus: status }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/articles] failed:", err);
    return NextResponse.json({ error: "Failed to create article." }, { status: 500 });
  }
}
