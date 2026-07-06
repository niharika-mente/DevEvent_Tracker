"use client";

import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { POSTHOG_EVENTS } from "@/lib/posthog/events";
import { captureEvent } from "@/lib/posthog/helpers";

const MODES = ["All", "Online", "Offline", "Hybrid"];
const POPULAR_TAGS = ["All", "Hackathon", "Meetup", "Web3", "React", "DevOps", "AI"];

const SORT_OPTIONS = [
  { label: "Newest First", value: "" },
  { label: "Date (Earliest First)", value: "date_asc" },
  { label: "Date (Latest First)", value: "date_desc" },
  { label: "Popularity (Most Booked)", value: "popularity" },
  { label: "Name (A–Z)", value: "name_asc" },
  { label: "Name (Z–A)", value: "name_desc" },
];

export default function SearchFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("query") || "");

  const handleFilterChange = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "All") params.set(key, value);
    else params.delete(key);
    if (key !== "page") params.delete("page");

    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
    captureEvent(POSTHOG_EVENTS.EVENT_FILTER_CHANGED, { filter: key, value });
  }, [pathname, router, searchParams]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (search === (searchParams.get("query") || "")) return;
      handleFilterChange("query", search);
      if (search.trim()) captureEvent(POSTHOG_EVENTS.EVENT_SEARCHED, { query: search });
    }, 400);
    return () => window.clearTimeout(timer);
  }, [handleFilterChange, search, searchParams]);

  const selectClass =
    "rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <div className="mx-auto my-6 w-full max-w-6xl space-y-4 px-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <label htmlFor="event-search-input" className="sr-only">Search events</label>
        <input
          id="event-search-input"
          type="search"
          placeholder="Search events by title, description or tags..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-4 text-foreground shadow-sm transition placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="flex flex-col justify-between gap-4 pt-1 md:flex-row md:items-center">
        <div className="flex shrink-0 items-center gap-2">
          <label htmlFor="event-mode-filter" className="text-sm font-medium text-muted-foreground">Mode:</label>
          <select
            id="event-mode-filter"
            value={searchParams.get("mode") || "All"}
            onChange={(event) => handleFilterChange("mode", event.target.value)}
            className={selectClass}
          >
            {MODES.map((mode) => <option key={mode} value={mode}>{mode}</option>)}
          </select>
        </div>

        <div className="flex max-w-full items-center gap-2 overflow-x-auto">
          <span className="shrink-0 text-sm font-medium text-muted-foreground">Tags:</span>
          <div className="flex flex-wrap gap-1.5">
            {POPULAR_TAGS.map((tag) => {
              const isActive = (searchParams.get("tag") || "All") === tag;
              return (
                <button
                  type="button"
                  key={tag}
                  onClick={() => handleFilterChange("tag", tag)}
                  aria-pressed={isActive}
                  className={`cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition ${
                    isActive
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground hover:border-primary hover:text-primary"
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <label htmlFor="event-sort-select" className="whitespace-nowrap text-sm font-medium text-muted-foreground">Sort by:</label>
          <select
            id="event-sort-select"
            value={searchParams.get("sortBy") || ""}
            onChange={(event) => handleFilterChange("sortBy", event.target.value)}
            className={`${selectClass} min-w-[185px]`}
          >
            {SORT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}
