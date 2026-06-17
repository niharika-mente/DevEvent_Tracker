import connectToDatabase from "@/lib/mongodb";
import { Event } from "@/database";

const escapeRegex = (text: string) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

type SortBy = 'date_asc' | 'date_desc' | 'name_asc' | 'name_desc' | 'popularity';

export async function getAllEvents(
  filters?: { query?: string; mode?: string; tag?: string; sortBy?: SortBy },
  page = 1,
  limit = 50
) {
  try {
    await connectToDatabase();
    const queryCondition: any = {};

    if (filters?.query) {
      queryCondition.$text = { $search: filters.query };
    }

    if (filters?.mode && filters.mode !== 'All') {
      const safeMode = escapeRegex(filters.mode);
      queryCondition.mode = { $regex: new RegExp(`^${safeMode}$`, 'i') };
    }

    if (filters?.tag && filters.tag !== 'All') {
      const safeTag = escapeRegex(filters.tag);
      queryCondition.tags = { $regex: new RegExp(`^${safeTag}$`, 'i') };
    }

    let query = Event.find(queryCondition);

    // Build sort based on sortBy param
    const sortBy = filters?.sortBy;
    if (sortBy === 'date_asc') {
      query = query.sort({ date: 1 });
    } else if (sortBy === 'date_desc') {
      query = query.sort({ date: -1 });
    } else if (sortBy === 'name_asc') {
      query = query.sort({ title: 1 });
    } else if (sortBy === 'name_desc') {
      query = query.sort({ title: -1 });
    } else if (filters?.query) {
      // Default: text-score sort when searching
      query = query.select({ score: { $meta: 'textScore' } }).sort({ score: { $meta: 'textScore' } });
    } else {
      // Default: newest first
      query = query.sort({ createdAt: -1 });
    }

    const safePage = Math.max(1, isNaN(Number(page)) ? 1 : Number(page));
    const safeLimit = Math.min(100, Math.max(1, isNaN(Number(limit)) ? 50 : Number(limit)));
    const skip = (safePage - 1) * safeLimit;

    if (sortBy === 'popularity') {
      // Use aggregation to count bookings per event and sort by count
      const matchStage = Object.keys(queryCondition).length ? [{ $match: queryCondition }] : [];
      const results = await Event.aggregate([
        ...matchStage,
        {
          $lookup: {
            from: 'bookings',
            localField: '_id',
            foreignField: 'eventId',
            as: 'bookings',
          },
        },
        { $addFields: { bookingCount: { $size: '$bookings' } } },
        { $sort: { bookingCount: -1, createdAt: -1 } },
        { $project: { bookings: 0, bookingCount: 0 } },
        { $skip: skip },
        { $limit: safeLimit },
      ]);
      return JSON.parse(JSON.stringify(results));
    }

    const events = await query.skip(skip).limit(safeLimit);
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

// Add this at the very bottom of your lib/actions/event.action.ts file

export async function getRecommendedEvents(userTags: string[] = []) {
  try {
    await connectToDatabase();

    if (!userTags.length) {
      return [];
    }

    // Find up to 3 events that match the user's interested tags, sorted by newest
    const recommendedEvents = await Event.find({
      tags: { $in: userTags }
    })
    .sort({ createdAt: -1 })
    .limit(3);

    return JSON.parse(JSON.stringify(recommendedEvents));
  } catch (error) {
    console.error('Error fetching recommended events:', error);
    return [];
  }
}