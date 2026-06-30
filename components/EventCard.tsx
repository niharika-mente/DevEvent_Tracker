"use client";

import { Bookmark } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { captureEvent } from "@/lib/posthog/helpers";
import { POSTHOG_EVENTS } from "@/lib/posthog/events";
import { saveBookmarks, useBookmarks } from "@/lib/use-bookmarks";

interface Props {
  title: string;
  image: string;
  location: string;
  date: string;
  time: string;
  slug: string;
}

const EventCard = ({ title, image, location, date, time, slug }: Props) => {
  const bookmarks = useBookmarks();
  const bookmarked = bookmarks.includes(slug);

  const toggleBookmark = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const isRemoving = bookmarks.includes(slug);
    const updated = isRemoving
      ? bookmarks.filter((item) => item !== slug)
      : [...bookmarks, slug];

    saveBookmarks(updated);
    captureEvent(
      isRemoving ? POSTHOG_EVENTS.EVENT_UNBOOKMARKED : POSTHOG_EVENTS.EVENT_BOOKMARKED,
      { slug, title },
    );
  };

  return (
    <Link
      href={`/events/${slug}`}
      onClick={() => captureEvent(POSTHOG_EVENTS.EVENT_VIEWED, { slug, title })}
      className="event-card group cursor-pointer overflow-hidden rounded-2xl border border-cyan-500/10 bg-card/70 transition-all duration-300 ease-out hover:-translate-y-2 hover:border-cyan-400/30 hover:bg-card hover:shadow-[0_0_25px_rgba(34,211,238,0.15)]"
    >
      <div className="overflow-hidden">
        <Image
          src={image}
          alt={title}
          width={410}
          height={300}
          className="poster transition-transform duration-500 group-hover:scale-105 group-hover:brightness-110"
        />
      </div>

      <div className="p-4">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={toggleBookmark}
            className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-accent hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={bookmarked ? `Remove ${title} from watchlist` : `Add ${title} to watchlist`}
            aria-pressed={bookmarked}
          >
            <Bookmark size={19} fill={bookmarked ? "currentColor" : "none"} aria-hidden="true" />
          </button>
        </div>

        <div className="mt-1 flex flex-row gap-2">
          <Image src="/icons/pin.svg" alt="" width={14} height={14} aria-hidden="true" />
          <p>{location}</p>
        </div>

        <p className="title transition-colors duration-300 group-hover:text-cyan-600 dark:group-hover:text-cyan-300">
          {title}
        </p>

        <div className="datetime mt-4">
          <div>
            <Image src="/icons/calendar.svg" alt="" width={14} height={14} aria-hidden="true" />
            <p>{date}</p>
          </div>
          <div>
            <Image src="/icons/clock.svg" alt="" width={14} height={14} aria-hidden="true" />
            <p>{time}</p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
