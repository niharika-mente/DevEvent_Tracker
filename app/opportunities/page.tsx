'use client';

import { useEffect, useState, useCallback } from 'react';
import { Trophy, GraduationCap, Briefcase, Filter, X, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import SearchBar from '@/components/opportunities/SearchBar';
import OpportunityCard from '@/components/opportunities/OpportunityCard';
import SkeletonCard from '@/components/opportunities/SkeletonCard';
import FeaturedCarousel from '@/components/opportunities/FeaturedCarousel';
import TrendingSection from '@/components/opportunities/TrendingSection';
import RecommendationSection from '@/components/opportunities/RecommendationSection';

type Tab = 'all' | 'hackathon' | 'internship' | 'job';

const TABS: { key: Tab; label: string; icon: React.ElementType; color: string }[] = [
  { key: 'all', label: 'All', icon: Briefcase, color: '#5dfeca' },
  { key: 'hackathon', label: 'Hackathons', icon: Trophy, color: '#5dfeca' },
  { key: 'internship', label: 'Internships', icon: GraduationCap, color: '#fb923c' },
  { key: 'job', label: 'Jobs', icon: Briefcase, color: '#a78bfa' },
];

const SORT_OPTIONS = [
  { value: 'latest', label: 'Latest First' },
  { value: 'deadline', label: 'Deadline Soon' },
  { value: 'trending', label: 'Trending' },
  { value: 'popular', label: 'Most Applied' },
];

export default function OpportunitiesPage() {
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [featured, setFeatured] = useState<any[]>([]);
  const [trending, setTrending] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  // Reset page on tab change
  useEffect(() => { setPage(1); }, [activeTab, remoteOnly, sortBy]);

  // Fetch featured + trending once
  useEffect(() => {
    Promise.all([
      fetch('/api/featured').then(r => r.json()).catch(() => ({ opportunities: [] })),
      fetch('/api/trending').then(r => r.json()).catch(() => ({ opportunities: [] })),
    ]).then(([f, t]) => {
      setFeatured(f.opportunities || []);
      setTrending(t.opportunities || []);
    });
  }, []);

  // Fetch opportunities
  const fetchOpportunities = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams({
        page: String(page), limit: '12', sortBy,
        ...(activeTab !== 'all' && { type: activeTab }),
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(remoteOnly && { remote: 'true' }),
      });
      const res = await fetch(`/api/opportunities?${params}`);
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setOpportunities(data.opportunities || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch {
      setError('Failed to load opportunities. Try refreshing.');
    } finally {
      setLoading(false);
    }
  }, [activeTab, debouncedSearch, sortBy, remoteOnly, page]);

  useEffect(() => { fetchOpportunities(); }, [fetchOpportunities]);

  const activeTabCfg = TABS.find(t => t.key === activeTab) || TABS[0];

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      {/* ─── Hero ─── */}
      <div className="relative py-14 px-5 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at 50% 0%, ${activeTabCfg.color}15 0%, transparent 60%)` }} />
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-5 text-xs font-semibold uppercase tracking-wider"
            style={{ background: `${activeTabCfg.color}15`, border: `1px solid ${activeTabCfg.color}30`, color: activeTabCfg.color }}>
            🚀 Opportunities Hub — India&apos;s Career SuperApp
          </div>
          <h1 className="text-5xl font-bold mb-3 max-sm:text-3xl" style={{ background: `linear-gradient(135deg, #fff 0%, ${activeTabCfg.color} 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Find Your Next Big Break
          </h1>
          <p className="text-gray-400 text-lg max-sm:text-base">
            Hackathons · Internships · Jobs — all in one place, updated in real-time
          </p>

          {/* Quick links */}
          <div className="flex items-center justify-center gap-3 mt-6 flex-wrap">
            {[
              { href: '/hackathons', label: '🏆 Hackathons', color: '#5dfeca' },
              { href: '/internships', label: '🎓 Internships', color: '#fb923c' },
              { href: '/jobs', label: '💼 Jobs', color: '#a78bfa' },
            ].map(l => (
              <Link key={l.href} href={l.href}
                className="text-xs px-4 py-2 rounded-full font-semibold transition-all hover:scale-105"
                style={{ background: `${l.color}10`, color: l.color, border: `1px solid ${l.color}30` }}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-5 sm:px-10 pb-16">

        {/* ─── Featured Carousel ─── */}
        {featured.length > 0 && (
          <div className="mb-10">
            <FeaturedCarousel items={featured} />
          </div>
        )}

        {/* ─── Trending ─── */}
        {trending.length > 0 && <TrendingSection items={trending} />}

        {/* ─── Search & Filters ─── */}
        <div className="mb-6 space-y-3">
          <SearchBar value={search} onChange={setSearch} onRefresh={fetchOpportunities} loading={loading} accentColor={activeTabCfg.color} />

          {/* Tab row + filter toggle */}
          <div className="flex items-center gap-2 flex-wrap">
            {TABS.map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: activeTab === tab.key ? `${tab.color}15` : 'rgba(255,255,255,0.04)',
                  color: activeTab === tab.key ? tab.color : '#9ca3af',
                  border: `1px solid ${activeTab === tab.key ? tab.color + '40' : 'rgba(255,255,255,0.1)'}`,
                }}>
                <tab.icon size={14} />{tab.label}
              </button>
            ))}

            <div className="ml-auto flex items-center gap-2">
              {/* Remote toggle */}
              <button onClick={() => setRemoteOnly(r => !r)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                style={{
                  background: remoteOnly ? 'rgba(14,165,233,0.15)' : 'rgba(255,255,255,0.04)',
                  color: remoteOnly ? '#38bdf8' : '#9ca3af',
                  border: `1px solid ${remoteOnly ? 'rgba(14,165,233,0.4)' : 'rgba(255,255,255,0.1)'}`,
                }}>
                🌐 Remote
              </button>

              {/* Sort */}
              <div className="relative">
                <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                  className="appearance-none px-3 py-2 pr-7 rounded-xl text-xs bg-white/5 border border-white/10 text-gray-400 focus:outline-none cursor-pointer">
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* ─── Stats bar ─── */}
        <div className="flex items-center gap-3 mb-5 text-sm text-gray-500">
          {loading ? <span>Loading...</span> : (
            <><span className="text-white font-semibold">{total.toLocaleString('en-IN')}</span> opportunities found
              {debouncedSearch && <span>for &quot;{debouncedSearch}&quot;</span>}
            </>
          )}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 text-red-400 text-sm text-center flex items-center justify-center gap-2">
            {error}
            <button onClick={fetchOpportunities} className="underline hover:no-underline">Retry</button>
          </div>
        )}

        {/* ─── Grid ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading
            ? <SkeletonCard count={9} />
            : opportunities.length > 0
              ? opportunities.map(opp => <OpportunityCard key={opp._id} opportunity={opp} />)
              : (
                <div className="col-span-full text-center py-16 text-gray-500">
                  <div className="text-5xl mb-4">🔍</div>
                  <p className="text-lg font-semibold text-gray-400">No opportunities found</p>
                  <p className="text-sm mt-1">Try adjusting your filters or search query</p>
                  <button onClick={() => { setSearch(''); setActiveTab('all'); setRemoteOnly(false); }}
                    className="mt-4 px-4 py-2 rounded-xl text-sm text-[#5dfeca] border border-[rgba(93,254,202,0.3)] bg-[rgba(93,254,202,0.05)] hover:bg-[rgba(93,254,202,0.1)] transition">
                    Clear filters
                  </button>
                </div>
              )
          }
        </div>

        {/* ─── Pagination ─── */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-10 flex-wrap">
            <button onClick={() => setPage(1)} disabled={page === 1}
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-400 hover:text-white transition disabled:opacity-30">«</button>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-400 hover:text-white hover:border-white/20 disabled:opacity-30 transition">← Prev</button>
            <span className="px-4 py-2 text-sm" style={{ color: activeTabCfg.color }}>Page {page} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-400 hover:text-white hover:border-white/20 disabled:opacity-30 transition">Next →</button>
            <button onClick={() => setPage(totalPages)} disabled={page === totalPages}
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-400 hover:text-white transition disabled:opacity-30">»</button>
          </div>
        )}

        {/* ─── Recommendation Section ─── */}
        <div className="mt-16 pt-10 border-t border-white/5">
          <RecommendationSection />
        </div>
      </div>
    </div>
  );
}
