'use client';

import React from 'react';
import EventCard from './EventCard'; 
import { IEvent } from "@/database"; // Safe typing using your existing interface

interface RecommendedFeedProps {
  events: IEvent[];
  userTags: string[];
}

export default function RecommendedFeed({ events, userTags }: RecommendedFeedProps) {
  // Gracefully hide the section if no recommended events match the tags in the database
  if (!events || events.length === 0) {
    return null;
  }

  return (
    <div className="my-10 px-4 max-w-7xl mx-auto">
      <div className="flex flex-col mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          ✨ Events You Might Like
        </h2>
        <p className="text-sm text-neutral-400 mt-1">
          Recommended based on your interest in: <span className="text-gray-200 font-medium">{userTags.join(', ')}</span>
        </p>
      </div>

      {/* Responsive Grid matching your site structure */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <div key={event._id} className="list-none">
            {/* Spreading the event object safely matching your home page pattern */}
            <EventCard {...(event as IEvent)} />
          </div>
        ))}
      </div>
    </div>
  );
}