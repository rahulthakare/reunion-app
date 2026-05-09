"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Article } from "@/types/article";

interface AdminArticleActionsProps {
  article: Article;
}

export function AdminArticleActions({ article }: AdminArticleActionsProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function approve() {
    setBusy(true);
    try {
      const res = await fetch(`/api/articles/${article.id}/approve`, { method: "POST" });
      if (!res.ok) throw new Error("Failed");
      router.refresh();
    } catch (err) {
      alert(`Approve failed: ${err instanceof Error ? err.message : err}`);
    } finally {
      setBusy(false);
    }
  }

  async function reject() {
    const reason = prompt("Optional reason for rejection (visible to author):") ?? "";
    setBusy(true);
    try {
      const res = await fetch(`/api/articles/${article.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) throw new Error("Failed");
      router.refresh();
    } catch (err) {
      alert(`Reject failed: ${err instanceof Error ? err.message : err}`);
    } finally {
      setBusy(false);
    }
  }

  async function destroy() {
    if (!confirm(`Delete "${article.title}" permanently?`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/articles/${article.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      router.push("/admin/articles");
      router.refresh();
    } catch (err) {
      alert(`Delete failed: ${err instanceof Error ? err.message : err}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {article.status !== "published" && (
        <button
          type="button"
          onClick={approve}
          disabled={busy}
          className="text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg"
        >
          ✓ Approve &amp; publish
        </button>
      )}
      {article.status !== "rejected" && (
        <button
          type="button"
          onClick={reject}
          disabled={busy}
          className="text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg"
        >
          ✗ Reject
        </button>
      )}
      <button
        type="button"
        onClick={destroy}
        disabled={busy}
        className="text-sm border border-red-300 text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg"
      >
        Delete
      </button>
    </div>
  );
}
