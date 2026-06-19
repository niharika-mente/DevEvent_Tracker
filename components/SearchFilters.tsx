'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

const MODES = ['All', 'Online', 'Offline', 'Hybrid'];
const POPULAR_TAGS = ['All', 'Hackathon', 'Meetup', 'Web3', 'React', 'DevOps', 'AI'];

const SORT_OPTIONS = [
  { label: 'Newest First', value: '' },
  { label: 'Date (Earliest First)', value: 'date_asc' },
  { label: 'Date (Latest First)', value: 'date_desc' },
  { label: 'Popularity (Most Booked)', value: 'popularity' },
  { label: 'Name (A–Z)', value: 'name_asc' },
  { label: 'Name (Z–A)', value: 'name_desc' },
];

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
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleFilterChange('query', search);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const selectClass =
    'px-3 py-1.5 rounded-lg border border-[var(--color-border-dark)] bg-[var(--color-dark-200)] text-[var(--color-light-100)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-blue)] transition cursor-pointer';

  return (
    <div className="w-full max-w-6xl mx-auto my-6 px-4 space-y-4">
      {/* Search input */}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-light-200)] text-sm pointer-events-none">
          🔍
        </span>
        <input
          id="event-search-input"
          type="text"
          placeholder="Search events by title, description or tags..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--color-border-dark)] bg-[var(--color-dark-200)] text-[var(--color-light-100)] placeholder:text-[var(--color-light-200)] focus:outline-none focus:ring-1 focus:ring-[var(--color-blue)] shadow-sm transition"
        />
      </div>

      {/* Filter row */}
      <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between pt-1">

        {/* Mode filter */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-sm font-medium text-[var(--color-light-200)]">Mode:</span>
          <select
            id="event-mode-filter"
            value={searchParams.get('mode') || 'All'}
            onChange={(e) => handleFilterChange('mode', e.target.value)}
            className={selectClass}
          >
            {MODES.map((mode) => (
              <option key={mode} value={mode}>{mode}</option>
            ))}
          </select>
        </div>

        {/* Tag pills */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-full">
          <span className="text-sm font-medium text-[var(--color-light-200)] shrink-0">Tags:</span>
          <div className="flex gap-1.5 flex-wrap">
            {POPULAR_TAGS.map((tag) => {
              const isActive = (searchParams.get('tag') || 'All') === tag;
              return (
                <button
                  key={tag}
                  id={`tag-filter-${tag.toLowerCase()}`}
                  onClick={() => handleFilterChange('tag', tag)}
                  className={`px-3 py-1 text-xs font-medium rounded-full border transition cursor-pointer ${
                    isActive
                      ? 'bg-[var(--primary)] text-black border-[var(--primary)]'
                      : 'bg-[var(--color-dark-100)] text-[var(--color-light-100)] border-[var(--color-border-dark)] hover:border-[var(--color-blue)] hover:text-[var(--color-blue)]'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sort dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <label
            htmlFor="event-sort-select"
            className="text-sm font-medium text-[var(--color-light-200)] whitespace-nowrap"
          >
            Sort by:
          </label>
          <select
            id="event-sort-select"
            value={searchParams.get('sortBy') || ''}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className={`${selectClass} min-w-[185px]`}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
