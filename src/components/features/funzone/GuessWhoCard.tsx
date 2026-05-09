"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FunComment, FunPost } from "@/types/fun-zone";
import { CommentThread } from "./CommentThread";
import { Confetti } from "@/components/ui/Confetti";

interface GuessWhoCardProps {
  post: FunPost;
  comments: FunComment[];
  currentUserId: string;
  isAdmin: boolean;
}

export function GuessWhoCard({ post, comments, currentUserId, isAdmin }: GuessWhoCardProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [revealName, setRevealName] = useState("");
  const [celebrate, setCelebrate] = useState(false);
  const isOwner = post.uploadedBy === currentUserId;
  const hasOptions = Array.isArray(post.options) && post.options.length > 0;

  async function reveal() {
    if (!revealName.trim() && !confirm("Reveal as yourself? (You can also enter a different display name.)")) return;
    setBusy(true);
    try {
      await fetch(`/api/fun-zone/posts/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reveal: true, correctAnswer: revealName.trim() || undefined }),
      });
      setCelebrate(true);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function deletePost() {
    if (!confirm("Delete this mystery photo?")) return;
    await fetch(`/api/fun-zone/posts/${post.id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <article className="card space-y-4">
      <Confetti trigger={celebrate} />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900 heading-display text-lg">
            {post.isRevealed
              ? `🎉 It was ${post.correctAnswer || post.uploadedByName}!`
              : "🕵️ Who is this?"}
          </h3>
          {post.hint && (
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1 mt-1.5 inline-block">
              💡 <strong>Hint:</strong> {post.hint}
            </p>
          )}
          <p className="text-xs text-gray-400 mt-1">
            {new Date(post.createdAt).toLocaleString()} · {post.guessCount} guesses
            {hasOptions && ` · ${post.options!.length} options`}
          </p>
        </div>
        {(isOwner || isAdmin) && (
          <button
            type="button"
            onClick={deletePost}
            className="text-xs text-red-500 hover:text-red-700 shrink-0"
          >
            Delete
          </button>
        )}
      </div>

      {post.imageUrl && (
        <div className="relative w-full max-w-md mx-auto">
          <Image
            src={post.imageUrl}
            alt={post.isRevealed ? `${post.correctAnswer}` : "Mystery batchmate"}
            width={post.width || 800}
            height={post.height || 600}
            className="rounded-lg w-full h-auto"
          />
        </div>
      )}

      {isOwner && !post.isRevealed && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 space-y-2">
          <p className="text-xs text-amber-800">
            Ready to reveal? Type the correct answer (your name) — guesses will be auto-graded.
            {hasOptions && (
              <>
                {" "}
                <strong>Tip:</strong> match one of your options exactly so quick-pickers get credit.
              </>
            )}
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={revealName}
              onChange={(e) => setRevealName(e.target.value)}
              placeholder="Your name (e.g. Rajesh Sharma)"
              className="flex-1 rounded-lg border border-amber-300 px-3 py-1.5 text-sm"
            />
            <button
              type="button"
              onClick={reveal}
              disabled={busy}
              className="btn-primary text-sm"
            >
              {busy ? "Revealing…" : "Reveal"}
            </button>
          </div>
        </div>
      )}

      <CommentThread
        postId={post.id}
        gameType="guess-who"
        initialComments={comments}
        isRevealed={post.isRevealed}
        currentUserId={currentUserId}
        isAdmin={isAdmin}
        quickOptions={hasOptions ? post.options : undefined}
        autoSubmitOptions
      />
    </article>
  );
}
