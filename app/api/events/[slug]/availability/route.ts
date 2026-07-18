import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import Booking from "@/database/models/Booking";
import Event from "@/database/models/Event";

interface RouteParams {
    params: Promise<{ slug: string }>;
}

async function expireOldLocks(eventId: string) {
    await Booking.updateMany(
        {
            eventId,
            status: "locked",
            lockExpiresAt: { $lte: new Date() },
        },
        { $set: { status: "expired" } }
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

export async function GET(_req: NextRequest, { params }: RouteParams) {
    try {
        const { slug: eventId } = await params;

        if (!eventId || !Types.ObjectId.isValid(eventId)) {
            return NextResponse.json({ message: "Invalid event ID format." }, { status: 400 });
        }

        await connectToDatabase();

        const event = await Event.findById(eventId);
        if (!event) {
            return NextResponse.json({ message: "Event not found." }, { status: 404 });
        }

        await expireOldLocks(eventId);

        // IMPORTANT: if your event model uses another field, replace here:
        const capacity = Number((event as any).capacity ?? (event as any).totalSeats ?? 0);

        if (!Number.isFinite(capacity) || capacity <= 0) {
            return NextResponse.json(
                { message: "Event capacity is not configured." },
                { status: 400 }
            );
        }

        const { confirmedSeats, lockedSeats } = await getSeatStats(eventId);
        const availableSeats = Math.max(0, capacity - confirmedSeats - lockedSeats);

        return NextResponse.json(
            {
                eventId,
                capacity,
                confirmedSeats,
                lockedSeats,
                availableSeats,
                serverTime: new Date().toISOString(),
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Error in availability API:", error);
        return NextResponse.json(
            {
                message: "Internal server error.",
                error: error instanceof Error ? error.message : "Unknown",
            },
            { status: 500 }
        );
    }
}