'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { captureEvent } from '@/lib/posthog/helpers';
import { POSTHOG_EVENTS } from '@/lib/posthog/events';

const MODES = ['All', 'Online', 'Offline', 'Hybrid'];
const POPULAR_TAGS = ['All', 'Hackathon', 'Meetup', 'Web3', 'React', 'DevOps', 'AI'];

export default function SearchFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('query') || '');

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'All') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    captureEvent(POSTHOG_EVENTS.EVENT_FILTER_CHANGED, { filter: key, value });
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      handleFilterChange('query', search);
      if (search.trim()) {
        captureEvent(POSTHOG_EVENTS.EVENT_SEARCHED, { query: search });
      }
    }, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  return (
    <div className="w-full max-w-6xl mx-auto my-6 px-4 space-y-4">
      <input
        type="text"
        placeholder="Search events by title, description or tags..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition"
      />
      <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-500">Mode:</span>
          <select
            value={searchParams.get('mode') || 'All'}
            onChange={(e) => handleFilterChange('mode', e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white dark:bg-gray-900 text-sm focus:outline-none"
          >
            {MODES.map((mode) => (
              <option key={mode} value={mode}>{mode}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto max-w-full">
          <span className="text-sm font-medium text-gray-500 shrink-0">Tags:</span>
          <div className="flex gap-1.5">
            {POPULAR_TAGS.map((tag) => {
              const isActive = (searchParams.get('tag') || 'All') === tag;
              return (
                <button
                  key={tag}
                  onClick={() => handleFilterChange('tag', tag)}
                  className={`px-3 py-1 text-xs font-medium rounded-full border transition ${
                    isActive ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-600'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
