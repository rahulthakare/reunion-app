"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import type { FunComment, FunPost } from "@/types/fun-zone";
import { CommentThread } from "./CommentThread";

interface CaptionThisCardProps {
  post: FunPost;
  comments: FunComment[];
  currentUserId: string;
  isAdmin: boolean;
}

export function CaptionThisCard({ post, comments, currentUserId, isAdmin }: CaptionThisCardProps) {
  const router = useRouter();
  const isOwner = post.uploadedBy === currentUserId;

  async function deletePost() {
    if (!confirm("Delete this post?")) return;
    await fetch(`/api/fun-zone/posts/${post.id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <article className="card space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-gray-900">
            {post.prompt || "Caption this!"}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Posted by {post.uploadedByName} ·{" "}
            {new Date(post.createdAt).toLocaleString()}
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

      {post.imageUrl && (
        <div className="relative w-full max-w-md mx-auto">
          <Image
            src={post.imageUrl}
            alt={post.prompt || "Caption this"}
            width={post.width || 800}
            height={post.height || 600}
            className="rounded-lg w-full h-auto"
          />
        </div>
      )}

      <CommentThread
        postId={post.id}
        gameType="caption-this"
        initialComments={comments}
        currentUserId={currentUserId}
        isAdmin={isAdmin}
        enableVoting
        placeholder="Your funniest caption…"
      />
    </article>
  );
}
