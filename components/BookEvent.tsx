'use client';

import { useState } from "react";
import { createBooking } from "@/lib/actions/booking.actions";
import { captureEvent } from "@/lib/posthog/helpers";
import { POSTHOG_EVENTS } from "@/lib/posthog/events";

const BookEvent = ({ eventId, slug }: { eventId: string; slug: string }) => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim()) {
            setError("Please enter your email address.");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const response = await createBooking({ eventId, slug, email });

            if (response.success) {
                setSubmitted(true);
                // Do not send raw email (PII) to analytics.
                captureEvent(POSTHOG_EVENTS.EVENT_BOOKED, { eventId, slug });
            } else {
                setError(response.error || "An unexpected error occurred. Please try again.");
                captureEvent(POSTHOG_EVENTS.BOOKING_FAILED, { eventId, slug });
            }
        } catch {
            setError("A network error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div id="book-event">
            {submitted ? (
                <p className="text-sm">Thank you for signing up!</p>
            ) : (
                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            id="email"
                            placeholder="Enter your email address"
                            required
                            disabled={isSubmitting}
                        />
                        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
                    </div>

                    <button type="submit" className="button-submit" disabled={isSubmitting}>
                        {isSubmitting ? "Submitting..." : "Submit"}
                    </button>
                </form>
            )}
        </div>
    );
};

export default BookEvent;
