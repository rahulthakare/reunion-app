"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FunImageUploader } from "./FunImageUploader";

interface GuessWhoUploaderProps {
  userId: string;
}

export function GuessWhoUploader({ userId }: GuessWhoUploaderProps) {
  const router = useRouter();
  const [hint, setHint] = useState("");
  const [options, setOptions] = useState<string[]>(["", "", "", ""]);
  const [includeOptions, setIncludeOptions] = useState(false);
  const [upload, setUpload] = useState<{
    url: string;
    storagePath: string;
    width: number;
    height: number;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  function setOption(idx: number, value: string) {
    setOptions((curr) => curr.map((o, i) => (i === idx ? value : o)));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!upload || busy) return;

    // Build clean options list
    const cleanedOptions = includeOptions
      ? options.map((o) => o.trim()).filter(Boolean)
      : [];

    if (includeOptions && cleanedOptions.length < 2) {
      setError("Please provide at least 2 options or turn off multiple choice.");
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/fun-zone/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameType: "guess-who",
          isAnonymous: true,
          imageUrl: upload.url,
          imageStoragePath: upload.storagePath,
          width: upload.width,
          height: upload.height,
          hint: hint.trim(),
          options: cleanedOptions,
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error || "Failed");
      }
      setUpload(null);
      setHint("");
      setOptions(["", "", "", ""]);
      setIncludeOptions(false);
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
        📷 Upload my mystery photo
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="card space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 heading-display">
          Upload an old photo (anonymous)
        </h3>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-sm text-gray-500"
        >
          Cancel
        </button>
      </div>
      <p className="text-xs text-gray-500">
        Your name will be hidden until you click <strong>Reveal</strong>. Pick a photo
        that&apos;s tricky to identify!
      </p>

      <FunImageUploader
        gameType="guess-who"
        userId={userId}
        label="Old school photo"
        onUploaded={(r) => setUpload(r)}
      />

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          💡 Hint (optional)
        </label>
        <input
          type="text"
          value={hint}
          onChange={(e) => setHint(e.target.value)}
          placeholder="e.g. Class of '91, sports day, sat in the back row"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
        <p className="text-xs text-gray-500 mt-1">
          A small clue to help your batchmates guess.
        </p>
      </div>

      <fieldset className="border border-gray-200 rounded-xl p-4 space-y-3">
        <legend className="px-1">
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeOptions}
              onChange={(e) => setIncludeOptions(e.target.checked)}
              className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm font-medium text-gray-800">
              🎯 Multiple choice (optional)
            </span>
          </label>
        </legend>
        {includeOptions ? (
          <>
            <p className="text-xs text-gray-500">
              Add up to 4 options. Guessers can tap an option or type freely. Make sure
              one of the options matches your reveal answer for auto-grading!
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="font-mono text-xs text-gray-400 w-5 shrink-0">
                    {String.fromCharCode(65 + i)}.
                  </span>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => setOption(i, e.target.value)}
                    placeholder={`Option ${String.fromCharCode(65 + i)}`}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
                  />
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-xs text-gray-500">
            Off — guessers will type their answer freely.
          </p>
        )}
      </fieldset>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end gap-2">
        <button type="submit" disabled={!upload || busy} className="btn-primary text-sm">
          {busy ? "Posting…" : "Post mystery photo"}
        </button>
      </div>
    </form>
  );
}
