import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import Event from "@/database/event.model";
import User from "@/database/user.model";
import { getRequestAuth } from "@/lib/request-auth";

interface RouteParams {
    params: Promise<{ slug: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
    try {
        const auth = getRequestAuth(req);

        if (!auth || auth.role !== "organizer") {
            return NextResponse.json(
                { message: "Forbidden" },
                { status: 403 }
            );
        }

        const { slug } = await params;
        await connectDB();

        const event = await Event.findOne({ slug }).populate(
            "attendees",
            "email firstName lastName"
        );

        if (!event) {
            return NextResponse.json(
                { message: "Event not found" },
                { status: 404 }
            );
        }

        if (event.organizerId?.toString() !== auth.userId) {
            return NextResponse.json(
                { message: "Forbidden" },
                { status: 403 }
            );
        }

        return NextResponse.json(
            {
                attendees: event.attendees ?? [],
            },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            {
                message: "Failed to fetch attendees",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
    try {
        const auth = getRequestAuth(req);

        if (!auth || auth.role !== "attender") {
            return NextResponse.json(
                { message: "Only attenders can register for events" },
                { status: 403 }
            );
        }

        const { slug } = await params;
        await connectDB();

        const event = await Event.findOne({ slug });
        const user = await User.findById(auth.userId);

        if (!event || !user) {
            return NextResponse.json(
                { message: "Event or user not found" },
                { status: 404 }
            );
        }

        const attendeeIds = (event.attendees ?? []).map((attendeeId) =>
            attendeeId.toString()
        );

        if (attendeeIds.includes(auth.userId)) {
            return NextResponse.json(
                { message: "You have already joined this event" },
                { status: 409 }
            );
        }

        const userId = user._id as unknown as mongoose.Types.ObjectId;
        const eventId = event._id as unknown as mongoose.Types.ObjectId;

        event.attendees = [...(event.attendees ?? []), userId];
        user.eventsAttending = [...(user.eventsAttending ?? []), eventId];

        await Promise.all([event.save(), user.save()]);

        return NextResponse.json(
            { message: "Joined event successfully" },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            {
                message: "Failed to join event",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
    try {
        const auth = getRequestAuth(req);

        if (!auth || auth.role !== "attender") {
            return NextResponse.json(
                { message: "Only attenders can unregister from events" },
                { status: 403 }
            );
        }

        const { slug } = await params;
        await connectDB();

        const event = await Event.findOne({ slug });
        const user = await User.findById(auth.userId);

        if (!event || !user) {
            return NextResponse.json(
                { message: "Event or user not found" },
                { status: 404 }
            );
        }

        event.attendees = (event.attendees ?? []).filter(
            (attendeeId) => attendeeId.toString() !== auth.userId
        );
        user.eventsAttending = (user.eventsAttending ?? []).filter(
            (eventId) => eventId.toString() !== event._id?.toString()
        );

        await Promise.all([event.save(), user.save()]);

        return NextResponse.json(
            { message: "Left event successfully" },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            {
                message: "Failed to leave event",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
