export const POSTHOG_EVENTS = {
  // Navigation
  PAGE_VIEW: "$pageview",

  // Event discovery
  EVENT_VIEWED: "event_viewed",
  EVENT_SEARCHED: "event_searched",
  EVENT_FILTER_CHANGED: "event_filter_changed",

  // Bookmarks
  EVENT_BOOKMARKED: "event_bookmarked",
  EVENT_UNBOOKMARKED: "event_unbookmarked",

  // Booking
  EVENT_BOOKED: "event_booked",
  BOOKING_FAILED: "booking_failed",

  // Creation
  EVENT_CREATED: "event_created",
  EVENT_CREATION_FAILED: "event_creation_failed",
} as const;
