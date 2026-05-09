"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import type { FunComment, FunPost } from "@/types/fun-zone";
import { CommentThread } from "./CommentThread";

type ReactionType = "best-glow-up" | "most-changed" | "same-same";

const REACTIONS: { key: ReactionType; emoji: string; label: string }[] = [
  { key: "best-glow-up", emoji: "✨", label: "Best glow-up" },
  { key: "most-changed", emoji: "😲", label: "Most changed" },
  { key: "same-same", emoji: "👯", label: "Looks the same" },
];

interface ThenAndNowCardProps {
  post: FunPost;
  comments: FunComment[];
  currentUserId: string;
  isAdmin: boolean;
}

export function ThenAndNowCard({ post, comments, currentUserId, isAdmin }: ThenAndNowCardProps) {
  const router = useRouter();
  const isOwner = post.uploadedBy === currentUserId;

  async function react(voteType: ReactionType) {
    await fetch(`/api/fun-zone/posts/${post.id}/votes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ voteType }),
    });
    router.refresh();
  }

  async function deletePost() {
    if (!confirm("Delete this post?")) return;
    await fetch(`/api/fun-zone/posts/${post.id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <article className="card space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-gray-900">🎬 {post.uploadedByName}</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {new Date(post.createdAt).toLocaleString()} · {post.voteCount} reactions
          </p>
        </div>
        {(isOwner || isAdmin) && (
          <button
            type="button"
            onClick={deletePost}
            className="text-xs text-red-500 hover:text-red-700"
          >
            Delete
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {post.imageThen && (
          <figure>
            <Image
              src={post.imageThen}
              alt="Then"
              width={post.width || 600}
              height={post.height || 600}
              className="rounded-lg w-full h-auto"
            />
            <figcaption className="text-center text-xs font-semibold mt-1 text-gray-600">THEN</figcaption>
          </figure>
        )}
        {post.imageNow && (
          <figure>
            <Image
              src={post.imageNow}
              alt="Now"
              width={post.width || 600}
              height={post.height || 600}
              className="rounded-lg w-full h-auto"
            />
            <figcaption className="text-center text-xs font-semibold mt-1 text-gray-600">NOW</figcaption>
          </figure>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        {REACTIONS.map((r) => (
          <button
            key={r.key}
            type="button"
            onClick={() => react(r.key)}
            className="text-sm px-3 py-1.5 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-800"
          >
            {r.emoji} {r.label}
          </button>
        ))}
      </div>

      <CommentThread
        postId={post.id}
        gameType="then-and-now"
        initialComments={comments}
        currentUserId={currentUserId}
        isAdmin={isAdmin}
        placeholder="Leave a comment…"
      />
    </article>
  );
}
