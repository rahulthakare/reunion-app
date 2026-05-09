"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { FunComment, GameType } from "@/types/fun-zone";

interface CommentThreadProps {
  postId: string;
  gameType: GameType;
  initialComments: FunComment[];
  isRevealed?: boolean;
  currentUserId: string;
  isAdmin?: boolean;
  /** Render "Vote" buttons for caption-this */
  enableVoting?: boolean;
  placeholder?: string;
  /**
   * Quick-pick options shown above the input. Clicking one fills the input
   * (or auto-submits if `autoSubmitOptions` is true).
   */
  quickOptions?: string[];
  autoSubmitOptions?: boolean;
}

export function CommentThread({
  postId,
  gameType,
  initialComments,
  isRevealed,
  currentUserId,
  isAdmin,
  enableVoting,
  placeholder,
  quickOptions,
  autoSubmitOptions,
}: CommentThreadProps) {
  const router = useRouter();
  const [comments, setComments] = useState<FunComment[]>(initialComments);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setComments(initialComments), [initialComments]);

  async function postComment(value: string) {
    const trimmed = value.trim();
    if (!trimmed || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/fun-zone/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error || "Failed to post");
      }
      setText("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    postComment(text);
  }

  function pickOption(value: string) {
    if (autoSubmitOptions) {
      postComment(value);
    } else {
      setText(value);
    }
  }

  async function deleteComment(c: FunComment) {
    if (!confirm("Delete this comment?")) return;
    await fetch(`/api/fun-zone/posts/${postId}/comments/${c.id}`, { method: "DELETE" });
    router.refresh();
  }

  async function vote(commentId: string) {
    await fetch(`/api/fun-zone/posts/${postId}/votes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commentId, voteType: "upvote" }),
    });
    router.refresh();
  }

  const sorted = enableVoting
    ? [...comments].sort((a, b) => (b.votes ?? 0) - (a.votes ?? 0))
    : comments;

  // Track which option this user has already picked (visual indicator)
  const myGuesses = new Set(
    comments
      .filter((c) => c.userId === currentUserId)
      .map((c) => c.text.trim().toLowerCase())
  );

  const inputLabel =
    placeholder ??
    (gameType === "guess-who"
      ? "Your guess… (e.g. Rajesh)"
      : gameType === "caption-this"
      ? "Your funniest caption…"
      : gameType === "memory-quiz"
      ? "Your answer…"
      : "Add a comment…");

  return (
    <div className="space-y-3">
      {quickOptions && quickOptions.length > 0 && !isRevealed && (
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            🎯 Quick guess
          </p>
          <div className="flex flex-wrap gap-2">
            {quickOptions.map((opt, i) => {
              const picked = myGuesses.has(opt.trim().toLowerCase());
              return (
                <button
                  key={`${opt}-${i}`}
                  type="button"
                  onClick={() => pickOption(opt)}
                  disabled={busy || picked}
                  className={`text-sm px-3 py-1.5 rounded-full border transition-all ${
                    picked
                      ? "bg-brand-100 border-brand-300 text-brand-800 cursor-default"
                      : "bg-white hover:bg-brand-50 border-gray-300 hover:border-brand-400 text-gray-800 hover:-translate-y-0.5"
                  }`}
                >
                  <span className="font-mono text-xs text-gray-400 mr-1">
                    {String.fromCharCode(65 + i)}.
                  </span>
                  {opt}
                  {picked && <span className="ml-1.5 text-xs">✓</span>}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-gray-400">Or type your own guess below 👇</p>
        </div>
      )}

      <form onSubmit={submit} className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={inputLabel}
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
        <button type="submit" disabled={busy || !text.trim()} className="btn-primary text-sm">
          {busy ? "…" : "Post"}
        </button>
      </form>
      {error && <p className="text-xs text-red-600">{error}</p>}

      {sorted.length === 0 ? (
        <p className="text-sm text-gray-500 italic">Be the first to chime in!</p>
      ) : (
        <ul className="space-y-2">
          {sorted.map((c) => (
            <li
              key={c.id}
              className={`p-3 rounded-lg border ${
                c.isCorrect
                  ? "border-green-300 bg-green-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm text-gray-900">{c.userName}</span>
                    {c.isCorrect && isRevealed && (
                      <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full">
                        ✓ Correct!
                      </span>
                    )}
                    <span className="text-xs text-gray-400">
                      {new Date(c.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-800 mt-0.5 break-words">{c.text}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {enableVoting && (
                    <button
                      type="button"
                      onClick={() => vote(c.id)}
                      className="text-xs px-2 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800"
                    >
                      ⬆ {c.votes}
                    </button>
                  )}
                  {(c.userId === currentUserId || isAdmin) && (
                    <button
                      type="button"
                      onClick={() => deleteComment(c)}
                      className="text-xs text-red-500 hover:text-red-700"
                      aria-label="Delete comment"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
