import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from 'cloudinary';

import connectDB from "@/lib/mongodb";
import Event from '@/database/event.model';
import { verifyToken, extractTokenFromHeader } from "@/lib/auth";

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        // Extract token for authentication
        let token = extractTokenFromHeader(req.headers.get("authorization"));
        if (!token) {
            token = req.cookies.get("authToken")?.value || null;
        }

        if (!token) {
            return NextResponse.json(
                { message: "Unauthorized: Authentication required" },
                { status: 401 }
            );
        }

        // Verify token and check role
        const decoded = verifyToken(token);
        if (!decoded || decoded.role !== "organizer") {
            return NextResponse.json(
                { message: "Forbidden: Only organizers can create events" },
                { status: 403 }
            );
        }

        const formData = await req.formData();

        let event;

        try {
            event = Object.fromEntries(formData.entries());
        } catch {
            return NextResponse.json({ message: 'Invalid JSON data format' }, { status: 400 })
        }

        const file = formData.get('image') as File;

        if (!file) return NextResponse.json({ message: 'Image file is required' }, { status: 400 })

        // Safe JSON parsing helper
        const safeParseJsonArray = (str: string): string[] => {
            if (!str) return [];

            // Try direct parse first
            try {
                return JSON.parse(str);
            } catch {
                // Extract JSON array portion using regex
                const match = str.match(/\[[\s\S]*\]/);
                if (match) {
                    try {
                        return JSON.parse(match[0]);
                    } catch {
                        return [];
                    }
                }
                return [];
            }
        };

        const tagsStr = formData.get('tags') as string;
        const agendaStr = formData.get('agenda') as string;

        const tags = safeParseJsonArray(tagsStr);
        const agenda = safeParseJsonArray(agendaStr);

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream({ resource_type: 'image', folder: 'DevEvent' }, (error, results) => {
                if (error) return reject(error);

                resolve(results);
            }).end(buffer);
        });

        event.image = (uploadResult as { secure_url: string }).secure_url;

        const createdEvent = await Event.create({
            ...event,
            tags: tags,
            agenda: agenda,
            organizerId: decoded.userId,
        });

        return NextResponse.json({ message: 'Event created successfully', event: createdEvent }, { status: 201 });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ message: 'Event Creation Failed', error: e instanceof Error ? e.message : 'Unknown' }, { status: 500 })
    }
}

export async function GET() {
    try {
        await connectDB();

        const events = await Event.find().sort({ createdAt: -1 });

        return NextResponse.json({ message: 'Events fetched successfully', events }, { status: 200 });
    } catch (e) {
        return NextResponse.json({ message: 'Event fetching failed', error: e }, { status: 500 });
    }
}
