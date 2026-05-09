import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { getArticle } from "@/lib/utils/article";
import { PdfPreview } from "@/components/features/PdfPreview";

export const dynamic = "force-dynamic";

async function getCurrentUser() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session) return null;
  try {
    const decoded = await adminAuth.verifySessionCookie(session, true);
    let isAdmin = false;
    try {
      isAdmin = (await adminDb.doc(`admins/${decoded.uid}`).get()).exists;
    } catch {
      isAdmin = false;
    }
    return { uid: decoded.uid, isAdmin };
  } catch {
    return null;
  }
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await getArticle(id);
  if (!article) notFound();

  if (article.status !== "published") {
    const user = await getCurrentUser();
    if (!user) redirect(`/login?redirect=/articles/${id}`);
    if (article.authorId !== user.uid && !user.isAdmin) {
      notFound();
    }
  }

  const date = article.publishedAt ?? article.submittedAt;
  const author = article.displayAuthorName?.trim() || article.authorName;

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <Link href="/articles" className="text-sm text-indigo-600 hover:underline">
        ← All articles
      </Link>
      <article className="mt-4 space-y-5">
        {article.coverImageUrl && (
          <div className="relative w-full aspect-[16/9] overflow-hidden rounded-2xl bg-gray-100">
            <Image
              src={article.coverImageUrl}
              alt={article.title}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
            />
          </div>
        )}
        <header>
          {article.status !== "published" && (
            <span className="inline-block text-xs font-semibold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded mb-2">
              {article.status}
            </span>
          )}
          {article.section && (
            <p className="text-xs uppercase tracking-wider text-indigo-700 font-semibold mb-1">
              {article.section}
            </p>
          )}
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">{article.title}</h1>
          <p className="text-sm text-gray-500 mt-2">
            By {author}
            {date && ` · ${new Date(date).toLocaleDateString()}`}
            {article.contentType === "pdf" && (
              <span className="ml-2 text-[10px] font-bold bg-red-600 text-white px-1.5 py-0.5 rounded align-middle">
                PDF
              </span>
            )}
          </p>
          {article.tags && article.tags.length > 0 && (
            <div className="flex gap-1 flex-wrap mt-2">
              {article.tags.map((t) => (
                <span key={t} className="text-xs px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                  #{t}
                </span>
              ))}
            </div>
          )}
        </header>

        {article.contentType === "pdf" && article.pdfUrl ? (
          <PdfPreview
            url={article.pdfUrl}
            title={article.title}
            filename={article.pdfFilename}
            sizeBytes={article.pdfSizeBytes}
          />
        ) : (
          <div className="prose prose-lg max-w-none whitespace-pre-wrap text-gray-800 leading-relaxed">
            {article.body}
          </div>
        )}
      </article>
    </main>
  );
}
