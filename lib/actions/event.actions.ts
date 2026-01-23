'use server';

import connectToDatabase from "@/lib/mongodb";
import { Event, IEvent } from "@/database";

export async function getSimilarEventsBySlug(slug: string): Promise<IEvent[]> {
    try {
        await connectToDatabase();

        // Get the current event to find its tags
        const currentEvent = await Event.findOne({ slug });

        if (!currentEvent) {
            return [];
        }

        // Find events with similar tags, excluding the current event
        const similarEvents = await Event.find({
            slug: { $ne: slug },
            tags: { $in: currentEvent.tags }
        })
            .limit(3)
            .lean();

        return JSON.parse(JSON.stringify(similarEvents));
    } catch (error) {
        console.error('Error fetching similar events:', error);
        return [];
    }
}

export async function getEventBySlug(slug: string) {
    try {
        await connectToDatabase();

        const event = await Event.findOne({ slug }).lean();

        if (!event) {
            return { success: false, error: 'Event not found' };
        }

        return { success: true, event: JSON.parse(JSON.stringify(event)) };
    } catch (error) {
        console.error('Error fetching event:', error);
        return { success: false, error: 'Failed to fetch event' };
    }
}

export async function getAllEvents() {
    try {
        await connectToDatabase();

        const events = await Event.find({}).sort({ createdAt: -1 }).lean();

        return { success: true, events: JSON.parse(JSON.stringify(events)) };
    } catch (error) {
        console.error('Error fetching events:', error);
        return { success: false, error: 'Failed to fetch events' };
    }
}
