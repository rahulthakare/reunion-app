"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { PendingApproval } from "@/types/pending-approval";

export function PendingApprovalsTable({ initial }: { initial: PendingApproval[] }) {
  const [items, setItems] = useState(initial);
  const [actionUid, setActionUid] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function approve(uid: string) {
    setError(null);
    setActionUid(uid);
    try {
      const res = await fetch(`/api/admin/pending-approvals/${uid}/approve`, {
        method: "POST",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `${res.status}`);
      }
      setItems((curr) => curr.filter((i) => i.uid !== uid));
      startTransition(() => router.refresh());
    } catch (err) {
      setError(`Approve failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setActionUid(null);
    }
  }

  async function reject(uid: string, email: string) {
    if (!confirm(`Reject signup from ${email}?\n\nTheir Firebase Auth account will remain, but they won't have access. They can re-attempt sign-up later.`)) {
      return;
    }
    setError(null);
    setActionUid(uid);
    try {
      const res = await fetch(`/api/admin/pending-approvals/${uid}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `${res.status}`);
      }
      setItems((curr) => curr.filter((i) => i.uid !== uid));
      startTransition(() => router.refresh());
    } catch (err) {
      setError(`Reject failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setActionUid(null);
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <div className="text-4xl mb-3">✅</div>
        <p className="text-sm">No pending approvals — you&apos;re all caught up!</p>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-gray-200 text-gray-500">
              <th className="py-3 pr-4 font-medium">Name</th>
              <th className="py-3 pr-4 font-medium">Email</th>
              <th className="py-3 pr-4 font-medium">Provider</th>
              <th className="py-3 pr-4 font-medium">Requested</th>
              <th className="py-3 pr-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.uid} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 pr-4">
                  {item.firstName || item.lastName ? (
                    <span className="font-medium text-gray-900">
                      {item.firstName} {item.lastName}
                    </span>
                  ) : (
                    <span className="text-gray-400 italic">—</span>
                  )}
                </td>
                <td className="py-3 pr-4 text-gray-700">{item.email}</td>
                <td className="py-3 pr-4 text-gray-500 text-xs">
                  {item.provider === "google.com"
                    ? "🔵 Google"
                    : item.provider === "password"
                    ? "📧 Email/Password"
                    : item.provider}
                </td>
                <td className="py-3 pr-4 text-gray-500 text-xs">
                  {new Date(item.requestedAt).toLocaleString()}
                </td>
                <td className="py-3 pr-4 text-right whitespace-nowrap">
                  <button
                    onClick={() => approve(item.uid)}
                    disabled={actionUid === item.uid || isPending}
                    className="text-xs bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1.5 rounded-lg mr-2 transition-colors disabled:opacity-50"
                  >
                    {actionUid === item.uid ? "…" : "✓ Approve"}
                  </button>
                  <button
                    onClick={() => reject(item.uid, item.email)}
                    disabled={actionUid === item.uid || isPending}
                    className="text-xs bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                  >
                    ✗ Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-400 mt-4">
        💡 Approve creates a contact entry with the user&apos;s email + name. You can fully edit it
        in the <a href="/admin/directory" className="text-indigo-600 hover:underline">Directory</a> afterward.
      </p>
    </div>
  );
}
