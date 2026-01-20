import mongoose, { Mongoose } from "mongoose";

/**
 * MongoDB connection string from environment variables.
 * Ensure MONGODB_URI is set in your .env.local file.
 */
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error(
        "Please define the MONGODB_URI environment variable inside .env.local"
    );
}

/**
 * Interface for the cached connection object.
 * - conn: The active Mongoose connection instance (or null if not connected).
 * - promise: The pending connection promise (or null if no connection is in progress).
 */
interface MongooseCache {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
}

/**
 * Extend the global namespace to include our mongoose cache.
 * This prevents TypeScript errors when accessing globalThis.mongoose.
 */
declare global {
    // eslint-disable-next-line no-var
    var mongoose: MongooseCache | undefined;
}

/**
 * Cached connection object.
 * In development, we store this on globalThis to persist across hot reloads.
 * This prevents creating multiple connections during development.
 */

const cached: MongooseCache = globalThis.mongoose ?? {
    conn: null,
    promise: null,
};

// Persist the cache on globalThis for development hot reloads
globalThis.mongoose = cached;

/**
 * Connects to MongoDB and returns the Mongoose instance.
 * Uses a cached connection to prevent multiple connections in development.
 *
 * @returns Promise<Mongoose> - The connected Mongoose instance.
 */
async function connectToDatabase(): Promise<Mongoose> {
    // Return cached connection if available
    if (cached.conn) {
        return cached.conn;
    }

    // If no pending connection, create one
    if (!cached.promise) {
        const options = {
            bufferCommands: false, // Disable command buffering for better error handling
        };

        cached.promise = mongoose.connect(MONGODB_URI!, options);
    }

    try {
        // Await the connection and cache it
        cached.conn = await cached.promise;
    } catch (error) {
        // Reset the promise on error so we can retry
        cached.promise = null;
        throw error;
    }

    return cached.conn;
}

export default connectToDatabase;
