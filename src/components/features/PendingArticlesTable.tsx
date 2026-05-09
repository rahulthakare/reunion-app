"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Article } from "@/types/article";

interface PendingArticlesTableProps {
  articles: Article[];
}

export function PendingArticlesTable({ articles }: PendingArticlesTableProps) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function approve(a: Article) {
    setBusyId(a.id);
    try {
      const res = await fetch(`/api/articles/${a.id}/approve`, { method: "POST" });
      if (!res.ok) throw new Error("Failed");
      router.refresh();
    } catch (err) {
      alert(`Approve failed: ${err instanceof Error ? err.message : err}`);
    } finally {
      setBusyId(null);
    }
  }

  async function reject(a: Article) {
    const reason = prompt(`Reject "${a.title}"? Optionally provide a reason for the author:`);
    if (reason === null) return;
    setBusyId(a.id);
    try {
      const res = await fetch(`/api/articles/${a.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) throw new Error("Failed");
      router.refresh();
    } catch (err) {
      alert(`Reject failed: ${err instanceof Error ? err.message : err}`);
    } finally {
      setBusyId(null);
    }
  }

  if (articles.length === 0) {
    return (
      <div className="card text-center py-10">
        <div className="text-4xl mb-2">✅</div>
        <p className="text-gray-600">No articles awaiting review. You&apos;re all caught up!</p>
      </div>
    );
  }

  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-xs uppercase text-gray-500">
          <tr>
            <th className="text-left py-2 px-2">Title</th>
            <th className="text-left py-2 px-2 hidden sm:table-cell">Author</th>
            <th className="text-left py-2 px-2 hidden md:table-cell">Submitted</th>
            <th className="text-right py-2 px-2">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {articles.map((a) => (
            <tr key={a.id}>
              <td className="py-2 px-2">
                <Link href={`/admin/articles/${a.id}`} className="font-medium text-indigo-700 hover:underline">
                  {a.title}
                </Link>
                {a.excerpt && (
                  <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{a.excerpt}</p>
                )}
              </td>
              <td className="py-2 px-2 hidden sm:table-cell text-gray-700">{a.authorName}</td>
              <td className="py-2 px-2 hidden md:table-cell text-gray-500 text-xs">
                {new Date(a.submittedAt).toLocaleString()}
              </td>
              <td className="py-2 px-2 text-right space-x-2 whitespace-nowrap">
                <Link
                  href={`/admin/articles/${a.id}`}
                  className="text-xs text-gray-600 hover:text-indigo-600"
                >
                  View
                </Link>
                <button
                  type="button"
                  onClick={() => approve(a)}
                  disabled={busyId === a.id}
                  className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded"
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => reject(a)}
                  disabled={busyId === a.id}
                  className="text-xs bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded"
                >
                  Reject
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
