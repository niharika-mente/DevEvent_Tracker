'use client';

import {useState} from "react";
import {createBooking} from "@/lib/actions/booking.actions";
import posthog from "posthog-js";
import { useAuth } from "@/lib/hooks/useAuth";

const BookEvent = ({ eventId, slug }: { eventId: string, slug: string;}) => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user, isAuthenticated, hasRole } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        if (isAuthenticated && hasRole('attender')) {
            try {
                const token = localStorage.getItem('authToken');
                const response = await fetch(`/api/events/${slug}/attendees`, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || data.message || 'Failed to join event');
                }

                setSubmitted(true);
                posthog.capture('event_joined', { eventId, slug, userId: user?._id });
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to join event');
                posthog.captureException(err);
            } finally {
                setIsSubmitting(false);
            }

            return;
        }

        const { success, error: bookingError } = await createBooking({ eventId, slug, email });

        if(success) {
            setSubmitted(true);
            posthog.capture('event_booked', { eventId, slug, email })
        } else {
            setError(bookingError || 'Booking creation failed');
            posthog.captureException(bookingError || 'Booking creation failed')
        }

        setIsSubmitting(false);
    }

    return (
        <div id="book-event">
            {submitted ? (
                <p className="text-sm">Thank you for signing up!</p>
            ): (
                <form onSubmit={handleSubmit}>
                    {!isAuthenticated || !hasRole('attender') ? (
                        <div>
                            <label htmlFor="email">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                id="email"
                                placeholder="Enter your email address"
                            />
                        </div>
                    ) : (
                        <p className="text-sm text-light-100">
                            Register instantly as {user?.email}.
                        </p>
                    )}

                    {error && <p className="text-sm text-red-300">{error}</p>}

                    <button type="submit" className="button-submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Submitting...' : isAuthenticated && hasRole('attender') ? 'Join Event' : 'Submit'}
                    </button>
                </form>
            )}
        </div>
    )
}
export default BookEvent
