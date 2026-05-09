"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase/client";
import type { PhotoCategory } from "@/types/photo";

interface PhotoUploadFormProps {
  categories: PhotoCategory[];
}

interface QueuedFile {
  file: File;
  preview: string;
  caption: string;
  alt: string;
  width: number;
  height: number;
  progress: number;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
}

async function readImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };
    img.src = url;
  });
}

export function PhotoUploadForm({ categories }: PhotoUploadFormProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const [categoryId, setCategoryId] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const next: QueuedFile[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      try {
        const dims = await readImageDimensions(file);
        next.push({
          file,
          preview: URL.createObjectURL(file),
          caption: "",
          alt: file.name.replace(/\.[^/.]+$/, ""),
          width: dims.width,
          height: dims.height,
          progress: 0,
          status: "pending",
        });
      } catch (err) {
        console.warn("Failed to read image dimensions:", err);
      }
    }
    setQueue((q) => [...q, ...next]);
  }

  function removeQueued(idx: number) {
    setQueue((q) => {
      const copy = [...q];
      const [removed] = copy.splice(idx, 1);
      if (removed) URL.revokeObjectURL(removed.preview);
      return copy;
    });
  }

  function updateQueued(idx: number, patch: Partial<QueuedFile>) {
    setQueue((q) => q.map((item, i) => (i === idx ? { ...item, ...patch } : item)));
  }

  async function uploadOne(item: QueuedFile, idx: number, slug: string | null) {
    const safeName = item.file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storagePath = `gallery/${slug ?? "uncategorized"}/${Date.now()}_${safeName}`;
    const storageRef = ref(storage, storagePath);
    updateQueued(idx, { status: "uploading", progress: 0 });

    return new Promise<void>((resolve) => {
      const task = uploadBytesResumable(storageRef, item.file, {
        contentType: item.file.type,
      });
      task.on(
        "state_changed",
        (snap) => {
          const progress = (snap.bytesTransferred / snap.totalBytes) * 100;
          updateQueued(idx, { progress });
        },
        (err) => {
          updateQueued(idx, { status: "error", error: err.message });
          resolve();
        },
        async () => {
          try {
            const url = await getDownloadURL(task.snapshot.ref);
            const res = await fetch("/api/photos", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                url,
                storagePath,
                alt: item.alt,
                caption: item.caption,
                width: item.width,
                height: item.height,
                categoryId: categoryId || null,
              }),
            });
            if (!res.ok) {
              const body = (await res.json().catch(() => ({}))) as { error?: string };
              throw new Error(body.error || "Save failed");
            }
            updateQueued(idx, { status: "done", progress: 100 });
          } catch (err) {
            updateQueued(idx, {
              status: "error",
              error: err instanceof Error ? err.message : "Upload failed",
            });
          } finally {
            resolve();
          }
        }
      );
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (queue.length === 0 || submitting) return;
    setSubmitting(true);
    const selectedCategory = categories.find((c) => c.id === categoryId);
    const slug = selectedCategory?.slug ?? null;

    // Upload sequentially to keep UX predictable & avoid hammering Storage
    for (let i = 0; i < queue.length; i++) {
      if (queue[i].status === "done") continue;
      await uploadOne(queue[i], i, slug);
    }

    setSubmitting(false);
    // Refresh server data and clear successful items
    router.refresh();
    setQueue((q) => q.filter((item) => item.status !== "done"));
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">— Uncategorized —</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon ? `${cat.icon} ` : ""}{cat.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-gray-700 mb-1">Choose image(s)</label>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleFiles(e.target.files)}
            className="block w-full text-sm text-gray-600 file:mr-3 file:px-4 file:py-2 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
        </div>
      </div>

      {queue.length > 0 && (
        <div className="space-y-3">
          {queue.map((item, idx) => (
            <div
              key={idx}
              className="flex gap-3 items-start border border-gray-200 rounded-lg p-3"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.preview}
                alt={item.alt}
                className="w-24 h-24 object-cover rounded-md bg-gray-100"
              />
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={item.alt}
                  onChange={(e) => updateQueued(idx, { alt: e.target.value })}
                  placeholder="Alt text (for accessibility)"
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
                />
                <input
                  type="text"
                  value={item.caption}
                  onChange={(e) => updateQueued(idx, { caption: e.target.value })}
                  placeholder="Caption (optional)"
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
                />
                <div className="col-span-full text-xs text-gray-500 flex items-center justify-between">
                  <span>
                    {item.width}×{item.height} · {(item.file.size / 1024).toFixed(0)} KB
                  </span>
                  <button
                    type="button"
                    onClick={() => removeQueued(idx)}
                    className="text-red-600 hover:text-red-700 text-xs"
                  >
                    Remove
                  </button>
                </div>
                {item.status !== "pending" && (
                  <div className="col-span-full">
                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className={`h-full ${
                          item.status === "error"
                            ? "bg-red-500"
                            : item.status === "done"
                            ? "bg-green-500"
                            : "bg-indigo-500"
                        }`}
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                    <p className="text-xs mt-1 text-gray-500">
                      {item.status === "uploading" && `Uploading… ${Math.round(item.progress)}%`}
                      {item.status === "done" && "✓ Uploaded"}
                      {item.status === "error" && `✗ ${item.error}`}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          disabled={submitting || queue.length === 0}
          onClick={() => {
            queue.forEach((q) => URL.revokeObjectURL(q.preview));
            setQueue([]);
          }}
          className="btn-secondary text-sm"
        >
          Clear
        </button>
        <button
          type="submit"
          disabled={submitting || queue.length === 0}
          className="btn-primary text-sm"
        >
          {submitting ? "Uploading…" : `Upload ${queue.length} photo${queue.length === 1 ? "" : "s"}`}
        </button>
      </div>
    </form>
  );
}
