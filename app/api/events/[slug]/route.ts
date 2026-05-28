import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Event from "@/database/event.model";
import { getRequestAuth } from "@/lib/request-auth";

/**
 * Route params for dynamic [slug] segment.
 */
interface RouteParams {
    params: Promise<{ slug: string }>;
}

/**
 * GET /api/events/[slug]
 * Fetches a single event by its unique slug.
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
    try {
        const { slug } = await params;

        // Validate slug parameter
        if (!slug || typeof slug !== "string" || slug.trim() === "") {
            return NextResponse.json(
                { message: "Missing or invalid slug parameter" },
                { status: 400 }
            );
        }

        await connectDB();

        // Query event by slug
        const event = await Event.findOne({ slug: slug.trim() });

        // Handle event not found
        if (!event) {
            return NextResponse.json(
                { message: `Event with slug '${slug}' not found` },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: "Event fetched successfully", event },
            { status: 200 }
        );
    } catch (e) {
        console.error("Error fetching event by slug:", e);
        return NextResponse.json(
            {
                message: "Failed to fetch event",
                error: e instanceof Error ? e.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
    try {
        const auth = getRequestAuth(req);

        if (!auth || auth.role !== "organizer") {
            return NextResponse.json(
                { message: "Forbidden" },
                { status: 403 }
            );
        }

        const { slug } = await params;
        const payload = await req.json();

        await connectDB();

        const event = await Event.findOne({ slug });

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

        const editableFields = [
            "title",
            "description",
            "overview",
            "venue",
            "location",
            "date",
            "time",
            "mode",
            "audience",
            "organizer",
        ] as const;

        editableFields.forEach((field) => {
            if (payload[field] !== undefined) {
                event[field] = payload[field];
            }
        });

        await event.save();

        return NextResponse.json(
            { message: "Event updated successfully", event },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            {
                message: "Failed to update event",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
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

        const event = await Event.findOne({ slug });

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

        await event.deleteOne();

        return NextResponse.json(
            { message: "Event deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            {
                message: "Failed to delete event",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
