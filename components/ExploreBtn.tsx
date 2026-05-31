'use client';

import Image from "next/image";

const ExploreBtn = () => {
    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        const target = document.querySelector('#events');
        if (target) {
            (target as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    return (
        <button
            type="button"
            id="explore-btn"
            className="mt-7 mx-auto transform-gpu transition-transform hover:scale-105 active:scale-95"
            onClick={handleClick}
            aria-label="Explore Events"
        >
            <a href="#events" onClick={(e) => e.preventDefault()}>
                Explore Events
                <Image src="/icons/arrow-down.svg" alt="arrow-down" width={24} height={24} />
            </a>
        </button>
    )
}

export default ExploreBtn
