"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function MemoryQuizCreator() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [options, setOptions] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim() || !answer.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const opts = options
        .split("\n")
        .map((o) => o.trim())
        .filter(Boolean);
      const res = await fetch("/api/fun-zone/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameType: "memory-quiz",
          question: question.trim(),
          correctAnswer: answer.trim(),
          options: opts,
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error || "Failed");
      }
      setQuestion("");
      setAnswer("");
      setOptions("");
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
        ➕ Add Question (admin)
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="card space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Add a quiz question</h3>
        <button type="button" onClick={() => setOpen(false)} className="text-sm text-gray-500">
          Cancel
        </button>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Question</label>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Who was our class teacher in 8th grade?"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Correct answer</label>
        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Mrs. Joshi"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
        <p className="text-xs text-gray-500 mt-1">Auto-graded — case-insensitive substring match.</p>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Options (optional, one per line)
        </label>
        <textarea
          value={options}
          onChange={(e) => setOptions(e.target.value)}
          rows={4}
          placeholder="Mrs. Joshi&#10;Mr. Patil&#10;Mrs. Kelkar&#10;Mr. Deshmukh"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex justify-end">
        <button type="submit" disabled={busy} className="btn-primary text-sm">
          {busy ? "Adding…" : "Add question"}
        </button>
      </div>
    </form>
  );
}
