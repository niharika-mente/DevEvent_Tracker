"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

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
                : "text-white hover:text-cyan-400"
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
      </div>

      <button
        onClick={() => setOpen(!open)}
        className="md:hidden text-white cursor-pointer"
        aria-label="Toggle Menu"
        aria-expanded={open}
        aria-controls="mobile-menu"
      >
        {open ? <X size={26} /> : <Menu size={26} />}
      </button>

      {/* Mobile Menu */}
      {open && (
        <div
          id="mobile-menu"
          className="absolute top-full left-0 w-full bg-black border-t border-gray-800 md:hidden"
        >
          <div className="flex flex-col p-4 gap-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                aria-current={pathname === link.href ? "page" : undefined}
                className={`text-sm ${
                  pathname === link.href ? "text-cyan-400" : "text-white"
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
