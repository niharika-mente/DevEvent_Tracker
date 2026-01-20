import mongoose, { Model, Schema, Types, HydratedDocument } from "mongoose";

/**
 * Interface representing the Booking document fields.
 */
export interface IBooking {
    eventId: Types.ObjectId;
    email: string;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Mongoose document type for Booking.
 */
export type BookingDocument = HydratedDocument<IBooking>;

/**
 * Email validation regex pattern.
 * Matches standard email formats like user@example.com.
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Booking Schema Definition.
 */
const BookingSchema = new Schema<IBooking>(
    {
        eventId: {
            type: Schema.Types.ObjectId,
            ref: "Event",
            required: [true, "Event ID is required"],
            index: true, // Index for faster queries by eventId
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            trim: true,
            lowercase: true,
            validate: {
                validator: (email: string) => EMAIL_REGEX.test(email),
                message: "Please provide a valid email address",
            },
        },
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt
    }
);

/**
 * Pre-save hook:
 * - Validates that the referenced eventId exists in the Event collection.
 * - Throws an error if the event does not exist.
 */
BookingSchema.pre("save", async function () {
    // Only validate eventId if it's new or modified
    if (this.isModified("eventId") || this.isNew) {
        const Event = mongoose.models.Event;

        if (!Event) {
            throw new Error("Event model is not registered");
        }

        const eventExists = await Event.exists({ _id: this.eventId });

        if (!eventExists) {
            throw new Error(`Event with ID ${this.eventId} does not exist`);
        }
    }
});

/**
 * Compound index to prevent duplicate bookings for the same event and email.
 */
BookingSchema.index({ eventId: 1, email: 1 }, { unique: true });

/**
 * Booking Model.
 * Uses existing model if available (for hot reloading in development).
 */
const Booking: Model<IBooking> =
    mongoose.models.Booking || mongoose.model<IBooking>("Booking", BookingSchema);

export default Booking;
