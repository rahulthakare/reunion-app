"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Photo, PhotoCategory } from "@/types/photo";

interface AdminPhotoListProps {
  photos: Photo[];
  categories: PhotoCategory[];
}

export function AdminPhotoList({ photos, categories }: AdminPhotoListProps) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function deletePhoto(p: Photo) {
    if (!confirm(`Delete "${p.caption || p.alt}"? This cannot be undone.`)) return;
    setBusyId(p.id);
    try {
      const res = await fetch(`/api/photos/${p.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      router.refresh();
    } catch (err) {
      alert(`Failed to delete: ${err instanceof Error ? err.message : err}`);
    } finally {
      setBusyId(null);
    }
  }

  async function moveToCategory(p: Photo, categoryId: string | null) {
    setBusyId(p.id);
    try {
      const res = await fetch(`/api/photos/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId }),
      });
      if (!res.ok) throw new Error("Failed");
      router.refresh();
    } catch (err) {
      alert(`Failed to move: ${err instanceof Error ? err.message : err}`);
    } finally {
      setBusyId(null);
    }
  }

  if (photos.length === 0) {
    return (
      <div className="card text-center py-12">
        <div className="text-4xl mb-2">📭</div>
        <p className="text-gray-500">No photos uploaded yet.</p>
        <p className="text-xs text-gray-400 mt-1">Use the form above to add the first one.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {photos.map((p) => (
        <div key={p.id} className="card p-3 space-y-2">
          <div className="relative aspect-square overflow-hidden rounded-md bg-gray-100">
            <Image
              src={p.url}
              alt={p.alt}
              fill
              sizes="(max-width: 640px) 50vw, 25vw"
              className="object-cover"
            />
          </div>
          {p.caption && <p className="text-xs text-gray-700 truncate">{p.caption}</p>}
          <select
            value={p.categoryId ?? ""}
            onChange={(e) => moveToCategory(p, e.target.value || null)}
            disabled={busyId === p.id}
            className="w-full text-xs rounded border border-gray-300 px-2 py-1"
          >
            <option value="">Uncategorized</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon ? `${c.icon} ` : ""}{c.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => deletePhoto(p)}
            disabled={busyId === p.id}
            className="w-full text-xs text-red-600 hover:text-red-700 border border-red-200 rounded px-2 py-1"
          >
            {busyId === p.id ? "Working…" : "Delete"}
          </button>
        </div>
      ))}
    </div>
  );
}
