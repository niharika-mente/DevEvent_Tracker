import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import NavLinks from "./NavLinks";

const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-3 sm:px-4 sm:py-4">
        <Link href="/" className="flex min-w-0 shrink-0 items-center gap-2">
          <div className="relative h-6 w-6 shrink-0">
            <Image
              src="/icons/logo.png"
              alt="DevEvent logo"
              width={24}
              height={24}
              className="h-6 w-6 object-contain"
            />
          </div>
          <span className="truncate text-base font-bold text-foreground sm:text-lg">
            DevEvent
          </span>
        </Link>

        <Suspense fallback={null}>
          <NavLinks />
        </Suspense>
      </nav>
    </header>
  );
};

export default Navbar;
