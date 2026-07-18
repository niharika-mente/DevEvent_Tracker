'use client';

import { useEffect, useMemo, useState } from "react";
import { captureEvent } from "@/lib/posthog/helpers";
import { POSTHOG_EVENTS } from "@/lib/posthog/events";

type Availability = {
    eventId: string;
    capacity: number;
    confirmedSeats: number;
    lockedSeats: number;
    availableSeats: number;
    serverTime: string;
};

const BookEvent = ({ eventId, slug }: { eventId: string; slug: string }) => {
    const [email, setEmail] = useState('');
    const [seats, setSeats] = useState(1);

    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [availability, setAvailability] = useState<Availability | null>(null);
    const [lockId, setLockId] = useState<string | null>(null);
    const [lockExpiresAt, setLockExpiresAt] = useState<string | null>(null);

    // Poll availability every 3 seconds
    useEffect(() => {
        let cancelled = false;
        let timer: NodeJS.Timeout;

        const fetchAvailability = async () => {
            try {
                const res = await fetch(`/api/events/${eventId}/availability`, {
                    method: "GET",
                    cache: "no-store",
                });

                const data = await res.json();
                if (!res.ok) return;

                if (!cancelled) {
                    setAvailability(data);
                }
            } catch {
                // silent polling failure
            }
        };

        fetchAvailability();
        timer = setInterval(fetchAvailability, 3000);

        return () => {
            cancelled = true;
            clearInterval(timer);
        };
    }, [eventId]);

    const secondsLeft = useMemo(() => {
        if (!lockExpiresAt) return 0;
        const diff = new Date(lockExpiresAt).getTime() - Date.now();
        return Math.max(0, Math.floor(diff / 1000));
    }, [lockExpiresAt, availability?.serverTime]);

    useEffect(() => {
        if (lockId && secondsLeft <= 0) {
            setLockId(null);
            setLockExpiresAt(null);
            setMessage("Your lock expired. Please lock seats again.");
        }
    }, [lockId, secondsLeft]);

    const handleLockSeats = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim()) {
            setError("Please enter your email address.");
            return;
        }

        if (seats < 1) {
            setError("Seats must be at least 1.");
            return;
        }

        setIsSubmitting(true);
        setError(null);
        setMessage(null);

        try {
            const res = await fetch(`/api/events/${eventId}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "lock",
                    email: email.trim().toLowerCase(),
                    seats,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data?.message || "Failed to lock seats.");
                captureEvent(POSTHOG_EVENTS.BOOKING_FAILED, { eventId, slug });
                return;
            }

            setLockId(data.lockId);
            setLockExpiresAt(data.lockExpiresAt);
            if (data.availability) setAvailability((prev) => ({ ...(prev as any), ...data.availability }));
            setMessage("Seats locked for 10 minutes. Confirm to finalize booking.");
        } catch {
            setError("A network error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleConfirmBooking = async () => {
        if (!lockId) return;

        setIsSubmitting(true);
        setError(null);
        setMessage(null);

        try {
            const res = await fetch(`/api/events/${eventId}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "confirm",
                    email: email.trim().toLowerCase(),
                    lockId,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data?.message || "Failed to confirm booking.");
                captureEvent(POSTHOG_EVENTS.BOOKING_FAILED, { eventId, slug });
                return;
            }

            setSubmitted(true);
            setLockId(null);
            setLockExpiresAt(null);
            if (data.availability) setAvailability((prev) => ({ ...(prev as any), ...data.availability }));

            captureEvent(POSTHOG_EVENTS.EVENT_BOOKED, { eventId, slug });
        } catch {
            setError("A network error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReleaseLock = async () => {
        if (!lockId) return;

        setIsSubmitting(true);
        setError(null);
        setMessage(null);

        try {
            const res = await fetch(`/api/events/${eventId}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "release",
                    email: email.trim().toLowerCase(),
                    lockId,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data?.message || "Failed to release lock.");
                return;
            }

            setLockId(null);
            setLockExpiresAt(null);
            if (data.availability) setAvailability((prev) => ({ ...(prev as any), ...data.availability }));
            setMessage("Lock released.");
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
                <form onSubmit={handleLockSeats}>
                    <div>
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            id="email"
                            placeholder="Enter your email address"
                            required
                            disabled={isSubmitting || !!lockId}
                        />
                    </div>

                    <div className="mt-2">
                        <label htmlFor="seats">Seats</label>
                        <input
                            id="seats"
                            type="number"
                            min={1}
                            value={seats}
                            onChange={(e) => setSeats(Number(e.target.value))}
                            disabled={isSubmitting || !!lockId}
                        />
                    </div>

                    {availability && (
                        <div className="text-xs mt-2">
                            <p className="text-green-700">Available: {availability.availableSeats}</p>
                            <p className="text-yellow-700">Locked: {availability.lockedSeats}</p>
                            <p className="text-red-700">Booked: {availability.confirmedSeats}</p>
                        </div>
                    )}

                    {lockId && (
                        <p className="text-amber-700 text-xs mt-2">
                            Lock expires in {Math.floor(secondsLeft / 60)}m {secondsLeft % 60}s
                        </p>
                    )}

                    {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
                    {message && <p className="text-blue-600 text-xs mt-2">{message}</p>}

                    {!lockId ? (
                        <button
                            type="submit"
                            className="button-submit mt-3"
                            disabled={
                                isSubmitting ||
                                seats < 1 ||
                                !email.trim() ||
                                (availability ? seats > availability.availableSeats : false)
                            }
                        >
                            {isSubmitting ? "Locking..." : "Lock Seats"}
                        </button>
                    ) : (
                        <div className="mt-3 flex gap-2">
                            <button
                                type="button"
                                className="button-submit"
                                onClick={handleConfirmBooking}
                                disabled={isSubmitting || secondsLeft <= 0}
                            >
                                {isSubmitting ? "Confirming..." : "Confirm Booking"}
                            </button>

                            <button
                                type="button"
                                className="button-submit"
                                onClick={handleReleaseLock}
                                disabled={isSubmitting}
                            >
                                Release Lock
                            </button>
                        </div>
                    )}
                </form>
            )}
        </div>
    );
};

export default BookEvent;