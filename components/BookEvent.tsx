'use client';

import { useState } from "react";
import { createBooking } from "@/lib/actions/booking.actions";
import posthog from "posthog-js";

const BookEvent = ({ eventId, slug }: { eventId: string, slug: string; }) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await createBooking({ eventId, slug, email });

      if (response.success) {
        setSubmitted(true);
        posthog.capture('event_booked', { eventId, slug, email });
      } else {
        setError(response.error || "An unexpected error occurred. Please try again.");
        posthog.captureException('Booking creation failed');
      }
    } catch (err) {
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
              disabled={isSubmitting} // 1. Freeze input when submitting
            />
            {/* 2. Show the red error message under the input if an error occurs */}
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>

          {/* 3. Disable the button and change text dynamically */}
          <button type="submit" className="button-submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </form>
      )}
    </div>
  )
}

export default BookEvent;
