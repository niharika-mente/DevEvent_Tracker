"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export default function BackToTop() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setVisible(window.scrollY > 200);
        };

        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    if (!visible) return null;

    return (
        <button
            onClick={scrollToTop}
            aria-label="Back to Top"
            className="
    fixed bottom-6 right-6 z-50
    p-3 rounded-full
    bg-[#00bcd4]
    text-white
    border border-cyan-400/40
    shadow-[0_0_20px_rgba(0,188,212,0.4)]
    hover:bg-[#00acc1]
    hover:shadow-[0_0_25px_rgba(0,188,212,0.6)]
    transition-all duration-300
  "
        >
            <ArrowUp size={20} />
        </button>
    );
}