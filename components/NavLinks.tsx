"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {/* Desktop Menu */}
      <div className="hidden items-center gap-8 md:flex">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setOpen(false)}
            aria-current={pathname === link.href ? "page" : undefined}
            className={`group relative cursor-pointer text-sm ${
              pathname === link.href
                ? "text-cyan-400"
                : "text-foreground/80 hover:text-cyan-600 dark:hover:text-cyan-400"
            }`}
          >
            {link.name}

            <span
              className={`absolute left-0 -bottom-1 h-0.5 bg-cyan-400 transition-all duration-300 ease-in-out ${
                pathname === link.href ? "w-full" : "w-0 group-hover:w-full"
              }`}
            />
          </Link>
        ))}
        <ThemeToggle />
      </div>

      <div className="relative flex items-center gap-2 md:hidden">
        <div className="shrink-0">
          <ThemeToggle />
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-foreground transition-colors hover:bg-accent"
          aria-label="Toggle navigation menu"
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Menu */}
        {open && (
          <>
            <div
              aria-hidden="true"
              className="fixed inset-0 z-80 bg-black/10 backdrop-blur-[1px] md:hidden"
              onClick={() => setOpen(false)}
            />
            <div
              id="mobile-menu"
              className="fixed right-3 top-16 z-90 w-[min(100%,18rem)] rounded-xl border border-border bg-background/95 p-2 shadow-xl backdrop-blur-md md:hidden"
            >
              <div className="flex flex-col gap-1">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    aria-current={pathname === link.href ? "page" : undefined}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium whitespace-normal wrap-break-word transition-colors duration-200 ${
                      pathname === link.href
                        ? "bg-cyan-50 text-cyan-600 dark:bg-cyan-950/40 dark:text-cyan-400"
                        : "text-foreground hover:bg-accent hover:text-cyan-600 dark:hover:text-cyan-400"
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
