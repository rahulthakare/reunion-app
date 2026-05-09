"use client";

import { useRouter } from "next/navigation";
import type { FunComment, FunPost } from "@/types/fun-zone";
import { CommentThread } from "./CommentThread";

interface MemoryQuizCardProps {
  post: FunPost;
  comments: FunComment[];
  currentUserId: string;
  isAdmin: boolean;
}

export function MemoryQuizCard({ post, comments, currentUserId, isAdmin }: MemoryQuizCardProps) {
  const router = useRouter();

  async function deletePost() {
    if (!confirm("Delete this quiz question?")) return;
    await fetch(`/api/fun-zone/posts/${post.id}`, { method: "DELETE" });
    router.refresh();
  }

  const correctAnswers = comments.filter((c) => c.isCorrect);
  const userAlreadyCorrect = correctAnswers.some((c) => c.userId === currentUserId);

  return (
    <article className="card space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-lg">💭 {post.question}</h3>
          {post.options && post.options.length > 0 && (
            <ul className="mt-2 text-sm text-gray-700 space-y-1">
              {post.options.map((opt, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="font-mono text-xs text-gray-400">
                    {String.fromCharCode(65 + i)}.
                  </span>
                  {opt}
                </li>
              ))}
            </ul>
          )}
          <p className="text-xs text-gray-400 mt-1">
            Posted by {post.uploadedByName} · {correctAnswers.length} correct
          </p>
        </div>
        {isAdmin && (
          <button
            type="button"
            onClick={deletePost}
            className="text-xs text-red-500 hover:text-red-700"
          >
            Delete
          </button>
        )}
      </div>

      {userAlreadyCorrect && (
        <div className="rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-800">
          ✓ You answered correctly!
        </div>
      )}

      <CommentThread
        postId={post.id}
        gameType="memory-quiz"
        initialComments={comments}
        currentUserId={currentUserId}
        isAdmin={isAdmin}
      />
    </article>
  );
}
