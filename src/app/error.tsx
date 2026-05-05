"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Something went wrong!</h1>
        <p className="text-gray-600 mb-8">{error.message}</p>
        <button
          onClick={reset}
          className="rounded-lg bg-black text-white px-6 py-3 hover:bg-gray-800 transition-colors"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
