"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <header>
      <nav>
        <div className="flex items-center gap-4">
          <Link href="/" className="logo">
            <Image src="/icons/logo.png" alt="logo" width={24} height={24} />
            <p>DevEvent</p>
          </Link>
        </div>

        <button
          aria-label="Toggle menu"
          onClick={() => setOpen(!open)}
          className="sm:hidden p-2 rounded-md"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <ul className={`sm:flex items-center gap-6 ${open ? "flex flex-col mt-3 sm:mt-0" : "hidden sm:flex"}`}>
          <li><Link href="/">Home</Link></li>
          <li><Link href="/events">Events</Link></li>
          <li><Link href="/create">Create Event</Link></li>
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;