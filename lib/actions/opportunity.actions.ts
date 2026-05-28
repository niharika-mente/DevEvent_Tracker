"use server";

import connectToDatabase from "@/lib/mongodb";
import Opportunity, { IOpportunity } from "@/database/opportunity.model";
import { FALLBACK_OPPORTUNITIES } from "@/lib/fallback-data";
import { FilterQuery } from "mongoose";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface OpportunityFilters {
  type?: "hackathon" | "internship" | "job";
  search?: string;
  location?: string;
  remote?: boolean;
  skills?: string[];
  source?: string;
  company?: string;
  page?: number;
  limit?: number;
  sortBy?: "latest" | "deadline" | "trending";
}

// ─── Get Opportunities (paginated + filtered) ─────────────────────────────────

export async function getOpportunities(filters: OpportunityFilters = {}) {
  try {
    const db = await connectToDatabase();
    if (!db) {
      const filtered = FALLBACK_OPPORTUNITIES.filter((opp) => {
        const matchesType = !filters.type || opp.type === filters.type;
        const matchesSearch = !filters.search || [opp.title, opp.company, opp.description, ...(opp.skills || []), ...(opp.tags || [])].join(" ").toLowerCase().includes(filters.search.toLowerCase());
        const matchesLocation = !filters.location || opp.location.toLowerCase().includes(filters.location.toLowerCase());
        const matchesRemote = filters.remote === undefined || opp.isRemote === filters.remote;
        const matchesSource = !filters.source || opp.source === filters.source;
        const matchesCompany = !filters.company || opp.company.toLowerCase().includes(filters.company.toLowerCase());
        return matchesType && matchesSearch && matchesLocation && matchesRemote && matchesSource && matchesCompany;
      });

      const page = filters.page ?? 1;
      const limit = filters.limit ?? 12;
      const start = (page - 1) * limit;
      return {
        success: true,
        opportunities: filtered.slice(start, start + limit),
        total: filtered.length,
        page,
        totalPages: Math.ceil(filtered.length / limit) || 1,
      };
    }

    const {
      type,
      search,
      location,
      remote,
      skills,
      source,
      company,
      page = 1,
      limit = 12,
      sortBy = "latest",
    } = filters;

    const query: FilterQuery<IOpportunity> = { isExpired: false };

    if (type) query.type = type;
    if (remote !== undefined) query.isRemote = remote;
    if (source) query.source = source;

    // Full-text search on title, company, description
    if (search) {
      query.$text = { $search: search };
    }

    // Location partial match
    if (location) {
      query.location = { $regex: location, $options: "i" };
    }

    // Skills filter (match any)
    if (skills && skills.length > 0) {
      query.skills = { $in: skills };
    }

    // Company partial match
    if (company) {
      query.company = { $regex: company, $options: "i" };
    }

    // Sort
    const sortMap: Record<string, object> = {
      latest: { postedAt: -1 },
      deadline: { deadline: 1 },
      trending: { isTrending: -1, views: -1 },
    };
    const sort = sortMap[sortBy] || { postedAt: -1 };

    const skip = (page - 1) * limit;

    const [opportunities, total] = await Promise.all([
      Opportunity.find(query).sort(sort).skip(skip).limit(limit).lean(),
      Opportunity.countDocuments(query),
    ]);

    return {
      success: true,
      opportunities: JSON.parse(JSON.stringify(opportunities)),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("[Actions] getOpportunities error:", error);
    return { success: false, opportunities: [], total: 0, error: "Failed to fetch opportunities" };
  }
}

// ─── Get Single Opportunity ───────────────────────────────────────────────────

export async function getOpportunityById(id: string) {
  try {
    await connectToDatabase();
    const opportunity = await Opportunity.findById(id).lean();
    if (!opportunity) return { success: false, error: "Not found" };

    // Increment views
    await Opportunity.findByIdAndUpdate(id, { $inc: { views: 1 } });

    return { success: true, opportunity: JSON.parse(JSON.stringify(opportunity)) };
  } catch (error) {
    console.error("[Actions] getOpportunityById error:", error);
    return { success: false, error: "Failed to fetch opportunity" };
  }
}

// ─── Get Trending ─────────────────────────────────────────────────────────────

export async function getTrending(limit = 8) {
  try {
    const db = await connectToDatabase();
    if (!db) {
      return { success: true, opportunities: FALLBACK_OPPORTUNITIES.filter((opp) => opp.isTrending).slice(0, limit) };
    }
    const opportunities = await Opportunity.find({ isTrending: true, isExpired: false })
      .sort({ views: -1 })
      .limit(limit)
      .lean();

    return { success: true, opportunities: JSON.parse(JSON.stringify(opportunities)) };
  } catch (error) {
    console.error("[Actions] getTrending error:", error);
    return { success: false, opportunities: [] };
  }
}

// ─── Get Featured ─────────────────────────────────────────────────────────────

export async function getFeatured(limit = 6) {
  try {
    const db = await connectToDatabase();
    if (!db) {
      return { success: true, opportunities: FALLBACK_OPPORTUNITIES.filter((opp) => opp.isFeatured).slice(0, limit) };
    }
    const opportunities = await Opportunity.find({
      isFeatured: true,
      isExpired: false,
      type: "hackathon",
    })
      .sort({ postedAt: -1 })
      .limit(limit)
      .lean();

    return { success: true, opportunities: JSON.parse(JSON.stringify(opportunities)) };
  } catch (error) {
    console.error("[Actions] getFeatured error:", error);
    return { success: false, opportunities: [] };
  }
}

// ─── Skill-based Recommendations ─────────────────────────────────────────────

/**
 * Simple skill-vector cosine similarity recommendation engine.
 * Compares user skills against opportunity skills and returns top matches.
 */
export async function getRecommendations(userSkills: string[], limit = 10) {
  try {
    if (!userSkills || userSkills.length === 0) {
      return { success: false, opportunities: [], error: "No skills provided" };
    }

    await connectToDatabase();

    // Fetch candidates (not expired, with skills)
    const candidates = await Opportunity.find({
      isExpired: false,
      skills: { $exists: true, $ne: [] },
    })
      .select("_id title company type location stipend deadline skills tags logo applyLink source postedAt isFeatured isTrending registerCount")
      .lean();

    const normalizedUserSkills = userSkills.map((s) => s.toLowerCase().trim());

    // Score each candidate by skill overlap (Jaccard similarity)
    const scored = candidates.map((opp) => {
      const oppSkills = (opp.skills || []).map((s: string) => s.toLowerCase().trim());
      const intersection = normalizedUserSkills.filter((s) => oppSkills.includes(s)).length;
      const union = new Set([...normalizedUserSkills, ...oppSkills]).size;
      const score = union === 0 ? 0 : intersection / union;
      return { ...opp, _score: score };
    });

    // Filter by min score and sort
    const recommendations = scored
      .filter((o) => o._score > 0)
      .sort((a, b) => b._score - a._score)
      .slice(0, limit);

    return {
      success: true,
      opportunities: JSON.parse(JSON.stringify(recommendations)),
    };
  } catch (error) {
    console.error("[Actions] getRecommendations error:", error);
    return { success: false, opportunities: [], error: "Failed to get recommendations" };
  }
}

// ─── Bookmark ─────────────────────────────────────────────────────────────────

export async function incrementBookmark(id: string) {
  try {
    await connectToDatabase();
    await Opportunity.findByIdAndUpdate(id, { $inc: { bookmarks: 1 } });
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

// ─── Admin Stats ─────────────────────────────────────────────────────────────

export async function getAdminStats() {
  try {
    await connectToDatabase();

    const [total, byType, bySources, expired, today, trending] = await Promise.all([
      Opportunity.countDocuments(),
      Opportunity.aggregate([
        { $group: { _id: "$type", count: { $sum: 1 } } },
      ]),
      Opportunity.aggregate([
        { $group: { _id: "$source", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      Opportunity.countDocuments({ isExpired: true }),
      Opportunity.countDocuments({
        postedAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      }),
      Opportunity.countDocuments({ isTrending: true }),
    ]);

    return {
      success: true,
      stats: {
        total,
        byType: Object.fromEntries(byType.map((b: any) => [b._id, b.count])),
        bySources,
        expired,
        today,
        trending,
        active: total - expired,
      },
    };
  } catch (error) {
    console.error("[Actions] getAdminStats error:", error);
    return { success: false, stats: null };
  }
}
