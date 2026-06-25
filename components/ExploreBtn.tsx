'use client';

import Image from "next/image";

const ExploreBtn = () => {
  return (
    <a
      href="/events"
      className="
        group
        mt-7 mx-auto
        flex items-center gap-2
        w-fit
        px-6 py-3
        rounded-full
        bg-cyan-500/10
        border border-cyan-400/20
        transition-all duration-300
        hover:scale-105
        hover:bg-cyan-500/20
        hover:shadow-[0_0_20px_rgba(34,211,238,0.2)]">
      <span>Explore Events</span>

      <Image
        src="/icons/arrow-down.svg"
        alt="arrow-down"
        width={20}
        height={20}
        className="transition-transform duration-300 group-hover:translate-y-1"
      />
    </a>
  )
}

export default ExploreBtn
