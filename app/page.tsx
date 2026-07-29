import { Suspense } from "react";
import ExploreBtn from "@/components/ExploreBtn";
import EventCard from "@/components/EventCard";
import SearchFilters from "@/components/SearchFilters";
import Footer from "@/components/Footer";
import { IEvent } from "@/database";
import { getAllEvents } from "@/lib/actions/event.actions";

interface PageProps {
  searchParams: Promise<{
    query?: string;
    mode?: string;
    tag?: string;
    sortBy?: "date_asc" | "date_desc" | "name_asc" | "name_desc" | "popularity";
    page?: string;
  }>;
}

export default async function Page({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;

  const events = await getAllEvents({
    query: resolvedParams.query,
    mode: resolvedParams.mode,
    tag: resolvedParams.tag,
    sortBy: resolvedParams.sortBy,
  });

  return (
    <section className="py-6 sm:py-10">
      <div className="text-center space-y-4">
        <h1 className="text-center font-extrabold text-4xl sm:text-5xl md:text-6xl tracking-tight leading-tight bg-gradient-to-b from-foreground to-foreground/80 bg-clip-text text-transparent drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
          The Hub for Every Dev <br />
          <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Event You Can&apos;t Miss
          </span>
        </h1>
        <p className="text-center mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed font-normal">
          Hackathons, Meetups, and Conferences — All in One Unified Space.
        </p>
      </div>

      <ExploreBtn />

      <div className="mt-10">
        <Suspense fallback={<div className="w-full h-16 animate-pulse rounded-xl bg-white/5" />}>
          <SearchFilters />
        </Suspense>
      </div>

      <div className="mt-16 space-y-7">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold tracking-tight text-foreground">Featured Events</h3>
        </div>

        {events && events.length > 0 ? (
          <ul className="events">
            {events.map((event: IEvent) => (
              <li key={event._id as string} className="list-none">
                <EventCard {...event} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-12 border border-dashed border-border/80 rounded-2xl max-w-xl mx-auto bg-card/60 backdrop-blur-md shadow-sm">
            <h4 className="text-lg font-semibold text-foreground mb-1">No events found</h4>
            <p className="text-sm text-muted-foreground max-w-xs">
              We couldn&apos;t find any listings matching your search constraints. Try checking your spelling or adjusting filters.
            </p>
          </div>
        )}
      </div>
      <Footer />
    </section>
  );
}
