import ExploreBtn from "@/components/exploreBtn"
import EventCard from "@/components/EventCard"
import { events } from "@/lib/constants"

const page = () => {
  return (
    <section>
      <h1 className="text-center">The Hub for Every Dev<br /> Event that you Can't Miss</h1>
      <p className="text-center mt-5">Discover the best tech events, hackathons, and conferences around you.</p>
      <ExploreBtn />


      <div className="mt-20 space-y-7">
        <h3>Featured Events</h3>

        <ul className="events">
          {events.map((event) => (
            <li key={event.title}><EventCard {...event} /></li>
          ))}
        </ul>

      </div>
    </section>
  )
}

export default page