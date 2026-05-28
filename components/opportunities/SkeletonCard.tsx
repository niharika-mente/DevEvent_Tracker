'use client';

interface SkeletonCardProps {
  count?: number;
}

function SkeletonItem() {
  return (
    <div
      className="rounded-2xl overflow-hidden animate-pulse"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <div className="h-0.5 w-full bg-white/5" />
      <div className="p-5 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/8 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-white/8 rounded w-3/4" />
            <div className="h-3 bg-white/5 rounded w-1/2" />
          </div>
        </div>
        {/* Badges */}
        <div className="flex gap-2">
          <div className="h-5 w-20 bg-white/5 rounded-full" />
          <div className="h-5 w-16 bg-white/5 rounded-full" />
        </div>
        {/* Meta */}
        <div className="space-y-2">
          <div className="h-3 bg-white/5 rounded w-2/3" />
          <div className="h-3 bg-white/5 rounded w-1/2" />
          <div className="h-5 bg-white/5 rounded-full w-24" />
        </div>
        {/* Skills */}
        <div className="flex gap-2">
          <div className="h-5 w-16 bg-white/5 rounded-md" />
          <div className="h-5 w-20 bg-white/5 rounded-md" />
          <div className="h-5 w-14 bg-white/5 rounded-md" />
        </div>
        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          <div className="h-3 w-24 bg-white/5 rounded" />
          <div className="h-7 w-20 bg-white/5 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export default function SkeletonCard({ count = 6 }: SkeletonCardProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonItem key={i} />
      ))}
    </>
  );
}
