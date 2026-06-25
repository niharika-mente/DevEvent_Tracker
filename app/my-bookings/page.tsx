'use client';

import { useState } from 'react';
import { getBookingsByEmail, deleteBooking } from '@/lib/actions/booking.actions';

export default function MyBookingsPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeBookingId, setActiveBookingId] = useState<string | null>(null);

  // Fetch registered events triggered by user submission setup
  const handleFetchRegistrations = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);

    const response = await getBookingsByEmail(email);
    setLoading(false);
    if (response.success) {
      setBookings(response.bookings || []);
      setAuthenticated(true);
    } else {
      alert(response.error || 'Failed to authenticate profile. Please try again.');
    }
  };

  // Triggers cancellation pipeline
  const handleCancelRegistration = async () => {
    if (!activeBookingId) return;
    setLoading(true);
    
    const response = await deleteBooking(activeBookingId);
    setLoading(false);
    setModalOpen(false);
    setActiveBookingId(null);

    if (response.success) {
      // Instantly clear layout index matching the dropped booking
      setBookings(prev => prev.filter(b => b._id !== activeBookingId));
      alert('Registration successfully revoked.');
    } else {
      alert(response.error || 'Could not process cancellation.');
    }
  };

  // Helper utility function building custom preset links to export event configurations to Google Calendar
  const generateGoogleCalendarLink = (event: any) => {
    if (!event) return '#';
    const baseUrl = 'https://google.com';
    const text = encodeURIComponent(event.title || 'Tech Event');
    
    // Convert sample date formats or default to modern ranges safely
    const eventDate = event.date ? new Date(event.date) : new Date();
    const startTime = eventDate.toISOString().replace(/-|:|\.\d\d\d/g, "");
    eventDate.setHours(eventDate.getHours() + 2); // Set arbitrary 2 hour runtime block
    const endTime = eventDate.toISOString().replace(/-|:|\.\d\d\d/g, "");
    
    const dates = `${startTime}/${endTime}`;
    const details = encodeURIComponent(event.description || 'Dev registration event.');
    const location = encodeURIComponent(event.location || event.venue || 'Online/Specified Venue');
    
    return `${baseUrl}&text=${text}&dates=${dates}&details=${details}&location=${location}`;
  };

  return (
    <main className="min-h-screen max-w-6xl mx-auto py-12 px-4">
      {/* View Layer 1: Authentication Phase Entry Screen */}
      {!authenticated ? (
        <div className="max-w-md mx-auto my-16 p-8 border rounded-2xl bg-white shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">My Registrations</h1>
            <p className="text-sm text-gray-500">Enter your email address to access and manage your upcoming tech events.</p>
          </div>
          <form onSubmit={handleFetchRegistrations} className="space-y-4">
            <input
              type="email"
              required
              placeholder="developer@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 "
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl transition text-sm disabled:opacity-50"
            >
              {loading ? 'Searching Record Files...' : 'View My Bookings'}
            </button>
          </form>
        </div>
      ) : (
        /* View Layer 2: Dashboard Layout Panels Screen */
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b pb-4 gap-4">
            <div>
              <h1 className="text-2xl font-black text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-400 mt-0.5">Showing event entries associated with: <span className="text-gray-700 font-medium">{email}</span></p>
            </div>
            <button
              onClick={() => { setAuthenticated(false); setEmail(''); setBookings([]); }}
              className="text-xs font-semibold text-gray-500 hover:text-gray-800 border px-3 py-1.5 rounded-lg hover:bg-gray-50 transition"
            >
              Switch Account
            </button>
          </div>

          {/* Grid Render Output */}
          {bookings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookings.map((booking: any) => {
                const event = booking.eventId;
                if (!event) return null; // Edge protective fallback layer if parent model object missing
                return (
                  <div key={booking._id} className="border bg-white rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold tracking-wider uppercase bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full">
                          {event.mode || 'Confirmed'}
                        </span>
                        <span className="text-xs text-gray-400 font-mono">ID: {booking._id.slice(-6)}</span>
                      </div>
                      <h3 className="text-base font-bold text-gray-900 line-clamp-1">{event.title}</h3>
                      <p className="text-xs text-gray-500 line-clamp-2">{event.description}</p>
                      
                      <div className="pt-2 space-y-1.5 text-xs text-gray-600 border-t border-gray-100">
                        <div className="flex items-center gap-2">📅 <span>{event.date ? new Date(event.date).toLocaleDateString() : 'TBD'}</span></div>
                        <div className="flex items-center gap-2">📍 <span className="line-clamp-1">{event.location || event.venue || 'Online Portal'}</span></div>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t flex items-center gap-2">
                      <a
                        href={generateGoogleCalendarLink(event)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 text-center bg-gray-50 hover:bg-gray-100 border text-gray-700 font-medium py-1.5 rounded-lg text-xs transition"
                      >
                        📅 Add to Calendar
                      </a>
                      <button
                        onClick={() => { setActiveBookingId(booking._id); setModalOpen(true); }}
                        className="bg-red-50 hover:bg-red-100 text-red-600 font-medium px-3 py-1.5 rounded-lg text-xs transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Smooth Dashboard Empty State Component fallback execution block */
            <div className="text-center py-16 border border-dashed rounded-2xl max-w-xl mx-auto bg-gray-50/50">
              <h3 className="text-base font-semibold text-gray-800">No active registrations found</h3>
              <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">You haven't signed up for any events with this email profile segment yet.</p>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Step Sub-Modal Element Overlay */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl space-y-4">
            <h3 className="text-base font-bold text-gray-900">Cancel Registration</h3>
            <p className="text-xs text-gray-500">Are you sure you want to resign from this event? This action will permanently delete your booking record.</p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                disabled={loading}
                onClick={() => { setModalOpen(false); setActiveBookingId(null); }}
                className="px-3 py-1.5 text-xs font-semibold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                No, Keep
              </button>
              <button
                disabled={loading}
                onClick={handleCancelRegistration}
                className="px-3 py-1.5 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg transition shadow-xs"
              >
                {loading ? 'Processing...' : 'Yes, Leave Event'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
