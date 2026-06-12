import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import NavLinks from "./NavLinks";

const Navbar = () => {
  return (
    <header>
      <nav className="flex items-center justify-between p-4">
        {" "}
        {/* Added basic layout classes if needed */}
        <Link href="/" className="logo flex items-center gap-2">
          <Image src="/icons/logo.png" alt="logo" width={24} height={24} />
          <p className="text-white font-bold">DevEvent</p>
        </Link>
        {/* Wrapping NavLinks in Suspense stops 'usePathname' from stalling 
          the static build of pages like /events/[slug]
        */}
        <Suspense
          fallback={
            <div className="text-gray-400 text-sm animate-pulse">
              Loading...
            </div>
          }
        >
          <NavLinks />
        </Suspense>
      </nav>
    </header>
  );
};

export default Navbar;
