// Re-export all models and types for convenient single-import access
export { default as Event } from "./event.model";
export type { IEvent } from "./event.model";

export { default as Booking } from "./booking.model";
export type { IBooking } from "./booking.model";

export { default as Opportunity } from "./opportunity.model";
export type { IOpportunity } from "./opportunity.model";
export { generateOpportunityHash } from "./opportunity.model";
