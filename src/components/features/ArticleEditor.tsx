"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase/client";
import type { Article, ArticleContentType } from "@/types/article";
import { SECTION_SUGGESTIONS } from "@/types/article";

interface ArticleEditorProps {
  initial?: Partial<Article>;
  authorUid: string;
  isEditingExisting?: boolean;
}

async function readDimensions(file: File): Promise<{ width: number; height: number }> {
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

function formatBytes(b?: number): string {
  if (!b) return "";
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(2)} MB`;
}

export function ArticleEditor({ initial, authorUid, isEditingExisting }: ArticleEditorProps) {
  const router = useRouter();
  const [contentType, setContentType] = useState<ArticleContentType>(
    initial?.contentType ?? "text"
  );
  const [title, setTitle] = useState(initial?.title ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [tagsText, setTagsText] = useState((initial?.tags ?? []).join(", "));
  const [coverUrl, setCoverUrl] = useState(initial?.coverImageUrl ?? "");
  const [coverPath, setCoverPath] = useState(initial?.coverImageStoragePath ?? "");
  const [coverProgress, setCoverProgress] = useState<number | null>(null);
  const [coverError, setCoverError] = useState<string | null>(null);

  const [pdfUrl, setPdfUrl] = useState(initial?.pdfUrl ?? "");
  const [pdfPath, setPdfPath] = useState(initial?.pdfStoragePath ?? "");
  const [pdfFilename, setPdfFilename] = useState(initial?.pdfFilename ?? "");
  const [pdfSize, setPdfSize] = useState<number>(initial?.pdfSizeBytes ?? 0);
  const [pdfProgress, setPdfProgress] = useState<number | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const [displayAuthorName, setDisplayAuthorName] = useState(
    initial?.displayAuthorName ?? ""
  );
  const [section, setSection] = useState(initial?.section ?? "");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  async function handleCover(file: File) {
    if (!file.type.startsWith("image/")) {
      setCoverError("Please choose an image file.");
      return;
    }
    setCoverError(null);
    setCoverProgress(0);
    try {
      await readDimensions(file);
      const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `articles/${authorUid}/${Date.now()}_cover_${safe}`;
      const storageRef = ref(storage, path);
      const task = uploadBytesResumable(storageRef, file, { contentType: file.type });
      await new Promise<void>((resolve, reject) => {
        task.on(
          "state_changed",
          (snap) => setCoverProgress((snap.bytesTransferred / snap.totalBytes) * 100),
          (err) => reject(err),
          () => resolve()
        );
      });
      const url = await getDownloadURL(task.snapshot.ref);
      setCoverUrl(url);
      setCoverPath(path);
      setCoverProgress(100);
    } catch (err) {
      setCoverError(err instanceof Error ? err.message : "Upload failed");
      setCoverProgress(null);
    }
  }

  async function handlePdf(file: File) {
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setPdfError("Please choose a PDF file.");
      return;
    }
    setPdfError(null);
    setPdfProgress(0);
    try {
      const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `articles/${authorUid}/${Date.now()}_${safe}`;
      const storageRef = ref(storage, path);
      const task = uploadBytesResumable(storageRef, file, { contentType: "application/pdf" });
      await new Promise<void>((resolve, reject) => {
        task.on(
          "state_changed",
          (snap) => setPdfProgress((snap.bytesTransferred / snap.totalBytes) * 100),
          (err) => reject(err),
          () => resolve()
        );
      });
      const url = await getDownloadURL(task.snapshot.ref);
      setPdfUrl(url);
      setPdfPath(path);
      setPdfFilename(file.name);
      setPdfSize(file.size);
      setPdfProgress(100);
    } catch (err) {
      setPdfError(err instanceof Error ? err.message : "Upload failed");
      setPdfProgress(null);
    }
  }

  async function submit(saveAsDraft: boolean) {
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (contentType === "text" && !body.trim()) {
      setError("Body is required for text articles.");
      return;
    }
    if (contentType === "pdf" && !pdfUrl) {
      setError("Please upload a PDF file.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const tags = tagsText
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const payload = {
        title: title.trim(),
        body: contentType === "text" ? body.trim() : "",
        contentType,
        coverImageUrl: coverUrl,
        coverImageStoragePath: coverPath,
        pdfUrl,
        pdfStoragePath: pdfPath,
        pdfFilename,
        pdfSizeBytes: pdfSize,
        displayAuthorName: displayAuthorName.trim(),
        section: section.trim(),
        tags,
        saveAsDraft,
      };
      let res: Response;
      if (isEditingExisting && initial?.id) {
        res = await fetch(`/api/articles/${initial.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/articles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      if (!res.ok) {
        const b = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(b.error || "Save failed");
      }
      router.push("/admin/articles");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Content type toggle */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Article format
        </label>
        <div className="inline-flex rounded-lg border border-gray-300 overflow-hidden">
          {(["text", "pdf"] as ArticleContentType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setContentType(type)}
              className={`px-4 py-1.5 text-sm transition-colors ${
                contentType === type
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              {type === "text" ? "✍️ Free text" : "📄 PDF upload"}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="A memorable title…"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base"
        />
      </div>

      {/* Metadata fields */}
      <fieldset className="border border-gray-200 rounded-lg p-4 space-y-3">
        <legend className="px-1 text-xs font-medium text-gray-700">
          Article details (optional)
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Display author name
            </label>
            <input
              type="text"
              value={displayAuthorName}
              onChange={(e) => setDisplayAuthorName(e.target.value)}
              placeholder='e.g. "Mrs. Joshi" (overrides yours)'
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Section
            </label>
            <input
              type="text"
              list="article-section-suggestions"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              placeholder="e.g. Editorial"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            <datalist id="article-section-suggestions">
              {SECTION_SUGGESTIONS.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>
        </div>
      </fieldset>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Cover image (optional)
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleCover(f);
          }}
          className="block w-full text-sm text-gray-600 file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
        />
        {coverProgress !== null && coverProgress < 100 && (
          <div className="h-2 mt-2 rounded-full bg-gray-100 overflow-hidden">
            <div className="h-full bg-indigo-500" style={{ width: `${coverProgress}%` }} />
          </div>
        )}
        {coverError && <p className="text-xs text-red-600 mt-1">{coverError}</p>}
        {coverUrl && (
          <div className="mt-2 relative w-full max-w-xs aspect-[3/2] overflow-hidden rounded-lg border border-gray-200">
            <Image src={coverUrl} alt="Cover preview" fill className="object-cover" />
          </div>
        )}
      </div>

      {contentType === "text" ? (
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-medium text-gray-700">
              Article (Markdown OK)
            </label>
            <button
              type="button"
              onClick={() => setShowPreview((v) => !v)}
              className="text-xs text-indigo-600 hover:underline"
            >
              {showPreview ? "Edit" : "Preview"}
            </button>
          </div>
          {showPreview ? (
            <div className="prose prose-sm max-w-none border border-gray-200 rounded-lg p-4 bg-gray-50 min-h-[260px] whitespace-pre-wrap">
              {body || (
                <span className="text-gray-400 italic">Nothing to preview yet.</span>
              )}
            </div>
          ) : (
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={14}
              placeholder="Pour your memories here…"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono"
            />
          )}
        </div>
      ) : (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            PDF file
          </label>
          <input
            type="file"
            accept="application/pdf,.pdf"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handlePdf(f);
            }}
            className="block w-full text-sm text-gray-600 file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
          {pdfProgress !== null && pdfProgress < 100 && (
            <div className="h-2 mt-2 rounded-full bg-gray-100 overflow-hidden">
              <div className="h-full bg-indigo-500" style={{ width: `${pdfProgress}%` }} />
            </div>
          )}
          {pdfError && <p className="text-xs text-red-600 mt-1">{pdfError}</p>}
          {pdfUrl && (
            <p className="text-sm text-gray-700 mt-2">
              ✓ Uploaded:{" "}
              <span className="font-mono">{pdfFilename || "document.pdf"}</span>
              {pdfSize ? (
                <span className="text-gray-500"> ({formatBytes(pdfSize)})</span>
              ) : null}{" "}
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:underline ml-1"
              >
                View →
              </a>
            </p>
          )}
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Tags (comma-separated)
        </label>
        <input
          type="text"
          value={tagsText}
          onChange={(e) => setTagsText(e.target.value)}
          placeholder="e.g. memories, school-days, sports"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex flex-wrap justify-end gap-3 pt-2 border-t border-gray-100">
        <button
          type="button"
          onClick={() => submit(true)}
          disabled={busy}
          className="btn-secondary text-sm"
        >
          {busy ? "Saving…" : "Save as draft"}
        </button>
        <button
          type="button"
          onClick={() => submit(false)}
          disabled={busy}
          className="btn-primary text-sm"
        >
          {busy ? "Saving…" : isEditingExisting ? "Save changes" : "Publish"}
        </button>
      </div>
    </div>
  );
}
