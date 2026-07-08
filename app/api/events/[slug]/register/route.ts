import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import { Booking, Event } from "@/database";
import { revalidatePath } from "next/cache";

interface RouteParams {
    params: Promise<{ slug: string }>;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest, { params }: RouteParams) {
    try {
        const { slug: eventId } = await params;

        // 1. Validate event ID
        if (!eventId || !Types.ObjectId.isValid(eventId)) {
            return NextResponse.json(
                { message: "Invalid event ID format." },
                { status: 400 }
            );
        }

        // 2. Parse request body
        let body;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json(
                { message: "Invalid request body." },
                { status: 400 }
            );
        }

        const { email } = body;

        // 3. Validate email presence and format
        if (!email || typeof email !== "string" || !email.trim()) {
            return NextResponse.json(
                { message: "Email is required." },
                { status: 400 }
            );
        }

        const cleanEmail = email.trim().toLowerCase();

        if (!EMAIL_REGEX.test(cleanEmail)) {
            return NextResponse.json(
                { message: "Please provide a valid email address." },
                { status: 400 }
            );
        }

        // 4. Connect to database
        await connectToDatabase();

        // 5. Verify if the event exists
        const event = await Event.findById(eventId);
        if (!event) {
            return NextResponse.json(
                { message: "Event not found." },
                { status: 404 }
            );
        }

        // 6. Check for existing registration
        const existingRegistration = await Booking.findOne({
            eventId,
            email: cleanEmail,
        });

        if (existingRegistration) {
            return NextResponse.json(
                { message: "You have already registered for this event." },
                { status: 409 }
            );
        }

        // 7. Save registration (create booking)
        const booking = await Booking.create({
            eventId,
            email: cleanEmail,
        });

        // 8. Revalidate paths to refresh cache
        revalidatePath(`/events/${event.slug}`);
        revalidatePath("/");

        return NextResponse.json(
            { message: "Registration successful", booking },
            { status: 201 }
        );
    } catch (error: any) {
        // 9. Handle duplicate key errors from unique compound index
        if (error && error.code === 11000) {
            return NextResponse.json(
                { message: "You have already registered for this event." },
                { status: 409 }
            );
        }

        console.error("Error in registration API:", error);
        return NextResponse.json(
            { message: "Internal server error.", error: error instanceof Error ? error.message : "Unknown" },
            { status: 500 }
        );
    }
}
