"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Committee } from "@/types/committee";
import { slugify } from "@/types/committee";

interface CommitteeFormProps {
  committee?: Committee;
}

const ICON_SUGGESTIONS = ["🎉", "🍽️", "🎭", "📸", "💐", "💰", "📢", "🚌", "🙏", "📜", "🎤", "🪔", "📋", "🏆", "👥"];

export function CommitteeForm({ committee }: CommitteeFormProps) {
  const router = useRouter();
  const isEdit = !!committee;
  const [name, setName] = useState(committee?.name ?? "");
  const [slug, setSlug] = useState(committee?.slug ?? "");
  const [icon, setIcon] = useState(committee?.icon ?? "👥");
  const [description, setDescription] = useState(committee?.description ?? "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setErr("Name is required.");
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      const finalSlug = slug.trim() || slugify(name);
      const url = isEdit ? `/api/committees/${committee!.id}` : "/api/committees";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, slug: finalSlug, icon, description }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to save committee.");
      }
      const data = await res.json();
      const id = isEdit ? committee!.id : data.id;
      router.push(`/admin/committees/${id}/edit`);
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to save.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-5 max-w-2xl">
      <h2 className="text-xl font-bold text-gray-900">
        {isEdit ? "Edit Committee" : "Create Committee"}
      </h2>
      {err && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg px-3 py-2 text-sm">
          ⚠️ {err}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (!isEdit && !slug) setSlug(slugify(e.target.value));
          }}
          required
          maxLength={80}
          className="input-field"
          placeholder="e.g. Welcome Committee"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">URL slug</label>
        <input
          type="text"
          value={slug}
          onChange={(e) => setSlug(slugify(e.target.value))}
          className="input-field"
          placeholder="welcome"
        />
        <p className="text-xs text-gray-500 mt-1">
          Used in the URL: <code>/committees/{slug || "your-slug"}</code>
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
        <div className="flex flex-wrap gap-2">
          {ICON_SUGGESTIONS.map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIcon(i)}
              className={`text-2xl w-11 h-11 rounded-xl border transition-all ${
                icon === i
                  ? "bg-orange-50 border-orange-400 ring-2 ring-orange-200"
                  : "border-gray-200 hover:border-orange-200 hover:bg-orange-50"
              }`}
              title={i}
            >
              {i}
            </button>
          ))}
          <input
            type="text"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            maxLength={4}
            className="w-20 input-field text-center text-xl"
            placeholder="Custom"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          maxLength={300}
          className="input-field"
          placeholder="What does this committee do?"
        />
        <p className="text-xs text-gray-500 mt-1">{description.length}/300</p>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={busy} className="btn-primary">
          {busy ? "Saving…" : isEdit ? "Save changes" : "Create committee"}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
}
