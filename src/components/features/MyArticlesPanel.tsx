"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Article } from "@/types/article";

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-gray-100 text-gray-700" },
  pending: { label: "Pending review", className: "bg-amber-100 text-amber-800" },
  published: { label: "Published", className: "bg-green-100 text-green-700" },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-700" },
};

interface MyArticlesPanelProps {
  articles: Article[];
}

export function MyArticlesPanel({ articles }: MyArticlesPanelProps) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function deleteArticle(a: Article) {
    if (!confirm(`Delete "${a.title}"? This cannot be undone.`)) return;
    setBusyId(a.id);
    try {
      const res = await fetch(`/api/articles/${a.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      router.refresh();
    } catch (err) {
      alert(`Delete failed: ${err instanceof Error ? err.message : err}`);
    } finally {
      setBusyId(null);
    }
  }

  if (articles.length === 0) {
    return (
      <div className="card text-center py-10">
        <div className="text-4xl mb-2">✍️</div>
        <p className="text-gray-600">You haven&apos;t written any articles yet.</p>
        <Link href="/articles/new" className="inline-block mt-3 btn-primary text-sm">
          Write your first article
        </Link>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {articles.map((a) => {
        const badge = STATUS_BADGE[a.status];
        const canEdit = a.status !== "published";
        return (
          <li key={a.id} className="card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  href={a.status === "published" ? `/articles/${a.id}` : `/articles/${a.id}/edit`}
                  className="font-semibold text-gray-900 hover:text-indigo-600 truncate"
                >
                  {a.title}
                </Link>
                {badge && (
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badge.className}`}>
                    {badge.label}
                  </span>
                )}
              </div>
              {a.status === "rejected" && a.rejectionReason && (
                <p className="text-xs text-red-700 mt-1">
                  <strong>Reason:</strong> {a.rejectionReason}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Updated {new Date(a.updatedAt).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {canEdit && (
                <Link href={`/articles/${a.id}/edit`} className="text-xs text-indigo-600 hover:underline">
                  Edit
                </Link>
              )}
              {a.status === "published" && (
                <Link href={`/articles/${a.id}`} className="text-xs text-indigo-600 hover:underline">
                  View
                </Link>
              )}
              <button
                type="button"
                onClick={() => deleteArticle(a)}
                disabled={busyId === a.id}
                className="text-xs text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
