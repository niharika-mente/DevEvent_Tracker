"use client";

import { useEffect } from "react";
import Link from "next/link";
import { captureException } from "@/lib/posthog/helpers";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
    captureException(error, { digest: error.digest });
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white px-4 text-center">
      <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
        Something went wrong
      </h1>
      <p className="text-gray-400 mb-6">
        An unexpected error occurred. Please try again.
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 transition"
        >
          Try again
        </button>
        <Link
          href="/"
          className="px-6 py-3 rounded-lg border border-gray-600 hover:bg-gray-800 transition"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
