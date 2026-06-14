"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavLinks() {
  const pathname = usePathname();

  const navLinkClass = (href: string) =>
    `relative transition-all duration-300
     after:absolute after:left-0 after:-bottom-1
     after:h-[2px] after:bg-cyan-400
     after:transition-all after:duration-300
     ${pathname === href
      ? "text-cyan-400 after:w-full"
      : "text-white after:w-0 hover:text-cyan-400 hover:after:w-full"
    }`;

  return (
    <ul className="flex items-center gap-8 list-none">
      <li>
        <Link
          href="/"
          aria-current={pathname === "/" ? "page" : undefined}
          className={navLinkClass("/")}
        >
          Home
        </Link>
      </li>

      <li>
        <Link
          href="/events"
          aria-current={pathname === "/events" ? "page" : undefined}
          className={navLinkClass("/events")}
        >
          Events
        </Link>
      </li>

      <li>
        <Link
          href="/create-event"
          aria-current={pathname === "/create-event" ? "page" : undefined}
          className={navLinkClass("/create-event")}
        >
          Create Event
        </Link>
      </li>

      <li>
        <Link
          href="/my-bookings"
          aria-current={pathname === "/my-bookings" ? "page" : undefined}
          className={navLinkClass("/my-bookings")}
        >
          My Bookings
        </Link>
      </li>
      <li>
        <Link
          href="/watchlist"
          aria-current={pathname === "/watchlist" ? "page" : undefined}
          className={navLinkClass("/watchlist")}
        >
          Watchlist
        </Link>
      </li>
    </ul>
  );
}
