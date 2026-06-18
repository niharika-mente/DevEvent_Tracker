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
    handleScroll(); // ✅ Fix for mount visibility

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
      title="Scroll to top"
      className="
    fixed bottom-6 right-6 z-50
    p-3 rounded-full
    bg-primary text-black
    border border-primary
    card-shadow
    hover:bg-primary/90
    hover:scale-110
    transition-all duration-300
    focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
  "
    >
      <ArrowUp size={20} className="h-5 w-5" />
    </button>
  );
}
