"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PhotoCategory } from "@/types/photo";

interface CategoryManagerProps {
  categories: PhotoCategory[];
}

const DEFAULT_CATEGORIES = [
  { name: "School Days", icon: "🏫" },
  { name: "Reunion Day", icon: "🎉" },
  { name: "Get-Togethers", icon: "🍽️" },
  { name: "Family", icon: "👨‍👩‍👧" },
  { name: "Throwback", icon: "📜" },
];

export function CategoryManager({ categories }: CategoryManagerProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("📷");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createCategory(payload: { name: string; icon?: string }) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error || "Failed to create");
      }
      router.refresh();
      setName("");
      setIcon("📷");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error creating category");
    } finally {
      setBusy(false);
    }
  }

  async function seedDefaults() {
    if (!confirm("Add the default reunion categories? Existing categories won't be removed.")) return;
    setBusy(true);
    setError(null);
    try {
      for (const c of DEFAULT_CATEGORIES) {
        if (categories.some((existing) => existing.name === c.name)) continue;
        await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(c),
        });
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error seeding defaults");
    } finally {
      setBusy(false);
    }
  }

  async function rename(cat: PhotoCategory) {
    const newName = prompt("Rename category:", cat.name);
    if (!newName || newName.trim() === cat.name) return;
    await fetch(`/api/categories/${cat.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });
    router.refresh();
  }

  async function changeIcon(cat: PhotoCategory) {
    const newIcon = prompt("New icon (emoji):", cat.icon ?? "📷");
    if (!newIcon) return;
    await fetch(`/api/categories/${cat.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ icon: newIcon.trim() }),
    });
    router.refresh();
  }

  async function remove(cat: PhotoCategory) {
    const confirmed = confirm(
      `Delete "${cat.name}"? Photos in this category will be moved to Uncategorized.`
    );
    if (!confirmed) return;
    await fetch(`/api/categories/${cat.id}?mode=move`, { method: "DELETE" });
    router.refresh();
  }

  async function reorder(cat: PhotoCategory, direction: -1 | 1) {
    const sorted = [...categories].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const idx = sorted.findIndex((c) => c.id === cat.id);
    const swapIdx = idx + direction;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const other = sorted[swapIdx];
    await Promise.all([
      fetch(`/api/categories/${cat.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: other.order ?? 0 }),
      }),
      fetch(`/api/categories/${other.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: cat.order ?? 0 }),
      }),
    ]);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          createCategory({ name: name.trim(), icon: icon.trim() });
        }}
        className="card flex flex-wrap items-end gap-3"
      >
        <div className="w-20">
          <label className="block text-xs font-medium text-gray-700 mb-1">Icon</label>
          <input
            type="text"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-center text-lg"
          />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-gray-700 mb-1">Category name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Annual Day"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <button type="submit" disabled={busy || !name.trim()} className="btn-primary text-sm">
          {busy ? "Adding…" : "Add Category"}
        </button>
        {categories.length === 0 && (
          <button
            type="button"
            onClick={seedDefaults}
            disabled={busy}
            className="btn-secondary text-sm"
          >
            Seed defaults
          </button>
        )}
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="space-y-2">
        {categories.length === 0 ? (
          <p className="text-sm text-gray-500 italic">
            No categories yet. Add some above or seed defaults to get started.
          </p>
        ) : (
          categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between gap-3 p-3 border border-gray-200 rounded-lg bg-white"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-2xl">{cat.icon || "📷"}</span>
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 truncate">{cat.name}</p>
                  <p className="text-xs text-gray-500 truncate">/{cat.slug}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => reorder(cat, -1)}
                  className="p-1 text-gray-500 hover:text-gray-900"
                  aria-label="Move up"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => reorder(cat, 1)}
                  className="p-1 text-gray-500 hover:text-gray-900"
                  aria-label="Move down"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => changeIcon(cat)}
                  className="text-xs text-gray-600 hover:text-indigo-600 px-2"
                >
                  Icon
                </button>
                <button
                  type="button"
                  onClick={() => rename(cat)}
                  className="text-xs text-gray-600 hover:text-indigo-600 px-2"
                >
                  Rename
                </button>
                <button
                  type="button"
                  onClick={() => remove(cat)}
                  className="text-xs text-red-600 hover:text-red-700 px-2"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
