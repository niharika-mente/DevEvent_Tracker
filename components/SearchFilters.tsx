'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

const MODES = ['All', 'Online', 'Offline', 'Hybrid'];
const POPULAR_TAGS = ['All', 'Hackathons', 'Meetups', 'Web3', 'React', 'DevOps', 'AI'];

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
    const delayDebounceFn = setTimeout(() => {
      handleFilterChange('query', search);
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
        className="w-full px-4 py-3 rounded-xl border border-cyan-500/20 bg-[#111827]/80 text-white placeholder:text-gray-400 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
      />
      <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-300">Mode:</span>
          <select
            value={searchParams.get('mode') || 'All'}
            onChange={(e) => handleFilterChange('mode', e.target.value)}
            className="px-3 py-2 rounded-lg border border-cyan-500/20 bg-[#111827] text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
          >
            {MODES.map((mode) => (
              <option key={mode} value={mode}>{mode}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto max-w-full">
          <span className="text-sm font-medium text-gray-300 shrink-0">Tags:</span>
          <div className="flex gap-1.5">
            {POPULAR_TAGS.map((tag) => {
              const isActive = (searchParams.get('tag') || 'All') === tag;
              return (
                <button
                  key={tag}
                  onClick={() => handleFilterChange('tag', tag)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all duration-200 ${isActive
                      ? 'bg-cyan-500 text-black border-cyan-500'
                      : 'bg-[#111827]/80 text-gray-300 border-cyan-500/20 hover:bg-cyan-500/10'
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
