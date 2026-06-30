"use client";

import { BookmarkX } from "lucide-react";
import Link from "next/link";
import { saveBookmarks, useBookmarks } from "@/lib/use-bookmarks";

export default function WatchlistPage() {
  const bookmarks = useBookmarks();

  const removeBookmark = (slug: string) => {
    saveBookmarks(bookmarks.filter((item) => item !== slug));
  };

  return (
    <section className="mx-auto min-h-[65vh] w-full max-w-5xl py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">My Watchlist</h1>
        <p className="mt-2 text-muted-foreground">Events you saved for later.</p>
      </div>

      {bookmarks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/60 p-12 text-center">
          <BookmarkX className="mx-auto mb-4 size-9 text-muted-foreground" aria-hidden="true" />
          <h2 className="text-lg font-semibold">No saved events yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">Bookmark an event and it will appear here.</p>
          <Link href="/events" className="mt-5 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90">
            Explore Events
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {bookmarks.map((slug) => (
            <li key={slug} className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm">
              <Link href={`/events/${slug}`} className="font-medium capitalize hover:text-primary hover:underline">
                {slug.replaceAll("-", " ")}
              </Link>
              <button type="button" onClick={() => removeBookmark(slug)} className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-950/70">
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
