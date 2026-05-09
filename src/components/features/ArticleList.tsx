import type { Article } from "@/types/article";
import { ArticleCard } from "./ArticleCard";

interface ArticleListProps {
  articles: Article[];
  emptyText?: string;
  showStatus?: boolean;
  hrefBuilder?: (article: Article) => string;
}

export function ArticleList({
  articles,
  emptyText = "No articles yet.",
  showStatus,
  hrefBuilder,
}: ArticleListProps) {
  if (articles.length === 0) {
    return (
      <div className="text-center py-16 bg-gray-50 rounded-2xl">
        <div className="text-5xl mb-3">📰</div>
        <p className="text-lg font-medium text-gray-700">{emptyText}</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {articles.map((a) => (
        <ArticleCard
          key={a.id}
          article={a}
          showStatus={showStatus}
          href={hrefBuilder ? hrefBuilder(a) : undefined}
        />
      ))}
    </div>
  );
}
