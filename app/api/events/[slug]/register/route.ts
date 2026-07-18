import { NextRequest, NextResponse } from "next/server";
import mongoose, { Types } from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import Booking from "@/database/booking.model";
import Event from "@/database/event.model";
import { revalidatePath } from "next/cache";

interface RouteParams {
    params: Promise<{ slug: string }>;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LOCK_MINUTES = 10;

async function expireOldLocks(eventId: string, session?: mongoose.ClientSession) {
    await Booking.updateMany(
        {
            eventId,
            status: "locked",
            lockExpiresAt: { $lte: new Date() },
        },
        { $set: { status: "expired" } },
        { session }
    );
}

async function getSeatStats(eventId: string, session?: mongoose.ClientSession) {
    const now = new Date();

    const [confirmedAgg, lockedAgg] = await Promise.all([
        Booking.aggregate([
            {
                $match: {
                    eventId: new Types.ObjectId(eventId),
                    status: "confirmed",
                },
            },
            { $group: { _id: null, total: { $sum: "$seats" } } },
        ]).session(session || null),

        Booking.aggregate([
            {
                $match: {
                    eventId: new Types.ObjectId(eventId),
                    status: "locked",
                    lockExpiresAt: { $gt: now },
                },
            },
            { $group: { _id: null, total: { $sum: "$seats" } } },
        ]).session(session || null),
    ]);

    return {
        confirmedSeats: confirmedAgg[0]?.total || 0,
        lockedSeats: lockedAgg[0]?.total || 0,
    };
}

export async function POST(req: NextRequest, { params }: RouteParams) {
    let dbSession: mongoose.ClientSession | null = null;

    try {
        const { slug: eventId } = await params;

        // 1) Validate event ID format (your route uses ObjectId in slug)
        if (!eventId || !Types.ObjectId.isValid(eventId)) {
            return NextResponse.json({ message: "Invalid event ID format." }, { status: 400 });
        }

        // 2) Parse body
        let body: any;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
        }

        const action = body?.action as "lock" | "confirm" | "release";
        const email = body?.email;
        const seats = Number(body?.seats ?? 1);
        const lockId = body?.lockId ? String(body.lockId) : null;

        // 3) Validate action
        if (!action || !["lock", "confirm", "release"].includes(action)) {
            return NextResponse.json(
                { message: "Invalid action. Use lock, confirm, or release." },
                { status: 400 }
            );
        }

        // 4) Validate email
        if (!email || typeof email !== "string" || !email.trim()) {
            return NextResponse.json({ message: "Email is required." }, { status: 400 });
        }

        const cleanEmail = email.trim().toLowerCase();

        if (!EMAIL_REGEX.test(cleanEmail)) {
            return NextResponse.json(
                { message: "Please provide a valid email address." },
                { status: 400 }
            );
        }

        if (action === "lock" && (!Number.isFinite(seats) || seats < 1)) {
            return NextResponse.json(
                { message: "Seats must be a positive number." },
                { status: 400 }
            );
        }

        // 5) Connect DB
        await connectToDatabase();
        dbSession = await mongoose.startSession();

        let responseBody: any = null;
        let responseStatus = 200;

        await dbSession.withTransaction(async () => {
            // 6) Ensure event exists
            const event = await Event.findById(eventId).session(dbSession);
            const eventSlug = String((event as any).slug || "");
            if (!event) {
                responseBody = { message: "Event not found." };
                responseStatus = 404;
                return;
            }

            // IMPORTANT: adjust field if your Event model uses different key
            // e.g. maxParticipants, totalSeats, capacity
            const capacity = Number((event as any).capacity ?? (event as any).totalSeats ?? 0);

            if (!Number.isFinite(capacity) || capacity <= 0) {
                responseBody = {
                    message: "Event capacity is not configured. Please contact maintainers.",
                };
                responseStatus = 400;
                return;
            }

            // 7) Expire stale locks
            await expireOldLocks(eventId, dbSession);

            // 8) Calculate current availability
            const { confirmedSeats, lockedSeats } = await getSeatStats(eventId, dbSession);
            const availableSeats = Math.max(0, capacity - confirmedSeats - lockedSeats);

            if (action === "lock") {
                if (availableSeats < seats) {
                    responseBody = {
                        message: "Not enough seats available.",
                        availability: {
                            capacity,
                            confirmedSeats,
                            lockedSeats,
                            availableSeats,
                        },
                    };
                    responseStatus = 409;
                    return;
                }

                const lockExpiresAt = new Date(Date.now() + LOCK_MINUTES * 60 * 1000);

                const lockDocs = await Booking.create(
                    [
                        {
                            eventId,
                            email: cleanEmail,
                            seats,
                            status: "locked",
                            lockExpiresAt,
                        },
                    ],
                    { session: dbSession }
                );

                const lockDoc = lockDocs[0];

                const updated = await getSeatStats(eventId, dbSession);
                const updatedAvailable = Math.max(
                    0,
                    capacity - updated.confirmedSeats - updated.lockedSeats
                );

                responseBody = {
                    message: "Seats locked successfully.",
                    lockId: String(lockDoc._id),
                    lockExpiresAt,
                    availability: {
                        capacity,
                        confirmedSeats: updated.confirmedSeats,
                        lockedSeats: updated.lockedSeats,
                        availableSeats: updatedAvailable,
                    },
                };
                responseStatus = 200;
                return;
            }

            if (action === "confirm") {
                if (!lockId || !Types.ObjectId.isValid(lockId)) {
                    responseBody = { message: "Valid lockId is required." };
                    responseStatus = 400;
                    return;
                }

                const lockDoc = await Booking.findOne({
                    _id: lockId,
                    eventId,
                    email: cleanEmail,
                    status: "locked",
                    lockExpiresAt: { $gt: new Date() },
                }).session(dbSession);

                if (!lockDoc) {
                    responseBody = { message: "Lock expired or invalid." };
                    responseStatus = 410;
                    return;
                }

                lockDoc.status = "confirmed";
                lockDoc.lockExpiresAt = null;
                await lockDoc.save({ session: dbSession });

                const updated = await getSeatStats(eventId, dbSession);
                const updatedAvailable = Math.max(
                    0,
                    capacity - updated.confirmedSeats - updated.lockedSeats
                );

                responseBody = {
                    message: "Booking confirmed.",
                    bookingId: String(lockDoc._id),
                    availability: {
                        capacity,
                        confirmedSeats: updated.confirmedSeats,
                        lockedSeats: updated.lockedSeats,
                        availableSeats: updatedAvailable,
                    },
                };
                responseStatus = 200;
                return;
            }

            if (action === "release") {
                if (!lockId || !Types.ObjectId.isValid(lockId)) {
                    responseBody = { message: "Valid lockId is required." };
                    responseStatus = 400;
                    return;
                }

                const lockDoc = await Booking.findOne({
                    _id: lockId,
                    eventId,
                    email: cleanEmail,
                    status: "locked",
                }).session(dbSession);

                if (lockDoc) {
                    lockDoc.status = "cancelled";
                    lockDoc.lockExpiresAt = null;
                    await lockDoc.save({ session: dbSession });
                }

                const updated = await getSeatStats(eventId, dbSession);
                const updatedAvailable = Math.max(
                    0,
                    capacity - updated.confirmedSeats - updated.lockedSeats
                );

                responseBody = {
                    message: "Lock released.",
                    availability: {
                        capacity,
                        confirmedSeats: updated.confirmedSeats,
                        lockedSeats: updated.lockedSeats,
                        availableSeats: updatedAvailable,
                    },
                };
                responseStatus = 200;
                return;
            }
        });

        if (eventSlug) revalidatePath(`/events/${eventSlug}`);
        revalidatePath("/");

        return NextResponse.json(responseBody, { status: responseStatus });
    } catch (error: any) {
        if (error?.code === 11000) {
            return NextResponse.json(
                { message: "You have already confirmed booking for this event." },
                { status: 409 }
            );
        }

        console.error("Error in registration API:", error);
        return NextResponse.json(
            {
                message: "Internal server error.",
                error: error instanceof Error ? error.message : "Unknown",
            },
            { status: 500 }
        );
    } finally {
        if (dbSession) await dbSession.endSession();
    }
}