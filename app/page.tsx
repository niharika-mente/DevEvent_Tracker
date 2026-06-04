import ExploreBtn from "@/components/ExploreBtn";
import EventCard from "@/components/EventCard";
import SearchFilters from "@/components/SearchFilters";
import Footer from "@/components/Footer";
import RecommendedFeed from "@/components/RecommendedFeed";
import { IEvent } from "@/database";
import { getAllEvents, getRecommendedEvents } from "@/lib/actions/event.actions";

interface PageProps {
  searchParams: Promise<{
    query?: string;
    mode?: string;
    tag?: string;
  }>;
}

export default async function Page({ searchParams }: PageProps) {
  // 1. Fetch general events
  const events = await getAllEvents();

  // 2. Target tags for recommendation
  const userInterestedTags = ["Next.js", "React", "Frontend", "Hackathon"];

  // 3. Fetch matching recommendations from the backend action
  const recommendedEvents = await getRecommendedEvents(userInterestedTags);

  // Filters for individual categories
  const hackathons = events.filter(
    (event: any) => event.tags?.includes("Hackathon")
  );

  const seminars = events.filter(
    (event: any) => event.tags?.includes("Seminar")
  );

  const internships = events.filter(
    (event: any) => event.tags?.includes("Internship")
  );

  const jobs = events.filter(
    (event: any) => event.tags?.includes("Job")
  );

  return (
    <section>
      <h1 className="text-center">
        The Hub for Every Dev <br /> Event You Can&apos;t Miss
      </h1>

      <p className="text-center mt-5">
        Hackathons, Meetups, and Conferences, All in One Place
      </p>

      <ExploreBtn />

      {/* Live Production Recommendation Feed Banner */}
      <RecommendedFeed events={recommendedEvents} userTags={userInterestedTags} />

      <div className="mt-10">
        <SearchFilters />
      </div>

      {events && events.length > 0 ? (
        <div className="mt-20 space-y-16">

          {/* Hackathons */}
          <section>
            <h3 className="mb-6">🔥 Hackathons</h3>
            <ul className="events">
              {hackathons.map((event: any) => (
                <li key={event._id} className="list-none">
                  <EventCard {...(event as IEvent)} />
                </li>
              ))}
            </ul>
          </section>

          {/* Seminars */}
          <section>
            <h3 className="mb-6">📚 Seminars</h3>
            <ul className="events">
              {seminars.map((event: any) => (
                <li key={event._id} className="list-none">
                  <EventCard {...(event as IEvent)} />
                </li>
              ))}
            </ul>
          </section>

          {/* Internships */}
          <section>
            <h3 className="mb-6">💼 Internships</h3>
            <ul className="events">
              {internships.map((event: any) => (
                <li key={event._id} className="list-none">
                  <EventCard {...(event as IEvent)} />
                </li>
              ))}
            </ul>
          </section>

          {/* Jobs */}
          <section>
            <h3 className="mb-6">🚀 Jobs</h3>
            <ul className="events">
              {jobs.map((event: any) => (
                <li key={event._id} className="list-none">
                  <EventCard {...(event as IEvent)} />
                </li>
              ))}
            </ul>
          </section>

        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center p-12 border border-dashed border-gray-300 rounded-2xl max-w-xl mx-auto bg-white/50 mt-20">
          <h4 className="text-lg font-semibold text-gray-800 mb-1">
            No events found
          </h4>

          <p className="text-sm text-gray-500 max-w-xs">
            We couldn&apos;t find any listings matching your search constraints.
            Try checking your spelling or adjusting filters.
          </p>
        </div>
      )}

      <Footer />
    </section>
  );
}