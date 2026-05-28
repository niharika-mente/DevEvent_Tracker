'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search, MapPin, ExternalLink, GraduationCap, Clock, Users, RefreshCw, Building2, Calendar, DollarSign } from 'lucide-react';

interface Internship {
  _id: string; title: string; image: string; orgLogo: string; company: string;
  location: string; duration: string; startDate: string; deadline: string;
  stipendInfo: string; tags: string[]; registrationLink: string;
  daysLeft: number; registerCount: number; regnOpen: boolean; mode: string;
}

const SKELETON = Array.from({ length: 9 });

export default function InternshipsPage() {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => { const t = setTimeout(() => setDebouncedSearch(searchQuery), 500); return () => clearTimeout(t); }, [searchQuery]);

  const fetchInternships = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (debouncedSearch) params.set('q', debouncedSearch);
      const res = await fetch(`/api/unstop/internships?${params}`);
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setInternships(data.internships || []); setTotal(data.total || 0);
    } catch { setError('Could not load live internship data. Please try again.'); }
    finally { setLoading(false); }
  }, [page, debouncedSearch]);

  useEffect(() => { fetchInternships(); }, [fetchInternships]);

  const urgencyColor = (days: number) =>
    days <= 2 ? 'text-red-400 bg-red-500/10 border-red-500/30' :
    days <= 7 ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' :
    'text-orange-400 bg-orange-500/10 border-orange-500/30';

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="relative py-16 px-5 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-1.5 mb-5">
            <GraduationCap size={14} className="text-orange-400" />
            <span className="text-orange-400 text-xs font-semibold uppercase tracking-wider">Live from Unstop</span>
          </div>
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-b from-white via-white to-orange-400 bg-clip-text text-transparent max-sm:text-3xl">Internships</h1>
          <p className="text-gray-400">Real-time internship openings — kickstart your career today.</p>
        </div>
      </div>

      <div className="container mx-auto px-5 sm:px-10 pb-16">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 mb-8 flex gap-3 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" placeholder="Search internships, companies, roles..." value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-orange-500/50 transition" />
          </div>
          <button onClick={fetchInternships} className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-orange-400 hover:border-orange-500/40 transition">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <span className="text-gray-500 text-sm">{loading ? 'Loading...' : `${total.toLocaleString('en-IN')} internships found`}</span>
          <span className="text-gray-700">•</span>
          <a href="https://unstop.com/internships" target="_blank" rel="noopener noreferrer" className="text-xs text-orange-500/70 hover:text-orange-400 flex items-center gap-1 transition">View all on Unstop <ExternalLink size={11} /></a>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 text-red-400 text-sm text-center">{error}</div>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading ? SKELETON.map((_, i) => (
            <div key={i} className="bg-white/5 rounded-2xl overflow-hidden animate-pulse">
              <div className="h-36 bg-white/5" /><div className="p-4 space-y-3"><div className="h-4 bg-white/5 rounded w-3/4" /><div className="h-3 bg-white/5 rounded w-1/2" /></div>
            </div>
          )) : internships.map(i => (
            <a key={i._id} href={i.registrationLink} target="_blank" rel="noopener noreferrer"
              className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-orange-500/40 transition-all duration-300 hover:shadow-[0_0_30px_rgba(251,146,60,0.08)] block">
              <div className="relative h-36 overflow-hidden bg-white/5">
                <img src={i.image} alt={i.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <span className={`absolute top-3 right-3 text-xs font-semibold px-2 py-0.5 rounded-full border ${urgencyColor(i.daysLeft)}`}>
                  <Clock size={10} className="inline mr-1" />{i.daysLeft <= 0 ? 'Closing soon' : `${i.daysLeft}d left`}
                </span>
                <span className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-full border border-white/10 capitalize">{i.mode}</span>
              </div>
              <div className="p-4">
                <h3 className="text-white font-bold text-base mb-0.5 line-clamp-2 group-hover:text-orange-400 transition-colors">{i.title}</h3>
                <p className="text-gray-400 text-sm font-medium mb-3 flex items-center gap-1.5"><Building2 size={12} className="text-orange-500/70 shrink-0" /><span className="truncate">{i.company}</span></p>
                <div className="space-y-1.5 text-xs text-gray-400 mb-3">
                  <div className="flex items-center gap-1.5"><MapPin size={11} className="text-orange-500/70 shrink-0" /><span className="truncate">{i.location}</span></div>
                  {i.duration && <div className="flex items-center gap-1.5"><Calendar size={11} className="text-orange-500/70 shrink-0" /><span>Duration: {i.duration}</span></div>}
                  {i.stipendInfo && <div className="flex items-center gap-1.5"><DollarSign size={11} className="text-emerald-400 shrink-0" /><span className="text-emerald-400 font-medium truncate">{i.stipendInfo}</span></div>}
                </div>
                {i.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {i.tags.map(t => <span key={t} className="bg-orange-500/10 text-orange-400 text-xs px-2 py-0.5 rounded-full border border-orange-500/20">{t}</span>)}
                  </div>
                )}
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                  <span className="text-gray-500 text-xs flex items-center gap-1"><Users size={10} />{i.registerCount.toLocaleString('en-IN')} applied</span>
                  <span className="text-orange-400 text-xs font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">Apply Now <ExternalLink size={11} /></span>
                </div>
              </div>
            </a>
          ))}
        </div>

        {!loading && internships.length > 0 && (
          <div className="flex justify-center gap-3 mt-10">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-400 hover:text-white hover:border-orange-500/40 disabled:opacity-30 disabled:cursor-not-allowed transition">← Prev</button>
            <span className="px-4 py-2 text-sm text-gray-400">Page {page}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={internships.length < 12}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-400 hover:text-white hover:border-orange-500/40 disabled:opacity-30 disabled:cursor-not-allowed transition">Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}
