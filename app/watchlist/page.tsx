"use client";
import { useState } from "react";

export default function WatchlistPage() {
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];

    return JSON.parse(
      localStorage.getItem("bookmarkedEvents") || "[]"
    );
  });

  const removeBookmark = (slug: string) => {
    const updated = bookmarks.filter((item) => item !== slug);

    setBookmarks(updated);

    localStorage.setItem(
      "bookmarkedEvents",
      JSON.stringify(updated)
    );
  };

  return (
    <main className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">
        My Watchlist
      </h1>

      {bookmarks.length === 0 ? (
        <p>No bookmarked events yet.</p>
      ) : (
        <div className="space-y-4">
          {bookmarks.map((slug) => (
            <div
              key={slug}
              className="border rounded-lg p-4 flex justify-between items-center"
            >
              <span>{slug}</span>

              <button
                onClick={() => removeBookmark(slug)}
                className="px-3 py-1 bg-red-500 text-white rounded"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}