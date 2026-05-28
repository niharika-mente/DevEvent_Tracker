'use client';

import { Flame, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';

interface TrendingItem {
  _id: string;
  title: string;
  company: string;
  type: 'hackathon' | 'internship' | 'job';
  stipend: string;
  applyLink: string;
  logo: string;
  source: string;
}

const TYPE_COLOR = {
  hackathon: '#5dfeca',
  internship: '#fb923c',
  job: '#a78bfa',
};

export default function TrendingSection({ items }: { items: TrendingItem[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!items.length) return null;

  return (
    <section className="mb-10">
      <div className="flex items-center gap-2 mb-4">
        <Flame size={18} className="text-orange-400" />
        <h2 className="text-white font-bold text-lg">Trending Now</h2>
        <span className="text-xs text-gray-500 ml-1">— most viewed today</span>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10"
        style={{ scrollbarWidth: 'thin' }}
      >
        {items.map((item) => {
          const color = TYPE_COLOR[item.type] || '#5dfeca';
          return (
            <a
              key={item._id}
              href={item.applyLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:scale-[1.02]"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${color}25`,
                minWidth: 220,
                maxWidth: 260,
                backdropFilter: 'blur(8px)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.border = `1px solid ${color}50`;
                (e.currentTarget as HTMLAnchorElement).style.background = `${color}08`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.border = `1px solid ${color}25`;
                (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.04)';
              }}
            >
              {/* Logo */}
              <div className="w-9 h-9 rounded-lg overflow-hidden bg-white/10 flex-shrink-0 p-1">
                <img
                  src={item.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.company)}&background=0d161a&color=${color.replace('#', '')}&bold=true&size=36`}
                  alt={item.company}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.company)}&background=0d161a&color=5dfeca&bold=true&size=36`;
                  }}
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-white text-xs font-semibold line-clamp-1">{item.title}</p>
                <p className="text-gray-500 text-xs truncate">{item.company}</p>
                <span
                  className="text-xs font-medium mt-0.5 inline-block"
                  style={{ color }}
                >
                  {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                </span>
              </div>

              <ChevronRight size={14} className="text-gray-600 shrink-0" />
            </a>
          );
        })}
      </div>
    </section>
  );
}
