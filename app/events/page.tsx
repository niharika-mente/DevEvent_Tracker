import { Suspense } from "react";
import EventCard from "@/components/EventCard";
import Footer from "@/components/Footer";
import SearchFilters from "@/components/SearchFilters";
import Pagination from "@/components/Pagination";
import { IEvent } from "@/database";
import { getAllEvents } from "@/lib/actions/event.actions";

const VALID_SORT = ["date_asc", "date_desc", "name_asc", "name_desc", "popularity"] as const;
type SortByType = (typeof VALID_SORT)[number];

const EVENTS_PER_PAGE = 9;

interface PageProps {
  searchParams: Promise<{
    query?: string;
    mode?: string;
    tag?: string;
    sortBy?: string;
    page?: string;
  }>;
}

async function EventsList({
  query,
  mode,
  tag,
  sortBy,
  page,
}: {
  query?: string;
  mode?: string;
  tag?: string;
  sortBy?: SortByType;
  page: number;
}) {
  const { events, totalPages, currentPage } = await getAllEvents(
    { query, mode, tag, sortBy },
    page,
    EVENTS_PER_PAGE
  );

  if (!events || events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-12 border border-dashed border-[var(--color-border-dark)] rounded-2xl max-w-xl mx-auto mt-20">
        <p className="text-4xl mb-4">🔍</p>
        <h4 className="text-lg font-semibold text-[var(--color-light-100)] mb-1">
          No events found
        </h4>
        <p className="text-sm text-[var(--color-light-200)] max-w-xs">
          We couldn&apos;t find any events matching your criteria. Try adjusting your filters.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Events grid */}
      <ul className="events">
        {events.map((event: IEvent) => (
          <li key={event._id} className="list-none">
            <EventCard {...event} />
          </li>
        ))}
      </ul>

      {/* Page info */}
      <p className="text-center text-sm text-[var(--color-light-200)] mt-8">
        Page {currentPage} of {totalPages}
      </p>

      {/* Pagination controls — must be in Suspense since it uses useSearchParams */}
      <Suspense fallback={null}>
        <Pagination currentPage={currentPage} totalPages={totalPages} />
      </Suspense>
    </>
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

  const rawPage = parseInt(resolved.page || '1', 10);
  const page = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;

  return (
    <section>
      <div className="mt-16">
        <h1 className="text-center mb-3">All Events</h1>
        <p className="text-center text-[var(--color-light-200)] mb-12">
          Discover upcoming events and opportunities
        </p>
      </div>

      {/* SearchFilters uses useSearchParams — must be inside Suspense */}
      <Suspense fallback={<div className="w-full h-16 animate-pulse rounded-xl bg-muted" />}>
        <SearchFilters />
      </Suspense>

      <Suspense
        key={`${query}-${mode}-${tag}-${sortBy}-${page}`}
        fallback={
          <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-10 mt-6">
            {Array.from({ length: EVENTS_PER_PAGE }).map((_, i) => (
              <div
                key={i}
                className="h-[340px] rounded-2xl animate-pulse bg-[var(--color-dark-200)]"
              />
            ))}
          </div>
        }
      >
        <EventsList
          query={query}
          mode={mode}
          tag={tag}
          sortBy={sortBy}
          page={page}
        />
      </Suspense>

      <Footer />
    </section>
  );
}
