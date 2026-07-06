"use client";

import { CalendarDays, MapPin } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { deleteBooking, getBookingsByEmail } from "@/lib/actions/booking.actions";

interface BookingEvent {
  title: string;
  description?: string;
  date?: string;
  location?: string;
  venue?: string;
  mode?: string;
}

interface BookingRecord {
  _id: string;
  eventId: BookingEvent | null;
}

function generateGoogleCalendarLink(event: BookingEvent) {
  const baseUrl = "https://calendar.google.com/calendar/render?action=TEMPLATE";
  const eventDate = event.date ? new Date(event.date) : new Date();
  if (Number.isNaN(eventDate.getTime())) return "#";

  const endDate = new Date(eventDate.getTime() + 2 * 60 * 60 * 1000);
  const formatDate = (date: Date) => date.toISOString().replace(/-|:|\.\d{3}/g, "");
  const params = new URLSearchParams({
    text: event.title || "Tech Event",
    dates: `${formatDate(eventDate)}/${formatDate(endDate)}`,
    details: event.description || "DevEvent registration",
    location: event.location || event.venue || "Online",
  });

  return `${baseUrl}&${params.toString()}`;
}

export default function MyBookingsPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [activeBookingId, setActiveBookingId] = useState<string | null>(null);

  const handleFetchRegistrations = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim()) return;
    setLoading(true);

    try {
      const response = await getBookingsByEmail(email);
      if (!response.success) throw new Error(response.error);
      setBookings((response.bookings || []) as BookingRecord[]);
      setAuthenticated(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (!activeBookingId) return;
    setLoading(true);

    try {
      const response = await deleteBooking(activeBookingId);
      if (!response.success) throw new Error(response.error);
      setBookings((current) => current.filter((booking) => booking._id !== activeBookingId));
      toast.success("Registration cancelled.");
      setActiveBookingId(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not cancel the booking.");
    } finally {
      setLoading(false);
    }
  };

  const resetAccount = () => {
    setAuthenticated(false);
    setEmail("");
    setBookings([]);
  };

  return (
    <section className="mx-auto min-h-[70vh] w-full max-w-6xl py-12">
      {!authenticated ? (
        <div className="mx-auto my-16 max-w-md space-y-6 rounded-2xl border border-border bg-card p-8 text-card-foreground shadow-sm">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">My Bookings</h1>
            <p className="text-sm text-muted-foreground">Enter your email address to view and manage your event registrations.</p>
          </div>
          <form onSubmit={handleFetchRegistrations} className="space-y-4">
            <label htmlFor="bookings-email" className="sr-only">Email address</label>
            <input
              id="bookings-email"
              type="email"
              required
              autoComplete="email"
              placeholder="developer@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Loading bookings…" : "View My Bookings"}
            </button>
          </form>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex flex-col items-start justify-between gap-4 border-b border-border pb-4 md:flex-row md:items-center">
            <div>
              <h1 className="text-3xl font-bold">Your Bookings</h1>
              <p className="mt-1 text-sm text-muted-foreground">Registrations associated with <span className="font-medium text-foreground">{email}</span></p>
            </div>
            <button type="button" onClick={resetAccount} className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:bg-accent hover:text-accent-foreground">
              Switch Account
            </button>
          </div>

          {bookings.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {bookings.map((booking) => {
                const event = booking.eventId;
                if (!event) return null;
                return (
                  <article key={booking._id} className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className="rounded-full bg-accent px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-accent-foreground">{event.mode || "Confirmed"}</span>
                        <span className="font-mono text-xs text-muted-foreground">ID: {booking._id.slice(-6)}</span>
                      </div>
                      <h2 className="line-clamp-2 text-base font-bold">{event.title}</h2>
                      {event.description && <p className="line-clamp-2 text-xs text-muted-foreground">{event.description}</p>}
                      <div className="space-y-2 border-t border-border pt-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2"><CalendarDays className="size-4" aria-hidden="true" /><span>{event.date ? new Date(event.date).toLocaleDateString() : "TBD"}</span></div>
                        <div className="flex items-center gap-2"><MapPin className="size-4" aria-hidden="true" /><span className="line-clamp-1">{event.location || event.venue || "Online"}</span></div>
                      </div>
                    </div>
                    <div className="mt-5 flex items-center gap-2 border-t border-border pt-3">
                      <a href={generateGoogleCalendarLink(event)} target="_blank" rel="noopener noreferrer" className="flex-1 rounded-lg border border-border bg-secondary py-2 text-center text-xs font-medium text-secondary-foreground transition hover:bg-accent">
                        Add to Calendar
                      </a>
                      <button type="button" onClick={() => setActiveBookingId(booking._id)} className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700 transition hover:bg-red-100 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-950/70">
                        Cancel
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="mx-auto max-w-xl rounded-2xl border border-dashed border-border bg-card/60 py-16 text-center">
              <h2 className="text-base font-semibold">No active bookings found</h2>
              <p className="mx-auto mt-1 max-w-xs text-xs text-muted-foreground">You haven&apos;t signed up for any events with this email yet.</p>
            </div>
          )}
        </div>
      )}

      {activeBookingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-xs" role="presentation" onMouseDown={() => setActiveBookingId(null)}>
          <div role="alertdialog" aria-modal="true" aria-labelledby="cancel-title" aria-describedby="cancel-description" className="w-full max-w-sm space-y-4 rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-xl" onMouseDown={(event) => event.stopPropagation()}>
            <h2 id="cancel-title" className="text-base font-bold">Cancel Registration</h2>
            <p id="cancel-description" className="text-xs text-muted-foreground">Are you sure? This permanently removes your booking.</p>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" disabled={loading} onClick={() => setActiveBookingId(null)} className="rounded-lg px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:bg-accent">Keep Booking</button>
              <button type="button" disabled={loading} onClick={handleCancelRegistration} className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-50">{loading ? "Cancelling…" : "Cancel Booking"}</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
