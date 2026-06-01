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

export async function getAllEvents(filters?: { query?: string; mode?: string; tag?: string }) {
  try {
    const queryCondition: any = {};

    // 1. Regex search for Title, Description, or Tags
    if (filters?.query) {
      queryCondition.$or = [
        { title: { $regex: filters.query, $options: 'i' } },
        { description: { $regex: filters.query, $options: 'i' } },
        { tags: { $regex: filters.query, $options: 'i' } }
      ];
    }

    // 2. Filter by Mode (Online, Offline, Hybrid)
    if (filters?.mode && filters.mode !== 'All') {
      queryCondition.mode = { $regex: new RegExp(`^${filters.mode}$`, 'i') };
    }

    // 3. Filter by Tag
    if (filters?.tag && filters.tag !== 'All') {
      queryCondition.tags = { $regex: new RegExp(`^${filters.tag}$`, 'i') };
    }

    // Replace 'Event' with the actual Mongoose model name used in your file
    const events = await Event.find(queryCondition).sort({ createdAt: -1 });
    return JSON.parse(JSON.stringify(events));
  } catch (error) {
    console.error("Failed to fetch filtered events:", error);
    return [];
  }
}
