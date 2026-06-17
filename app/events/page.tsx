import { Suspense } from "react";
import EventCard from "@/components/EventCard";
import Footer from "@/components/Footer";
import SearchFilters from "@/components/SearchFilters";
import { IEvent } from "@/database";
import { getAllEvents } from "@/lib/actions/event.actions";

const VALID_SORT = ["date_asc", "date_desc", "name_asc", "name_desc", "popularity"] as const;
type SortByType = (typeof VALID_SORT)[number];

interface PageProps {
  searchParams: Promise<{
    query?: string;
    mode?: string;
    tag?: string;
    sortBy?: string;
  }>;
}

// Separate async server component for events list so it can be wrapped in Suspense
async function EventsList({
  query,
  mode,
  tag,
  sortBy,
}: {
  query?: string;
  mode?: string;
  tag?: string;
  sortBy?: SortByType;
}) {
  const events = await getAllEvents({ query, mode, tag, sortBy });

  if (!events || events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-12 border border-dashed border-gray-300 rounded-2xl max-w-xl mx-auto bg-white/50 mt-20">
        <h4 className="text-lg font-semibold text-gray-800 mb-1">
          No events found
        </h4>
        <p className="text-sm text-gray-500 max-w-xs">
          We couldn&apos;t find any events matching your criteria. Try adjusting your filters.
        </p>
      </div>
    );
  }

  return (
    <ul className="events">
      {events.map((event: IEvent) => (
        <li key={event._id} className="list-none">
          <EventCard {...event} />
        </li>
      ))}
    </ul>
  );
}

export default async function Page({ searchParams }: PageProps) {
  const resolved = await searchParams;

  const query = resolved.query?.trim() || undefined;
  const mode = resolved.mode?.trim() || undefined;
  const tag = resolved.tag?.trim() || undefined;
  const rawSortBy = resolved.sortBy?.trim();
  const sortBy = VALID_SORT.includes(rawSortBy as SortByType)
    ? (rawSortBy as SortByType)
    : undefined;

  return (
    <section>
      <div className="mt-16">
        <h1 className="text-center mb-3">All Events</h1>
        <p className="text-center text-gray-400 mb-12">
          Discover upcoming events and opportunities
        </p>
      </div>

      {/* SearchFilters uses useSearchParams — must be inside Suspense */}
      <Suspense fallback={<div className="w-full h-16 animate-pulse rounded-xl bg-white/10" />}>
        <SearchFilters />
      </Suspense>

      <Suspense fallback={<div className="text-center py-12">Loading events...</div>}>
        <EventsList query={query} mode={mode} tag={tag} sortBy={sortBy} />
      </Suspense>

      <Footer />
    </section>
  );
}
