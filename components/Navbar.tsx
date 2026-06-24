import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import NavLinks from "./NavLinks";

const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-gray-800">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image
            src="/icons/logo.png"
            alt="logo"
            width={24}
            height={24}
          />
          <span className="text-white font-bold text-lg">
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