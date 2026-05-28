'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import type { IEvent } from '@/database';

export default function OrganizerDashboard() {
    const router = useRouter();
    const { user, isLoading, isAuthenticated, hasRole } = useAuth();
    const [organizedEvents, setOrganizedEvents] = useState<IEvent[]>([]);
    const [isLoadingEvents, setIsLoadingEvents] = useState(true);
    const [error, setError] = useState<string>('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingSlug, setEditingSlug] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({
        title: '',
        overview: '',
        date: '',
        time: '',
        location: '',
        mode: 'online',
    });
    const [attendeeMap, setAttendeeMap] = useState<Record<string, { _id?: string; email: string; firstName?: string; lastName?: string }[]>>({});

    // Redirect if not authenticated or not an organizer
    useEffect(() => {
        if (!isLoading && (!isAuthenticated || !hasRole('organizer'))) {
            router.push('/auth/login');
        }
    }, [isLoading, isAuthenticated, hasRole, router]);

    // Fetch organizer's events
    useEffect(() => {
        const fetchOrganizerEvents = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const response = await fetch('/api/events', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                const data = await response.json();

                if (data.events) {
                    // Filter events for current organizer
                    const myEvents = data.events.filter(
                        (event: IEvent) => event.organizerId === user?._id
                    );
                    setOrganizedEvents(myEvents);
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
            fetchOrganizerEvents();
        }
    }, [isAuthenticated, user?._id]);

    const startEditing = (event: IEvent) => {
        setEditingSlug(event.slug);
        setEditForm({
            title: event.title,
            overview: event.overview,
            date: event.date,
            time: event.time,
            location: event.location,
            mode: event.mode,
        });
    };

    const cancelEditing = () => {
        setEditingSlug(null);
    };

    const saveEvent = async (slug: string) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`/api/events/${slug}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(editForm),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || 'Failed to update event');
            }

            setOrganizedEvents((currentEvents) =>
                currentEvents.map((event) =>
                    event.slug === slug ? { ...event, ...data.event } : event
                )
            );
            setEditingSlug(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        }
    };

    const deleteEvent = async (slug: string) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`/api/events/${slug}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || 'Failed to delete event');
            }

            setOrganizedEvents((currentEvents) =>
                currentEvents.filter((event) => event.slug !== slug)
            );
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        }
    };

    const toggleAttendees = async (slug: string) => {
        if (attendeeMap[slug]) {
            setAttendeeMap((current) => {
                const next = { ...current };
                delete next[slug];
                return next;
            });
            return;
        }

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`/api/events/${slug}/attendees`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || 'Failed to fetch attendees');
            }

            setAttendeeMap((current) => ({
                ...current,
                [slug]: data.attendees ?? [],
            }));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        }
    };

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
                <div className="mb-10 flex justify-between items-start">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">
                            Organizer Dashboard
                        </h1>
                        <p className="text-gray-400">
                            Manage your events and connect with attendees
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCreateForm(!showCreateForm)}
                        className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 px-6 rounded transition-colors"
                    >
                        {showCreateForm ? 'Cancel' : '+ Create Event'}
                    </button>
                </div>

                {/* Create Event Form Preview */}
                {showCreateForm && (
                    <div className="mb-10 p-6 bg-gray-900/50 border border-gray-800 rounded-lg">
                        <h2 className="text-2xl font-semibold mb-4">Create New Event</h2>
                        <p className="text-gray-400 mb-4">
                            Event creation form will be implemented here. For now, use the event creation API or the home page form.
                        </p>
                        <Link
                            href="/"
                            className="inline-block bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 px-6 rounded transition-colors"
                        >
                            Go to Event Creation
                        </Link>
                    </div>
                )}

                {/* Error message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded text-red-200">
                        {error}
                    </div>
                )}

                {/* Events Grid */}
                <div className="space-y-7">
                    <h2 className="text-2xl font-semibold">Your Events</h2>

                    {isLoadingEvents ? (
                        <div className="flex justify-center py-10">
                            <p className="text-gray-400">Loading events...</p>
                        </div>
                    ) : organizedEvents.length > 0 ? (
                        <div className="grid gap-6">
                            {organizedEvents.map((event: IEvent) => (
                                <div
                                    key={event._id as string}
                                    className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 hover:border-cyan-500/50 transition-colors"
                                >
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex-1">
                                            {editingSlug === event.slug ? (
                                                <div className="space-y-3">
                                                    <input
                                                        value={editForm.title}
                                                        onChange={(e) => setEditForm((current) => ({ ...current, title: e.target.value }))}
                                                        className="w-full rounded bg-gray-800 px-3 py-2 text-white"
                                                    />
                                                    <textarea
                                                        value={editForm.overview}
                                                        onChange={(e) => setEditForm((current) => ({ ...current, overview: e.target.value }))}
                                                        className="w-full rounded bg-gray-800 px-3 py-2 text-white"
                                                    />
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <input
                                                            value={editForm.date}
                                                            onChange={(e) => setEditForm((current) => ({ ...current, date: e.target.value }))}
                                                            className="rounded bg-gray-800 px-3 py-2 text-white"
                                                        />
                                                        <input
                                                            value={editForm.time}
                                                            onChange={(e) => setEditForm((current) => ({ ...current, time: e.target.value }))}
                                                            className="rounded bg-gray-800 px-3 py-2 text-white"
                                                        />
                                                        <input
                                                            value={editForm.location}
                                                            onChange={(e) => setEditForm((current) => ({ ...current, location: e.target.value }))}
                                                            className="rounded bg-gray-800 px-3 py-2 text-white"
                                                        />
                                                        <select
                                                            value={editForm.mode}
                                                            onChange={(e) => setEditForm((current) => ({ ...current, mode: e.target.value }))}
                                                            className="rounded bg-gray-800 px-3 py-2 text-white"
                                                        >
                                                            <option value="online">online</option>
                                                            <option value="offline">offline</option>
                                                            <option value="hybrid">hybrid</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <h3 className="text-xl font-semibold text-white mb-2">
                                                        {event.title}
                                                    </h3>
                                                    <p className="text-gray-400 mb-3">{event.overview}</p>
                                                    <div className="flex gap-4 text-sm text-gray-500">
                                                        <span>{event.date}</span>
                                                        <span>{event.location}</span>
                                                        <span>{event.mode}</span>
                                                        <span>{(event.attendees ?? []).length} attendees</span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            {editingSlug === event.slug ? (
                                                <>
                                                    <button
                                                        onClick={() => saveEvent(event.slug)}
                                                        className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded transition-colors"
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        onClick={cancelEditing}
                                                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => startEditing(event)}
                                                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded transition-colors"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => deleteEvent(event.slug)}
                                                        className="px-4 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-200 rounded transition-colors"
                                                    >
                                                        Delete
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <button
                                            onClick={() => toggleAttendees(event.slug)}
                                            className="text-sm text-cyan-300 hover:text-cyan-200"
                                        >
                                            {attendeeMap[event.slug] ? 'Hide attendees' : 'Manage attendees'}
                                        </button>
                                        {attendeeMap[event.slug] && (
                                            <ul className="mt-3 space-y-2 text-sm text-gray-300">
                                                {attendeeMap[event.slug].length > 0 ? (
                                                    attendeeMap[event.slug].map((attendee) => (
                                                        <li key={attendee._id || attendee.email}>
                                                            {attendee.firstName || attendee.email} {attendee.lastName || ''}
                                                        </li>
                                                    ))
                                                ) : (
                                                    <li>No attendees yet.</li>
                                                )}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-gray-400 mb-4">You haven&apos;t created any events yet</p>
                            <button
                                onClick={() => setShowCreateForm(true)}
                                className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 px-6 rounded transition-colors"
                            >
                                Create Your First Event
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
