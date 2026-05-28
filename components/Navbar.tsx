'use client';

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <header>
      <nav>
        <Link href='/' className="logo">
          <Image src="/icons/logo.png" alt="logo" width={24} height={24} />
          <p>DevEvent</p>
        </Link>

        <ul className="flex items-center gap-6">
          <Link href="/">Home</Link>
          <Link href="/">Events</Link>

          {isAuthenticated && user?.role === 'organizer' && (
            <Link href="/organizer/dashboard">Dashboard</Link>
          )}
          {isAuthenticated && user?.role === 'attender' && (
            <Link href="/attender/dashboard">Dashboard</Link>
          )}

          {!isLoading && (
            <>
              {!isAuthenticated ? (
                <>
                  <Link 
                    href="/auth"
                    className="text-light-100 transition-colors hover:text-blue"
                  >
                    Sign In
                  </Link>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">
                      {user?.role === 'organizer' ? 'Organizer' : 'Attender'} · {user?.email?.split('@')[0]}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-200 rounded transition-colors"
                  >
                    Logout
                  </button>
                </>
              )}
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;
