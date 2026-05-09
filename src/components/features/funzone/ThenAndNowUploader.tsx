"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FunImageUploader } from "./FunImageUploader";

interface UploadResult {
  url: string;
  storagePath: string;
  width: number;
  height: number;
}

export function ThenAndNowUploader({ userId }: { userId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [then, setThen] = useState<UploadResult | null>(null);
  const [now, setNow] = useState<UploadResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!then || !now || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/fun-zone/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameType: "then-and-now",
          imageThen: then.url,
          imageThenStoragePath: then.storagePath,
          imageNow: now.url,
          imageNowStoragePath: now.storagePath,
          width: now.width,
          height: now.height,
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error || "Failed");
      }
      setThen(null);
      setNow(null);
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
        🎬 Share my Then & Now
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="card space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Then &amp; Now</h3>
        <button type="button" onClick={() => setOpen(false)} className="text-sm text-gray-500">
          Cancel
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FunImageUploader
          gameType="then-and-now"
          userId={userId}
          slot="then"
          label="Then (school days)"
          onUploaded={setThen}
        />
        <FunImageUploader
          gameType="then-and-now"
          userId={userId}
          slot="now"
          label="Now (recent)"
          onUploaded={setNow}
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex justify-end">
        <button type="submit" disabled={!then || !now || busy} className="btn-primary text-sm">
          {busy ? "Posting…" : "Post"}
        </button>
      </div>
    </form>
  );
}
