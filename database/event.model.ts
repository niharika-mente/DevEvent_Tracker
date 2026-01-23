import mongoose, { Model, Schema, HydratedDocument } from "mongoose";

/**
 * Interface representing the Event document fields.
 */
export interface IEvent {
    _id?: string;
    title: string;
    slug: string;
    description: string;
    overview: string;
    image: string;
    venue: string;
    location: string;
    date: string;
    time: string;
    mode: "online" | "offline" | "hybrid";
    audience: string;
    agenda: string[];
    organizer: string;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Mongoose document type for Event.
 */
export type EventDocument = HydratedDocument<IEvent>;

/**
 * Generates a URL-friendly slug from a given title.
 * Converts to lowercase, replaces spaces with hyphens, removes special characters.
 */
function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "") // Remove special characters
        .replace(/\s+/g, "-") // Replace spaces with hyphens
        .replace(/-+/g, "-"); // Remove consecutive hyphens
}

/**
 * Normalizes a date string to ISO format (YYYY-MM-DD).
 * Throws an error if the date is invalid.
 */
function normalizeDate(dateStr: string): string {
    const parsed = new Date(dateStr);
    if (isNaN(parsed.getTime())) {
        throw new Error(`Invalid date format: ${dateStr}`);
    }
    return parsed.toISOString().split("T")[0]; // Returns YYYY-MM-DD
}

/**
 * Normalizes a time string to HH:MM format (24-hour).
 * Supports various input formats like "2:30 PM", "14:30", etc.
 */
function normalizeTime(timeStr: string): string {
    const trimmed = timeStr.trim().toUpperCase();

    // Try to parse 12-hour format (e.g., "2:30 PM")
    const twelveHourMatch = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
    if (twelveHourMatch) {
        let hours = parseInt(twelveHourMatch[1], 10);
        const minutes = twelveHourMatch[2];
        const period = twelveHourMatch[3];

        if (period === "PM" && hours !== 12) hours += 12;
        if (period === "AM" && hours === 12) hours = 0;

        return `${hours.toString().padStart(2, "0")}:${minutes}`;
    }

    // Try to parse 24-hour format (e.g., "14:30")
    const twentyFourHourMatch = trimmed.match(/^(\d{1,2}):(\d{2})$/);
    if (twentyFourHourMatch) {
        const hours = parseInt(twentyFourHourMatch[1], 10);
        const minutes = twentyFourHourMatch[2];

        if (hours < 0 || hours > 23) {
            throw new Error(`Invalid time format: ${timeStr}`);
        }

        return `${hours.toString().padStart(2, "0")}:${minutes}`;
    }

    throw new Error(`Invalid time format: ${timeStr}`);
}

/**
 * Event Schema Definition.
 */
const EventSchema = new Schema<IEvent>(
    {
        title: {
            type: String,
            required: [true, "Title is required"],
            trim: true,
        },
        slug: {
            type: String,
            unique: true,
            index: true,
        },
        description: {
            type: String,
            required: [true, "Description is required"],
            trim: true,
        },
        overview: {
            type: String,
            required: [true, "Overview is required"],
            trim: true,
        },
        image: {
            type: String,
            required: [true, "Image URL is required"],
        },
        venue: {
            type: String,
            required: [true, "Venue is required"],
            trim: true,
        },
        location: {
            type: String,
            required: [true, "Location is required"],
            trim: true,
        },
        date: {
            type: String,
            required: [true, "Date is required"],
        },
        time: {
            type: String,
            required: [true, "Time is required"],
        },
        mode: {
            type: String,
            enum: ["online", "offline", "hybrid"],
            required: [true, "Mode is required"],
            trim: true,
        },
        audience: {
            type: String,
            required: [true, "Audience is required"],
            trim: true,
        },
        agenda: {
            type: [String],
            required: [true, "Agenda is required"],
            validate: {
                validator: (arr: string[]) => arr.length > 0,
                message: "Agenda must have at least one item",
            },
        },
        organizer: {
            type: String,
            required: [true, "Organizer is required"],
            trim: true,
        },
        tags: {
            type: [String],
            required: [true, "Tags are required"],
            validate: {
                validator: (arr: string[]) => arr.length > 0,
                message: "Tags must have at least one item",
            },
        },
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt
    }
);

/**
 * Pre-save hook:
 * - Generates slug from title (only if title changed or is new).
 * - Normalizes date to ISO format (YYYY-MM-DD).
 * - Normalizes time to 24-hour format (HH:MM).
 */
EventSchema.pre("save", async function () {
    // Generate slug only if title is modified or document is new
    if (this.isModified("title") || this.isNew) {
        this.slug = generateSlug(this.title);

        // Ensure slug uniqueness by appending a suffix if needed
        const existingEvent = await mongoose.models.Event?.findOne({
            slug: this.slug,
            _id: { $ne: this._id },
        });

        if (existingEvent) {
            this.slug = `${this.slug}-${Date.now()}`;
        }
    }

    // Normalize date to ISO format
    if (this.isModified("date") || this.isNew) {
        this.date = normalizeDate(this.date);
    }

    // Normalize time to consistent format
    if (this.isModified("time") || this.isNew) {
        this.time = normalizeTime(this.time);
    }
});

/**
 * Event Model.
 * Uses existing model if available (for hot reloading in development).
 */
const Event: Model<IEvent> =
    mongoose.models.Event || mongoose.model<IEvent>("Event", EventSchema);

export default Event;
