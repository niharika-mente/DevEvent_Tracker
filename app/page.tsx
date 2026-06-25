import ExploreBtn from "@/components/ExploreBtn";
import EventCard from "@/components/EventCard";
import SearchFilters from "@/components/SearchFilters"; // Added missing import
import Footer from "@/components/Footer"; // Added missing import
import { IEvent } from "@/database";
import { cacheLife } from "next/cache";
import { getAllEvents } from "@/lib/actions/event.actions";

interface PageProps {
  searchParams: Promise<{
    query?: string;
    mode?: string;
    tag?: string;
  }>;
}

const Page = async ({ searchParams }: PageProps) => {
  
  // 1. Resolve search variables from the URL router interface
  const resolvedParams = await searchParams;

  // 2. Fixed Destructuring: Receives plain array directly from your updated action
  const events = await getAllEvents({
    query: resolvedParams.query,
    mode: resolvedParams.mode,
    tag: resolvedParams.tag,
  });

  return (
    <section>
     <h1 className="text-center drop-shadow-[0_6px_30px_rgba(0,0,0,0.7)]">The Hub for Every Dev <br /> Event You Can&apos;t Miss</h1>
      <p className="text-center mt-5 max-w-3xl mx-auto text-lg text-gray-200 leading-8 drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)]">Hackathons, Meetups, and Conferences, All in One Place</p>

      <ExploreBtn />

      {/* 3. Insert the newly generated Search and Filter component bar */}
      <div className="mt-12">
        <SearchFilters />
      </div>

      <div className="mt-20 space-y-7">
        <h3>Featured Events</h3>

        {/* 4. Display list layout conditionally or deliver clean placeholder states */}
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
           <div className="flex flex-col items-center justify-center text-center p-12 rounded-2xl max-w-xl mx-auto border border-cyan-500/20 bg-[#111827]/80 backdrop-blur-md shadow-lg">
            <h4 className="text-lg font-semibold text-white mb-2">No events found</h4>
            {/* Fixed Linting Error: Escaped the apostrophe here */}
            <p className="text-sm text-gray-300 max-w-xs leading-6">
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
