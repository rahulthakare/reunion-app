import Link from "next/link";
import { ArticleList } from "@/components/features/ArticleList";
import { PendingArticlesTable } from "@/components/features/PendingArticlesTable";
import { getArticlesByStatus } from "@/lib/utils/article";

export const dynamic = "force-dynamic";

export default async function AdminArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const sp = await searchParams;
  const tab = (sp.tab ?? "pending") as "pending" | "published" | "rejected" | "draft";

  const [pending, published, rejected] = await Promise.all([
    getArticlesByStatus("pending"),
    getArticlesByStatus("published"),
    getArticlesByStatus("rejected"),
  ]);

  const TABS = [
    { key: "pending", label: `Pending (${pending.length})` },
    { key: "published", label: `Published (${published.length})` },
    { key: "rejected", label: `Rejected (${rejected.length})` },
  ];

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Articles Moderation</h1>
          <p className="text-gray-500 mt-1">
            Review batchmate submissions and manage published content.
          </p>
        </div>
        <Link href="/articles/new" className="btn-primary text-sm">
          ✍️ Write an article
        </Link>
      </header>

      <nav className="flex gap-2 border-b border-gray-200">
        {TABS.map((t) => {
          const isActive = tab === t.key;
          return (
            <Link
              key={t.key}
              href={`/admin/articles?tab=${t.key}`}
              className={`px-3 py-2 text-sm font-medium border-b-2 ${
                isActive
                  ? "border-indigo-600 text-indigo-700"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </nav>

      {tab === "pending" && <PendingArticlesTable articles={pending} />}
      {tab === "published" && (
        <ArticleList
          articles={published}
          showStatus
          hrefBuilder={(a) => `/admin/articles/${a.id}`}
          emptyText="No published articles yet."
        />
      )}
      {tab === "rejected" && (
        <ArticleList
          articles={rejected}
          showStatus
          hrefBuilder={(a) => `/admin/articles/${a.id}`}
          emptyText="No rejected articles."
        />
      )}
    </div>
  );
}
