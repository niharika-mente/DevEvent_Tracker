'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import EventCard from '@/components/EventCard';
import type { IEvent } from '@/database';

export default function AttenderDashboard() {
    const router = useRouter();
    const { user, isLoading, isAuthenticated, hasRole } = useAuth();
    const [events, setEvents] = useState<IEvent[]>([]);
    const [joinedEvents, setJoinedEvents] = useState<IEvent[]>([]);
    const [isLoadingEvents, setIsLoadingEvents] = useState(true);
    const [error, setError] = useState<string>('');

    // Redirect if not authenticated or not an attender
    useEffect(() => {
        if (!isLoading && (!isAuthenticated || !hasRole('attender'))) {
            router.push('/auth/login');
        }
    }, [isLoading, isAuthenticated, hasRole, router]);

    // Fetch events
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await fetch('/api/events');
                const data = await response.json();

                if (data.events) {
                    const normalizedEvents = data.events as IEvent[];
                    const myUserId = user?._id;
                    const joined = normalizedEvents.filter((event) =>
                        (event.attendees ?? []).some((attendeeId) => attendeeId?.toString?.() === myUserId)
                    );
                    const available = normalizedEvents.filter((event) =>
                        !(event.attendees ?? []).some((attendeeId) => attendeeId?.toString?.() === myUserId)
                    );

                    setJoinedEvents(joined);
                    setEvents(available);
                } else {
                    setError('Failed to fetch events');
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setIsLoadingEvents(false);
            }
        };

        if (isAuthenticated && user?._id) {
            fetchEvents();
        }
    }, [isAuthenticated, user?._id]);

    if (isLoading) {
        return (
            <section className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-400">Loading...</p>
                </div>
            </section>
        );
    }

    return (
        <section className="min-h-screen py-10 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-10">
                    <h1 className="text-4xl font-bold mb-2">
                        Welcome, {user?.email?.split('@')[0]}!
                    </h1>
                    <p className="text-gray-400">
                        Browse and register for amazing developer events
                    </p>
                </div>

                {/* Error message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded text-red-200">
                        {error}
                    </div>
                )}

                {/* Events Grid */}
                <div className="space-y-7">
                    <div className="space-y-4">
                        <h2 className="text-2xl font-semibold">Joined Events</h2>

                        {joinedEvents.length > 0 ? (
                            <ul className="events">
                                {joinedEvents.map((event: IEvent) => (
                                    <li key={event._id as string} className="list-none">
                                        <EventCard {...event} />
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-400">You have not joined any events yet.</p>
                        )}
                    </div>

                    <h2 className="text-2xl font-semibold">Available Events</h2>

                    {isLoadingEvents ? (
                        <div className="flex justify-center py-10">
                            <p className="text-gray-400">Loading events...</p>
                        </div>
                    ) : events.length > 0 ? (
                        <ul className="events">
                            {events.map((event: IEvent) => (
                                <li key={event._id as string} className="list-none">
                                    <EventCard {...event} />
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-gray-400">No events available yet</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
