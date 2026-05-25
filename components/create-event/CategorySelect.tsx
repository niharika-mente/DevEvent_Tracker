"use client";

import { ChevronDown } from "lucide-react";

export const EVENT_CATEGORIES = [
  "Hackathon",
  "Meetup",
  "Conference",
  "Workshop",
  "Webinar",
] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number];

const inputClassName =
  "bg-dark-200 rounded-[6px] px-5 py-2.5 w-full text-foreground border border-transparent transition-all duration-200 hover:border-primary/30 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

interface CategorySelectProps {
  value: string;
  onChange: (value: string) => void;
}

const CategorySelect = ({ value, onChange }: CategorySelectProps) => {
  return (
    <div className="relative w-full">
      <select
        id="category"
        name="category"
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClassName} cursor-pointer appearance-none pr-11`}
      >
        <option value="" disabled>
          Select a category
        </option>
        {EVENT_CATEGORIES.map((category) => (
          <option
            key={category}
            value={category}
            className="bg-dark-100 text-foreground"
          >
            {category}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-light-200"
        aria-hidden
      />
    </div>
  );
};

export default CategorySelect;
