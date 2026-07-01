// components/EventDetailsSkeleton.tsx
export default function EventDetailsSkeleton() {
  return (
    <div className="animate-pulse p-6 space-y-8">
      {/* Header Skeleton */}
      <div className="space-y-3">
        <div className="h-8 bg-muted rounded w-1/3"></div>
        <div className="h-4 bg-muted rounded w-2/3"></div>
      </div>

      {/* Main Content Area */}
      <div className="flex gap-8">
        <div className="flex-1 space-y-6">
          {/* Banner Image Placeholder */}
          <div className="h-64 bg-muted rounded-lg w-full"></div>
          {/* Overview Section */}
          <div className="h-20 bg-muted rounded w-full"></div>
          {/* Details list */}
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-6 bg-muted rounded w-1/2"></div>)}
          </div>
        </div>

        {/* Sidebar/Booking Placeholder */}
        <div className="w-80 h-60 bg-muted rounded-lg"></div>
      </div>
    </div>
  );
}
