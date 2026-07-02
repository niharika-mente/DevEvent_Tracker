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
  }>;
}

const Page = async ({ searchParams }: PageProps) => {
  const resolvedParams = await searchParams;

  const { events } = await getAllEvents({
    query: resolvedParams.query,
    mode: resolvedParams.mode,
    tag: resolvedParams.tag,
  });

  return (
    <section>
      <h1 className="text-center">The Hub for Every Dev <br /> Event You Can&apos;t Miss</h1>
      <p className="text-center mt-5 cursor-pointer select-none">Hackathons, Meetups, and Conferences, All in One Place</p>

      <ExploreBtn />

      <div className="mt-10">
        <Suspense fallback={<div className="w-full h-16 animate-pulse rounded-xl bg-white/5" />}>
          <SearchFilters />
        </Suspense>
      </div>

      <div className="mt-20 space-y-7">
        <h3>Featured Events</h3>

        {events && events.length > 0 ? (
          <ul className="events">
            {events.map((event: IEvent) => (
              <li key={event._id as string} className="list-none">
                <EventCard {...event} />
              </li>
            ))}
          </ul>
        ) : (
          /* Smooth Contextual Empty State displayed dynamically */
          <div className="flex flex-col items-center justify-center text-center p-12 border border-dashed border-border rounded-2xl max-w-xl mx-auto bg-card/60">
            <h4 className="text-lg font-semibold text-foreground mb-1">No events found</h4>
            {/* Fixed Linting Error: Escaped the apostrophe here */}
            <p className="text-sm text-muted-foreground max-w-xs">
              We couldn&apos;t find any listings matching your search constraints. Try checking your spelling or adjusting filters.
            </p>
          </div>
        )}
      </div>
      <Footer />
    </section>
  )
}

export default Page;
