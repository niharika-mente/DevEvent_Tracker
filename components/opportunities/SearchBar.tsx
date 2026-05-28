'use client';

import { Search, X, RefreshCw } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onRefresh?: () => void;
  loading?: boolean;
  placeholder?: string;
  accentColor?: string;
}

export default function SearchBar({
  value,
  onChange,
  onRefresh,
  loading = false,
  placeholder = 'Search opportunities, companies, skills...',
  accentColor = '#5dfeca',
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: Ctrl+K / Cmd+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div
      className="flex items-center gap-3 rounded-2xl px-4 py-3 transition-all"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: `1px solid rgba(255,255,255,0.1)`,
        backdropFilter: 'blur(12px)',
      }}
      onFocusCapture={(e) => {
        (e.currentTarget as HTMLDivElement).style.border = `1px solid ${accentColor}40`;
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 20px ${accentColor}15`;
      }}
      onBlurCapture={(e) => {
        (e.currentTarget as HTMLDivElement).style.border = '1px solid rgba(255,255,255,0.1)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
      }}
    >
      <Search size={18} className="text-gray-400 shrink-0" />

      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-white placeholder-gray-500 text-sm focus:outline-none"
        id="opportunity-search"
      />

      <div className="flex items-center gap-2">
        {value && (
          <button
            onClick={() => onChange('')}
            className="text-gray-500 hover:text-white transition-colors"
            title="Clear search"
          >
            <X size={15} />
          </button>
        )}

        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={loading}
            className="text-gray-500 hover:text-white transition-colors disabled:opacity-40"
            title="Refresh"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        )}

        <kbd className="hidden sm:flex items-center gap-0.5 text-gray-600 text-xs px-1.5 py-0.5 rounded border border-white/10">
          ⌘K
        </kbd>
      </div>
    </div>
  );
}
