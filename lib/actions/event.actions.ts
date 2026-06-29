import connectToDatabase from "@/lib/mongodb";
import Event from "@/database/event.model";

const escapeRegex = (text: string) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

type EventFilters = {
  query?: string;
  mode?: string;
  tag?: string;
  sortBy?: "date_asc" | "date_desc" | "name_asc" | "name_desc" | "popularity";
};

export async function getAllEvents(
  filters?: EventFilters,
  page = 1,
  limit?: number
) {
  try {
    await connectToDatabase();
    const queryCondition: Record<string, unknown> = {};

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

    const safePage = Number.isInteger(page) && page > 0 ? page : 1;
    const safeLimit = limit && Number.isInteger(limit) && limit > 0 ? Math.min(limit, 100) : undefined;
    const skip = safeLimit ? (safePage - 1) * safeLimit : 0;

    if (filters?.sortBy === "popularity") {
      const Booking = (await import("@/database/booking.model")).default;
      const total = await Event.countDocuments(queryCondition);
      const pipeline: object[] = [
        { $match: queryCondition },
        {
          $lookup: {
            from: Booking.collection.name,
            localField: "_id",
            foreignField: "eventId",
            as: "bookings",
          },
        },
        { $addFields: { bookingCount: { $size: "$bookings" } } },
        { $sort: { bookingCount: -1, createdAt: -1 } },
        { $project: { bookings: 0, bookingCount: 0 } },
      ];

      if (safeLimit) {
        pipeline.push({ $skip: skip }, { $limit: safeLimit });
      }

      const events = await Event.aggregate(pipeline);
      const totalPages = safeLimit ? Math.max(1, Math.ceil(total / safeLimit)) : 1;

      return {
        events: JSON.parse(JSON.stringify(events)),
        total,
        totalPages,
        currentPage: safePage,
      };
    }

    const sortField =
      filters?.sortBy === "date_asc"
        ? { date: 1 as const }
        : filters?.sortBy === "date_desc"
          ? { date: -1 as const }
          : filters?.sortBy === "name_asc"
            ? { title: 1 as const }
            : filters?.sortBy === "name_desc"
              ? { title: -1 as const }
              : { createdAt: -1 as const };

    const total = await Event.countDocuments(queryCondition);
    let query = Event.find(queryCondition).sort(sortField);

    if (safeLimit) {
      query = query.skip(skip).limit(safeLimit);
    }

    const events = await query;
    const totalPages = safeLimit ? Math.max(1, Math.ceil(total / safeLimit)) : 1;

    return {
      events: JSON.parse(JSON.stringify(events)),
      total,
      totalPages,
      currentPage: safePage,
    };

  } catch (error) {
    console.error('Error fetching events:', error);
    return {
      events: [],
      total: 0,
      totalPages: 1,
      currentPage: 1,
    };
  }
}

export async function getSimilarEventsBySlug(slug: string, limit = 3) {
  try {
    await connectToDatabase();

    const currentEvent = await Event.findOne({ slug }).select("type tags").lean();

    if (!currentEvent) {
      return [];
    }

    const safeLimit = Number.isInteger(limit) && limit > 0 ? Math.min(limit, 12) : 3;
    const similarEvents = await Event.find({
      slug: { $ne: slug },
      $or: [
        { type: currentEvent.type },
        { tags: { $in: currentEvent.tags } },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(safeLimit);

    return JSON.parse(JSON.stringify(similarEvents));
  } catch (error) {
    console.error("Error fetching similar events:", error);
    return [];
  }
}
