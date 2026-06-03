import connectToDatabase from "@/lib/mongodb";
import { Event } from "@/database";

const escapeRegex = (text: string) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

export async function getAllEvents(filters?: { query?: string; mode?: string; tag?: string }) {
  try {
    await connectToDatabase();
    const queryCondition: any = {};

    if (filters?.query) {
      const safeQuery = escapeRegex(filters.query);
      queryCondition.$or = [
        { title: { $regex: safeQuery, $options: 'i' } },
        { description: { $regex: safeQuery, $options: 'i' } },
        { tags: { $regex: safeQuery, $options: 'i' } }
      ];
    }

    if (filters?.mode && filters.mode !== 'All') {
      const safeMode = escapeRegex(filters.mode);
      queryCondition.mode = { $regex: new RegExp(`^${safeMode}$`, 'i') };
    }

    if (filters?.tag && filters.tag !== 'All') {
      const safeTag = escapeRegex(filters.tag);
      queryCondition.tags = { $regex: new RegExp(`^${safeTag}$`, 'i') };
    }

    const events = await Event.find(queryCondition).sort({ createdAt: -1 });
    return JSON.parse(JSON.stringify(events));

  } catch (error) {
    console.error('Error fetching events:', error);
    return []; 
  }
}

export async function getSimilarEventsBySlug(
  slug: string,
  tags: string[] = []
) {
  await connectToDatabase();

  if (!tags.length) {
    return [];
  }

  const events = await Event.find({
    slug: { $ne: slug },
    tags: { $in: tags }
  }).limit(3);

  return JSON.parse(JSON.stringify(events));
}