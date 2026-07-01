"use server";

import type { QueryFilter, SortOrder } from "mongoose";
import { type IEvent } from "@/database";
import Event from "@/database/event.model";
import connectToDatabase from "@/lib/mongodb";

type SortBy = "date_asc" | "date_desc" | "name_asc" | "name_desc" | "popularity";

interface EventFilters {
  query?: string;
  mode?: string;
  tag?: string;
  sortBy?: SortBy;
}

interface PaginatedEvents {
  events: IEvent[];
  total: number;
  totalPages: number;
  currentPage: number;
}

const escapeRegex = (text: string) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

function buildFilter(filters?: EventFilters): QueryFilter<IEvent> {
  const queryCondition: QueryFilter<IEvent> = {};

  if (filters?.query) {
    const safeQuery = escapeRegex(filters.query);
    queryCondition.$or = [
      { title: { $regex: safeQuery, $options: "i" } },
      { description: { $regex: safeQuery, $options: "i" } },
      { tags: { $regex: safeQuery, $options: "i" } },
    ];
  }

  if (filters?.mode && filters.mode !== "All") {
    queryCondition.mode = { $regex: new RegExp(`^${escapeRegex(filters.mode)}$`, "i") };
  }

  if (filters?.tag && filters.tag !== "All") {
    queryCondition.tags = { $regex: new RegExp(`^${escapeRegex(filters.tag)}$`, "i") };
  }

  return queryCondition;
}

function getSort(sortBy?: SortBy): Record<string, SortOrder> {
  switch (sortBy) {
    case "date_asc": return { date: 1 };
    case "date_desc": return { date: -1 };
    case "name_asc": return { title: 1 };
    case "name_desc": return { title: -1 };
    default: return { createdAt: -1 };
  }
}

export async function getAllEvents(filters?: EventFilters): Promise<IEvent[]>;
export async function getAllEvents(filters: EventFilters | undefined, page: number, limit: number): Promise<PaginatedEvents>;
export async function getAllEvents(
  filters?: EventFilters,
  page?: number,
  limit?: number,
): Promise<IEvent[] | PaginatedEvents> {
  try {
    await connectToDatabase();
    const queryCondition = buildFilter(filters);

    if (page === undefined || limit === undefined) {
      const events = await Event.find(queryCondition).sort(getSort(filters?.sortBy)).lean();
      return JSON.parse(JSON.stringify(events)) as IEvent[];
    }

    const safePage = Math.max(1, page);
    const safeLimit = Math.min(100, Math.max(1, limit));
    const skip = (safePage - 1) * safeLimit;
    const total = await Event.countDocuments(queryCondition);

    if (filters?.sortBy === "popularity") {
      const events = await Event.aggregate<IEvent>([
        { $match: queryCondition },
        { $lookup: { from: "bookings", localField: "_id", foreignField: "eventId", as: "bookings" } },
        { $addFields: { bookingCount: { $size: "$bookings" } } },
        { $sort: { bookingCount: -1, createdAt: -1 } },
        { $project: { bookings: 0, bookingCount: 0 } },
        { $skip: skip },
        { $limit: safeLimit },
      ]);
      return {
        events: JSON.parse(JSON.stringify(events)) as IEvent[],
        total,
        totalPages: Math.max(1, Math.ceil(total / safeLimit)),
        currentPage: safePage,
      };
    }

    const events = await Event.find(queryCondition)
      .sort(getSort(filters?.sortBy))
      .skip(skip)
      .limit(safeLimit)
      .lean();

    return {
      events: JSON.parse(JSON.stringify(events)) as IEvent[],
      total,
      totalPages: Math.max(1, Math.ceil(total / safeLimit)),
      currentPage: safePage,
    };
  } catch (error) {
    console.error("Error fetching events:", error);
    if (page !== undefined && limit !== undefined) {
      return { events: [], total: 0, totalPages: 1, currentPage: Math.max(1, page) };
    }
    return [];
  }
}

export async function getSimilarEventsBySlug(slug: string): Promise<IEvent[]> {
  try {
    await connectToDatabase();
    const currentEvent = await Event.findOne({ slug }).select("_id type tags").lean();
    if (!currentEvent) return [];

    const similarEvents = await Event.find({
      _id: { $ne: currentEvent._id },
      $or: [
        { type: currentEvent.type },
        { tags: { $in: currentEvent.tags } },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();

    return JSON.parse(JSON.stringify(similarEvents)) as IEvent[];
  } catch (error) {
    console.error("Error fetching similar events:", error);
    return [];
  }
}
