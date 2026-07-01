"use client";

import { useMemo, useSyncExternalStore } from "react";

const BOOKMARKS_KEY = "bookmarkedEvents";
const BOOKMARKS_EVENT = "devevent-bookmarks-changed";

function subscribe(callback: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === BOOKMARKS_KEY) callback();
  };
  window.addEventListener("storage", handleStorage);
  window.addEventListener(BOOKMARKS_EVENT, callback);
  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(BOOKMARKS_EVENT, callback);
  };
}

function getSnapshot() {
  return localStorage.getItem(BOOKMARKS_KEY) || "[]";
}

export function useBookmarks(): string[] {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, () => "[]");
  return useMemo(() => {
    try {
      const value: unknown = JSON.parse(snapshot);
      return Array.isArray(value)
        ? value.filter((item): item is string => typeof item === "string")
        : [];
    } catch {
      return [];
    }
  }, [snapshot]);
}

export function saveBookmarks(bookmarks: string[]) {
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
  window.dispatchEvent(new Event(BOOKMARKS_EVENT));
}
