'use client';

import { useEffect, useState } from 'react';
import { Database, TrendingUp, Clock, Zap, Activity, Server, BarChart3, RefreshCw } from 'lucide-react';

interface Stats {
  total: number; active: number; expired: number; today: number;
  trending: number; hackathons: number; internships: number; jobs: number;
  bySources: { _id: string; count: number }[];
}

function StatCard({ label, value, icon: Icon, color, sub }: any) {
  return (
    <div className="rounded-2xl p-5 flex items-start gap-4 transition-all hover:scale-[1.02]"
      style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${color}25`, backdropFilter: 'blur(12px)' }}>
      <div className="p-2.5 rounded-xl shrink-0" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
        <Icon size={18} style={{ color }} />
      </div>
      <div>
        <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">{label}</p>
        <p className="text-white text-2xl font-bold mt-0.5">{typeof value === 'number' ? value.toLocaleString('en-IN') : value}</p>
        {sub && <p className="text-gray-600 text-xs mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [refreshMsg, setRefreshMsg] = useState('');

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin');
      const data = await res.json();
      setStats(data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchStats(); }, []);

  const handleSeed = async () => {
    setSeeding(true); setSeedMsg('');
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      const data = await res.json();
      setSeedMsg(data.message || 'Done!');
      fetchStats();
    } catch { setSeedMsg('Seed failed.'); }
    finally { setSeeding(false); }
  };

  const handleRefresh = async () => {
    setRefreshing(true); setRefreshMsg('');
    try {
      const res = await fetch('/api/cron/refresh');
      const data = await res.json();
      setRefreshMsg(`Inserted: ${data.inserted}, Skipped: ${data.skipped}, Expired: ${data.expired}`);
      fetchStats();
    } catch { setRefreshMsg('Refresh failed.'); }
    finally { setRefreshing(false); }
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="relative py-12 px-5 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#5dfeca]/8 to-transparent pointer-events-none" />
        <div className="relative z-10 container mx-auto sm:px-10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 size={20} className="text-[#5dfeca]" />
                <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
              </div>
              <p className="text-gray-500 text-sm">Monitor scraped data and system health</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button onClick={handleSeed} disabled={seeding}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-50 transition"
                style={{ background: 'rgba(93,254,202,0.1)', color: '#5dfeca', border: '1px solid rgba(93,254,202,0.3)' }}>
                <Database size={14} />{seeding ? 'Seeding...' : 'Seed DB'}
              </button>
              <button onClick={handleRefresh} disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-50 transition"
                style={{ background: 'rgba(167,139,250,0.1)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.3)' }}>
                <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />{refreshing ? 'Refreshing...' : 'Force Refresh'}
              </button>
            </div>
          </div>
          {(seedMsg || refreshMsg) && (
            <div className="mt-3 text-sm text-[#5dfeca] bg-[rgba(93,254,202,0.08)] border border-[rgba(93,254,202,0.2)] rounded-xl px-4 py-2">{seedMsg || refreshMsg}</div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-5 sm:px-10 pb-16">
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl p-5 animate-pulse bg-white/5 h-24" />
            ))}
          </div>
        ) : stats ? (
          <>
            {/* Main stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard label="Total Opportunities" value={stats.total} icon={Database} color="#5dfeca" sub="All time" />
              <StatCard label="Active" value={stats.active} icon={Activity} color="#34d399" sub="Not expired" />
              <StatCard label="Added Today" value={stats.today} icon={Zap} color="#fbbf24" sub="Last 24h" />
              <StatCard label="Trending" value={stats.trending} icon={TrendingUp} color="#f472b6" sub="High traffic" />
            </div>

            {/* By type */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <StatCard label="Hackathons" value={stats.hackathons} icon={Server} color="#5dfeca" />
              <StatCard label="Internships" value={stats.internships} icon={Server} color="#fb923c" />
              <StatCard label="Jobs" value={stats.jobs} icon={Server} color="#a78bfa" />
            </div>

            {/* Expired */}
            <div className="mb-8">
              <StatCard label="Expired / Closed" value={stats.expired} icon={Clock} color="#ef4444" sub="Auto-removed from listings" />
            </div>

            {/* By source */}
            <div>
              <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                <Server size={16} className="text-[#5dfeca]" /> Opportunities by Source
              </h2>
              <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}>
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      <th className="text-left px-5 py-3 text-gray-500 font-medium">Source</th>
                      <th className="text-right px-5 py-3 text-gray-500 font-medium">Count</th>
                      <th className="text-right px-5 py-3 text-gray-500 font-medium">Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.bySources.map((s, i) => (
                      <tr key={s._id} style={{ borderBottom: i < stats.bySources.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                        <td className="px-5 py-3 text-white font-medium">{s._id}</td>
                        <td className="px-5 py-3 text-right text-gray-400">{s.count.toLocaleString('en-IN')}</td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-20 h-1.5 rounded-full bg-white/10 overflow-hidden">
                              <div className="h-full rounded-full bg-[#5dfeca]"
                                style={{ width: `${Math.round((s.count / stats.total) * 100)}%` }} />
                            </div>
                            <span className="text-gray-500 text-xs w-8 text-right">{Math.round((s.count / stats.total) * 100)}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-20 text-gray-500">Failed to load stats. <button onClick={fetchStats} className="underline text-[#5dfeca]">Retry</button></div>
        )}
      </div>
    </div>
  );
}
