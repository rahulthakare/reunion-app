"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FunImageUploader } from "./FunImageUploader";

export function CaptionThisUploader({ userId }: { userId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [upload, setUpload] = useState<{
    url: string;
    storagePath: string;
    width: number;
    height: number;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!upload || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/fun-zone/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameType: "caption-this",
          imageUrl: upload.url,
          imageStoragePath: upload.storagePath,
          width: upload.width,
          height: upload.height,
          prompt: prompt.trim() || "Caption this!",
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error || "Failed");
      }
      setUpload(null);
      setPrompt("");
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="btn-primary">
        ➕ Post a photo
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="card space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Post a Caption-This photo</h3>
        <button type="button" onClick={() => setOpen(false)} className="text-sm text-gray-500">
          Cancel
        </button>
      </div>
      <FunImageUploader gameType="caption-this" userId={userId} onUploaded={setUpload} />
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Prompt (optional)</label>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. When the bell rings before lunch…"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex justify-end">
        <button type="submit" disabled={!upload || busy} className="btn-primary text-sm">
          {busy ? "Posting…" : "Post"}
        </button>
      </div>
    </form>
  );
}
