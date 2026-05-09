import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticle } from "@/lib/utils/article";
import { AdminArticleActions } from "@/components/features/AdminArticleActions";
import { PdfPreview } from "@/components/features/PdfPreview";

export const dynamic = "force-dynamic";

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-gray-100 text-gray-700" },
  pending: { label: "Pending review", className: "bg-amber-100 text-amber-800" },
  published: { label: "Published", className: "bg-green-100 text-green-700" },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-700" },
};

export default async function AdminArticleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await getArticle(id);
  if (!article) notFound();
  const badge = STATUS_BADGE[article.status];
  const date = article.publishedAt ?? article.submittedAt;
  const author = article.displayAuthorName?.trim() || article.authorName;

  return (
    <div className="space-y-6 max-w-3xl">
      <Link href="/admin/articles" className="text-sm text-indigo-600 hover:underline">
        ← Back to articles
      </Link>

      <div className="card space-y-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            {article.section && (
              <p className="text-xs uppercase tracking-wider text-indigo-700 font-semibold mb-1">
                {article.section}
              </p>
            )}
            <h1 className="text-2xl font-bold text-gray-900">{article.title}</h1>
            <p className="text-sm text-gray-500 mt-1">
              By {author}
              {date && ` · ${new Date(date).toLocaleString()}`}
              {article.contentType === "pdf" && (
                <span className="ml-2 text-[10px] font-bold bg-red-600 text-white px-1.5 py-0.5 rounded align-middle">
                  PDF
                </span>
              )}
            </p>
          </div>
          {badge && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badge.className}`}>
              {badge.label}
            </span>
          )}
        </div>

        {article.status === "rejected" && article.rejectionReason && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            <strong>Rejection reason:</strong> {article.rejectionReason}
          </div>
        )}

        <AdminArticleActions article={article} />

        <div className="flex gap-3 text-sm">
          <Link
            href={`/articles/${article.id}/edit`}
            className="text-indigo-600 hover:underline"
          >
            Edit content →
          </Link>
          {article.status === "published" && (
            <Link
              href={`/articles/${article.id}`}
              className="text-indigo-600 hover:underline"
            >
              View public page →
            </Link>
          )}
        </div>
      </div>

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

      {article.tags && article.tags.length > 0 && (
        <div className="flex gap-1 flex-wrap">
          {article.tags.map((t) => (
            <span key={t} className="text-xs px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
              #{t}
            </span>
          ))}
        </div>
      )}

      {article.contentType === "pdf" && article.pdfUrl ? (
        <PdfPreview
          url={article.pdfUrl}
          title={article.title}
          filename={article.pdfFilename}
          sizeBytes={article.pdfSizeBytes}
        />
      ) : (
        <article className="prose prose-lg max-w-none whitespace-pre-wrap text-gray-800 leading-relaxed">
          {article.body}
        </article>
      )}
    </div>
  );
}
