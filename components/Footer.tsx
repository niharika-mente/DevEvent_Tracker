"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const Footer = () => {
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="mt-20 border-t border-border p-6">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="logo-footer flex items-center gap-2">
            <img src="/icons/logo.png" alt="logo" width={28} height={28} />
            <span className="font-semibold">DevEvent</span>
          </Link>
          <p className="text-light-200 text-sm hidden sm:block">Connecting developers to the events that matter.</p>
        </div>

        <nav className="flex gap-4">
          <Link href="/">Home</Link>
          <Link href="/events">Events</Link>
          <Link href="/create">Create</Link>
          <a href="/rss.xml">RSS</a>
        </nav>

        <div className="text-sm text-light-200">© {year} DevEvent</div>
      </div>
    </footer>
  );
};

export default Footer;
