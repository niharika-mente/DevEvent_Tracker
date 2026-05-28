'use client';

import { useState, useEffect } from 'react';
import { Bookmark, BookmarkCheck, ExternalLink, MapPin, Clock, Users, Wifi, Building2, Award } from 'lucide-react';

interface Opportunity {
  _id: string;
  title: string;
  company: string;
  type: 'hackathon' | 'internship' | 'job';
  location: string;
  isRemote: boolean;
  stipend: string;
  deadline?: string;
  skills: string[];
  tags: string[];
  applyLink: string;
  source: string;
  logo: string;
  description: string;
  postedAt: string;
  registerCount?: number;
  isFeatured?: boolean;
  isTrending?: boolean;
  matchScore?: number;
}

interface OpportunityCardProps {
  opportunity: Opportunity;
}

// Color theme per opportunity type
const TYPE_CONFIG = {
  hackathon: {
    accent: '#5dfeca',
    bg: 'rgba(93,254,202,0.08)',
    border: 'rgba(93,254,202,0.25)',
    hoverBorder: 'rgba(93,254,202,0.5)',
    glow: 'rgba(93,254,202,0.12)',
    label: 'Hackathon',
    badgeClass: 'text-[#5dfeca] bg-[rgba(93,254,202,0.1)] border-[rgba(93,254,202,0.3)]',
  },
  internship: {
    accent: '#fb923c',
    bg: 'rgba(251,146,60,0.08)',
    border: 'rgba(251,146,60,0.25)',
    hoverBorder: 'rgba(251,146,60,0.5)',
    glow: 'rgba(251,146,60,0.12)',
    label: 'Internship',
    badgeClass: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
  },
  job: {
    accent: '#a78bfa',
    bg: 'rgba(167,139,250,0.08)',
    border: 'rgba(167,139,250,0.25)',
    hoverBorder: 'rgba(167,139,250,0.5)',
    glow: 'rgba(167,139,250,0.12)',
    label: 'Job',
    badgeClass: 'text-violet-400 bg-violet-500/10 border-violet-500/30',
  },
};

function getDaysLeft(deadline?: string): number | null {
  if (!deadline) return null;
  const diff = new Date(deadline).getTime() - Date.now();
  return Math.ceil(diff / 86400000);
}

function getLogoFallback(company: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(company)}&background=1a1a2e&color=5dfeca&bold=true&size=48`;
}

export default function OpportunityCard({ opportunity }: OpportunityCardProps) {
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  const cfg = TYPE_CONFIG[opportunity.type] || TYPE_CONFIG.job;
  const daysLeft = getDaysLeft(opportunity.deadline);

  // Load bookmark state from localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    setBookmarked(saved.includes(opportunity._id));
  }, [opportunity._id]);

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setBookmarkLoading(true);

    const saved: string[] = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    const isNowBookmarked = !bookmarked;

    if (isNowBookmarked) {
      localStorage.setItem('bookmarks', JSON.stringify([...saved, opportunity._id]));
      await fetch('/api/bookmark', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: opportunity._id }) });
    } else {
      localStorage.setItem('bookmarks', JSON.stringify(saved.filter((id) => id !== opportunity._id)));
      await fetch('/api/bookmark', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: opportunity._id }) });
    }

    setBookmarked(isNowBookmarked);
    setBookmarkLoading(false);
  };

  const urgencyClass =
    daysLeft !== null
      ? daysLeft <= 2
        ? 'text-red-400 bg-red-500/10 border-red-500/30'
        : daysLeft <= 7
        ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
        : 'text-gray-400 bg-white/5 border-white/10'
      : '';

  return (
    <div
      className="group relative flex flex-col rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer"
      style={{
        background: 'rgba(13,22,26,0.85)',
        border: `1px solid ${cfg.border}`,
        backdropFilter: 'blur(12px)',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.border = `1px solid ${cfg.hoverBorder}`;
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 40px ${cfg.glow}`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.border = `1px solid ${cfg.border}`;
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
      }}
    >
      {/* Top stripe */}
      <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, transparent, ${cfg.accent}, transparent)` }} />

      <div className="p-5 flex flex-col gap-4 flex-1">
        {/* Header row */}
        <div className="flex items-start gap-3">
          {/* Logo */}
          <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-white/5 border border-white/10">
            <img
              src={opportunity.logo || getLogoFallback(opportunity.company)}
              alt={opportunity.company}
              className="w-full h-full object-contain p-1"
              onError={(e) => { (e.target as HTMLImageElement).src = getLogoFallback(opportunity.company); }}
            />
          </div>

          {/* Title + company */}
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold text-sm leading-snug line-clamp-2 group-hover:text-[var(--accent-color)] transition-colors"
              style={{ '--accent-color': cfg.accent } as React.CSSProperties}>
              {opportunity.title}
            </h3>
            <p className="text-gray-400 text-xs mt-0.5 truncate flex items-center gap-1">
              <Building2 size={10} className="shrink-0" style={{ color: cfg.accent }} />
              {opportunity.company}
            </p>
          </div>

          {/* Bookmark */}
          <button
            onClick={handleBookmark}
            disabled={bookmarkLoading}
            className="p-1.5 rounded-lg transition-colors shrink-0"
            style={{ color: bookmarked ? cfg.accent : '#6b7280' }}
            title={bookmarked ? 'Remove bookmark' : 'Bookmark'}
          >
            {bookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
          </button>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5">
          <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${cfg.badgeClass}`}>
            {cfg.label}
          </span>
          {opportunity.isRemote && (
            <span className="text-xs px-2 py-0.5 rounded-full border border-sky-500/30 bg-sky-500/10 text-sky-400 flex items-center gap-1">
              <Wifi size={9} /> Remote
            </span>
          )}
          {opportunity.isTrending && (
            <span className="text-xs px-2 py-0.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-400">
              🔥 Trending
            </span>
          )}
          {opportunity.matchScore !== undefined && (
            <span className="text-xs px-2 py-0.5 rounded-full border border-green-500/30 bg-green-500/10 text-green-400">
              {opportunity.matchScore}% match
            </span>
          )}
        </div>

        {/* Meta info */}
        <div className="space-y-1.5 text-xs text-gray-400">
          <div className="flex items-center gap-1.5">
            <MapPin size={11} style={{ color: cfg.accent }} className="shrink-0" />
            <span className="truncate">{opportunity.location}</span>
          </div>
          {opportunity.stipend && opportunity.stipend !== 'Not disclosed' && (
            <div className="flex items-center gap-1.5">
              <Award size={11} className="text-emerald-400 shrink-0" />
              <span className="text-emerald-400 font-medium truncate">{opportunity.stipend}</span>
            </div>
          )}
          {daysLeft !== null && (
            <div className={`flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full border w-fit ${urgencyClass}`}>
              <Clock size={10} />
              {daysLeft <= 0 ? 'Closing soon' : `${daysLeft}d left`}
            </div>
          )}
        </div>

        {/* Skills */}
        {opportunity.skills?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {opportunity.skills.slice(0, 3).map((skill) => (
              <span
                key={skill}
                className="text-xs px-2 py-0.5 rounded-md"
                style={{ background: cfg.bg, color: cfg.accent, border: `1px solid ${cfg.border}` }}
              >
                {skill}
              </span>
            ))}
            {opportunity.skills.length > 3 && (
              <span className="text-xs px-2 py-0.5 rounded-md text-gray-500 bg-white/5 border border-white/10">
                +{opportunity.skills.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            {opportunity.registerCount ? (
              <><Users size={10} /> {opportunity.registerCount.toLocaleString('en-IN')} applied</>
            ) : (
              <span className="opacity-60">via {opportunity.source}</span>
            )}
          </div>
          <a
            href={opportunity.applyLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all group-hover:gap-2"
            style={{ background: cfg.bg, color: cfg.accent, border: `1px solid ${cfg.border}` }}
          >
            Apply <ExternalLink size={10} />
          </a>
        </div>
      </div>
    </div>
  );
}
