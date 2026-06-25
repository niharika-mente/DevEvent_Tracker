import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from 'cloudinary';

import connectDB from "@/lib/mongodb";
import Event from '@/database/event.model';

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const formData = await req.formData();

        let event;

        try {
            event = Object.fromEntries(formData.entries());
        } catch (e) {
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

        let tags = safeParseJsonArray(tagsStr);
        let agenda = safeParseJsonArray(agendaStr);

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
        });

        return NextResponse.json({ message: 'Event created successfully', event: createdEvent }, { status: 201 });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ message: 'Event Creation Failed', error: e instanceof Error ? e.message : 'Unknown' }, { status: 500 })
    }
}

export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const sortBy = searchParams.get('sortBy') || '';

        // Pagination params
        const rawPage = parseInt(searchParams.get('page') || '1', 10);
        const rawLimit = parseInt(searchParams.get('limit') || '9', 10);
        const page = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;
        const limit = Math.min(100, Math.max(1, isNaN(rawLimit) ? 9 : rawLimit));
        const skip = (page - 1) * limit;

        let sortField: Record<string, 1 | -1>;
        switch (sortBy) {
            case 'date_asc':
                sortField = { date: 1 };
                break;
            case 'date_desc':
                sortField = { date: -1 };
                break;
            case 'name_asc':
                sortField = { title: 1 };
                break;
            case 'name_desc':
                sortField = { title: -1 };
                break;
            case 'popularity': {
                const Booking = (await import('@/database/booking.model')).default;
                const total = await Event.countDocuments();
                const totalPages = Math.max(1, Math.ceil(total / limit));
                const events = await Event.aggregate([
                    {
                        $lookup: {
                            from: Booking.collection.name,
                            localField: '_id',
                            foreignField: 'eventId',
                            as: 'bookings',
                        },
                    },
                    { $addFields: { bookingCount: { $size: '$bookings' } } },
                    { $sort: { bookingCount: -1, createdAt: -1 } },
                    { $project: { bookings: 0, bookingCount: 0 } },
                    { $skip: skip },
                    { $limit: limit },
                ]);
                return NextResponse.json({
                    message: 'Events fetched successfully',
                    events,
                    total,
                    totalPages,
                    currentPage: page,
                }, { status: 200 });
            }
            default:
                sortField = { createdAt: -1 };
        }

        const total = await Event.countDocuments();
        const totalPages = Math.max(1, Math.ceil(total / limit));
        const events = await Event.find().sort(sortField).skip(skip).limit(limit);

        return NextResponse.json({
            message: 'Events fetched successfully',
            events,
            total,
            totalPages,
            currentPage: page,
        }, { status: 200 });
    } catch (e) {
        return NextResponse.json({ message: 'Event fetching failed', error: e }, { status: 500 });
    }
}