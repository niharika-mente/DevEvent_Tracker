import connectToDatabase from "@/lib/mongodb";
import { Event } from "@/database";

const escapeRegex = (text: string) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

type SortBy = 'date_asc' | 'date_desc' | 'name_asc' | 'name_desc' | 'popularity';

/**
 * Helper function to add booking count to aggregation pipeline.
 * Prevents N+1 queries by joining bookings data in a single aggregation stage.
 * Returns the aggregation pipeline stages needed to attach booking counts.
 * Note: bookingCount is calculated and included in results, NOT removed.
 */
function getBookingCountStages() {
  return [
    {
      $lookup: {
        from: 'bookings',
        localField: '_id',
        foreignField: 'eventId',
        as: 'bookings',
      },
    },
    {
      $addFields: {
        bookingCount: { $size: '$bookings' },
      },
    },
    {
      $project: { 
        bookings: 0,  // Remove raw bookings array to keep response size small
        // bookingCount is kept in the results for display/sorting
      },
    },
  ];
}

export interface PaginatedEvents {
  events: any[];
  total: number;
  totalPages: number;
  currentPage: number;
}

export async function getAllEvents(
  filters?: { query?: string; mode?: string; tag?: string; sortBy?: SortBy },
  page = 1,
  limit = 9
): Promise<PaginatedEvents> {
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

    const safePage = Math.max(1, isNaN(Number(page)) ? 1 : Number(page));
    const safeLimit = Math.min(100, Math.max(1, isNaN(Number(limit)) ? 9 : Number(limit)));
    const skip = (safePage - 1) * safeLimit;

    // Get total count for pagination metadata
    const total = await Event.countDocuments(queryCondition);
    const totalPages = Math.max(1, Math.ceil(total / safeLimit));

    // Popularity sort — use aggregation pipeline with $lookup on bookings
    if (filters?.sortBy === 'popularity') {
      const matchStage = Object.keys(queryCondition).length ? [{ $match: queryCondition }] : [];
      const results = await Event.aggregate([
        ...matchStage,
        ...getBookingCountStages(),
        { $sort: { bookingCount: -1, createdAt: -1 } },
        { $skip: skip },
        { $limit: safeLimit },
      ]);
      return {
        events: JSON.parse(JSON.stringify(results)),
        total,
        totalPages,
        currentPage: safePage,
      };
    }

    let query = Event.find(queryCondition);

    // Apply sort
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
      // Relevance sort when full-text searching
      query = query.select({ score: { $meta: 'textScore' } }).sort({ score: { $meta: 'textScore' } });
    } else {
      // Default: newest first
      query = query.sort({ createdAt: -1 });
    }

    const events = await query.skip(skip).limit(safeLimit);
    return {
      events: JSON.parse(JSON.stringify(events)),
      total,
      totalPages,
      currentPage: safePage,
    };

  } catch (error) {
    console.error('Error fetching events:', error);
    return { events: [], total: 0, totalPages: 1, currentPage: 1 };
  }
}

/**
 * Fetches similar events using aggregation pipeline with booking counts.
 * This prevents N+1 queries by fetching booking data in a single aggregation.
 * Optimized with $lookup for efficient booking count calculation.
 */
export async function getSimilarEventsBySlug(
  slug: string,
  tags: string[] = []
) {
  try {
    await connectToDatabase();

    if (!tags.length) {
      return [];
    }

    // Use aggregation pipeline to fetch events with booking counts in a single query
    const events = await Event.aggregate([
      {
        $match: {
          slug: { $ne: slug },
          tags: { $in: tags },
        },
      },
      ...getBookingCountStages(),
      // Sort by booking count (popularity) as primary, then by date
      {
        $sort: { bookingCount: -1, createdAt: -1 },
      },
      {
        $limit: 3,
      },
    ]);

    return JSON.parse(JSON.stringify(events));
  } catch (error) {
    console.error('Error fetching similar events:', error);
    return [];
  }
}

/**
 * Fetches recommended events using aggregation pipeline with booking counts.
 * This prevents N+1 queries by fetching booking data in a single aggregation.
 * Sorts by popularity (booking count) to show trending events first.
 */
export async function getRecommendedEvents(userTags: string[] = []) {
  try {
    await connectToDatabase();

    if (!userTags.length) {
      return [];
    }

    // Use aggregation pipeline to fetch events with booking counts in a single query
    const recommendedEvents = await Event.aggregate([
      {
        $match: {
          tags: { $in: userTags },
        },
      },
      ...getBookingCountStages(),
      // Sort by booking count (popularity) first, then by creation date
      {
        $sort: { bookingCount: -1, createdAt: -1 },
      },
      {
        $limit: 3,
      },
    ]);

    return JSON.parse(JSON.stringify(recommendedEvents));
  } catch (error) {
    console.error('Error fetching recommended events:', error);
    return [];
  }
}