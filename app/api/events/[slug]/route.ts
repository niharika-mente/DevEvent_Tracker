import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Event from "@/database/event.model";

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
