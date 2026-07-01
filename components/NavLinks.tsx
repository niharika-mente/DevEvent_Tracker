"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

const links = [
  { name: "Home", href: "/" },
  { name: "Events", href: "/events" },
  { name: "Create Event", href: "/create-event" },
  { name: "My Bookings", href: "/my-bookings" },
  { name: "Watchlist", href: "/watchlist" },
];

export default function NavLinks() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop Menu */}
      <div className="hidden md:flex items-center gap-8">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setOpen(false)}
            aria-current={pathname === link.href ? "page" : undefined}
            className={`relative group text-sm cursor-pointer ${
              pathname === link.href
                ? "text-cyan-400"
                : "text-foreground/80 hover:text-cyan-600 dark:hover:text-cyan-400"
            }`}
          >
            {link.name}

            <span
              className={`absolute left-0 -bottom-1 h-[2px] bg-cyan-400 transition-all duration-300 ease-in-out ${
                pathname === link.href ? "w-full" : "w-0 group-hover:w-full"
              }`}
            />
          </Link>
        ))}
        <ThemeToggle />
      </div>

      <div className="flex items-center gap-2 md:hidden">
        <ThemeToggle />
        <button
          onClick={() => setOpen(!open)}
          className="flex size-9 cursor-pointer items-center justify-center rounded-full text-foreground hover:bg-accent"
          aria-label="Toggle navigation menu"
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div
          id="mobile-menu"
          className="absolute top-full left-0 w-full border-t border-border bg-background/98 shadow-lg md:hidden"
        >
          <div className="flex flex-col p-4 gap-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                aria-current={pathname === link.href ? "page" : undefined}
                className={`text-sm ${
                  pathname === link.href ? "text-cyan-600 dark:text-cyan-400" : "text-foreground"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
