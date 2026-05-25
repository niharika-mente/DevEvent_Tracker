"use client";

import { usePathname } from "next/navigation";

const PageTransition = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  return (
    <div key={pathname} className="page-enter min-w-0 w-full">
      {children}
    </div>
  );
};

export default PageTransition;
