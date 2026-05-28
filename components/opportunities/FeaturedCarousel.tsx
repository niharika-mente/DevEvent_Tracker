'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, Award, MapPin, Clock } from 'lucide-react';

interface FeaturedItem {
  _id: string;
  title: string;
  company: string;
  location: string;
  stipend: string;
  deadline?: string;
  applyLink: string;
  logo: string;
  tags: string[];
  registerCount?: number;
}

interface FeaturedCarouselProps {
  items: FeaturedItem[];
}

function getDaysLeft(deadline?: string) {
  if (!deadline) return null;
  return Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
}

export default function FeaturedCarousel({ items }: FeaturedCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll every 4 seconds unless hovered
  useEffect(() => {
    if (!isHovered && items.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrent((c) => (c + 1) % items.length);
      }, 4000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isHovered, items.length]);

  if (!items.length) return null;

  const prev = () => setCurrent((c) => (c - 1 + items.length) % items.length);
  const next = () => setCurrent((c) => (c + 1) % items.length);
  const item = items[current];
  const daysLeft = getDaysLeft(item.deadline);

  return (
    <div
      className="relative rounded-2xl overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: 'linear-gradient(135deg, rgba(93,254,202,0.08), rgba(13,22,26,0.9))',
        border: '1px solid rgba(93,254,202,0.2)',
        backdropFilter: 'blur(16px)',
      }}
    >
      {/* Animated background gradient */}
      <div
        className="absolute inset-0 opacity-30 transition-opacity duration-1000"
        style={{
          background: `radial-gradient(ellipse at 20% 50%, rgba(93,254,202,0.15) 0%, transparent 60%)`,
        }}
      />

      <div className="relative z-10 flex flex-col sm:flex-row gap-6 p-6 sm:p-8">
        {/* Logo */}
        <div className="flex-shrink-0">
          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/10 border border-white/20 p-2">
            <img
              src={item.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.company)}&background=0d161a&color=5dfeca&bold=true`}
              alt={item.company}
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.company)}&background=0d161a&color=5dfeca&bold=true`;
              }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <span className="text-xs text-[#5dfeca] font-semibold uppercase tracking-wider mb-1 block">⭐ Featured Hackathon</span>
              <h3 className="text-white font-bold text-lg sm:text-xl leading-snug line-clamp-2">{item.title}</h3>
              <p className="text-gray-400 text-sm mt-0.5">{item.company}</p>
            </div>
            <a
              href={item.applyLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105 shrink-0"
              style={{ background: 'rgba(93,254,202,0.15)', color: '#5dfeca', border: '1px solid rgba(93,254,202,0.3)' }}
            >
              Register <ExternalLink size={13} />
            </a>
          </div>

          <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-400">
            <span className="flex items-center gap-1.5"><MapPin size={13} className="text-[#5dfeca]" />{item.location}</span>
            {item.stipend && <span className="flex items-center gap-1.5 text-emerald-400"><Award size={13} />{item.stipend}</span>}
            {daysLeft !== null && (
              <span className={`flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full border ${daysLeft <= 7 ? 'text-amber-400 border-amber-500/30 bg-amber-500/10' : 'text-gray-400 border-white/10 bg-white/5'}`}>
                <Clock size={11} />{daysLeft <= 0 ? 'Ending soon' : `${daysLeft}d left`}
              </span>
            )}
          </div>

          {/* Tags */}
          {item.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {item.tags.slice(0, 4).map((tag) => (
                <span key={tag} className="text-xs px-2 py-0.5 rounded-full text-[#5dfeca] bg-[rgba(93,254,202,0.08)] border border-[rgba(93,254,202,0.2)]">{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      {items.length > 1 && (
        <>
          <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition z-20">
            <ChevronLeft size={16} />
          </button>
          <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition z-20">
            <ChevronRight size={16} />
          </button>

          {/* Dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className="rounded-full transition-all"
                style={{
                  width: i === current ? 20 : 6,
                  height: 6,
                  background: i === current ? '#5dfeca' : 'rgba(255,255,255,0.3)',
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
