import Link from "next/link";
import Image from "next/image";
import type { Article } from "@/types/article";

interface ArticleCardProps {
  article: Article;
  href?: string;
  showStatus?: boolean;
}

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-gray-100 text-gray-700" },
  pending: { label: "Pending review", className: "bg-amber-100 text-amber-800" },
  published: { label: "Published", className: "bg-green-100 text-green-700" },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-700" },
};

export function ArticleCard({ article, href, showStatus }: ArticleCardProps) {
  const link = href ?? `/articles/${article.id}`;
  const badge = STATUS_BADGE[article.status];
  const date = article.publishedAt ?? article.submittedAt ?? article.updatedAt;
  const author = article.displayAuthorName?.trim() || article.authorName;
  const isPdf = article.contentType === "pdf";
  return (
    <Link
      href={link}
      className="card flex flex-col gap-3 hover:border-indigo-200 transition-colors"
    >
      {article.coverImageUrl ? (
        <div className="relative w-full aspect-[16/9] overflow-hidden rounded-lg bg-gray-100">
          <Image
            src={article.coverImageUrl}
            alt={article.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
          {isPdf && (
            <span className="absolute top-2 right-2 text-[10px] font-bold bg-red-600 text-white px-1.5 py-0.5 rounded">
              PDF
            </span>
          )}
        </div>
      ) : (
        <div className="relative w-full aspect-[16/9] rounded-lg bg-gradient-to-br from-indigo-50 to-amber-50 flex items-center justify-center text-4xl">
          {isPdf ? "📄" : "📰"}
          {isPdf && (
            <span className="absolute top-2 right-2 text-[10px] font-bold bg-red-600 text-white px-1.5 py-0.5 rounded">
              PDF
            </span>
          )}
        </div>
      )}
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-gray-900 line-clamp-2">{article.title}</h3>
          {showStatus && badge && (
            <span
              className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${badge.className}`}
            >
              {badge.label}
            </span>
          )}
        </div>
        {article.section && (
          <span className="inline-block text-[10px] uppercase tracking-wider text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
            {article.section}
          </span>
        )}
        {article.excerpt && !isPdf && (
          <p className="text-sm text-gray-600 line-clamp-3">{article.excerpt}</p>
        )}
        {isPdf && (
          <p className="text-sm text-gray-500 italic">📄 PDF document</p>
        )}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
          <span>By {author}</span>
          <span>{date ? new Date(date).toLocaleDateString() : ""}</span>
        </div>
        {article.tags && article.tags.length > 0 && (
          <div className="flex gap-1 flex-wrap pt-1">
            {article.tags.slice(0, 4).map((t) => (
              <span
                key={t}
                className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700"
              >
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
