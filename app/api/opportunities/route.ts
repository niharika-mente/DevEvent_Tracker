import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Opportunity from "@/database/opportunity.model";
import { FALLBACK_OPPORTUNITIES } from "@/lib/fallback-data";
import { FilterQuery } from "mongoose";

/**
 * GET /api/opportunities
 * Query params: type, search, location, remote, skills, company, source, page, limit, sortBy
 */
export async function GET(request: Request) {
  try {
    const db = await connectToDatabase();
    const { searchParams } = new URL(request.url);

    if (!db) {
      const type = searchParams.get("type") as "hackathon" | "internship" | "job" | null;
      const search = searchParams.get("search") || "";
      const location = searchParams.get("location") || "";
      const remote = searchParams.get("remote") === "true";
      const skills = searchParams.get("skills") || "";
      const company = searchParams.get("company") || "";
      const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
      const limit = Math.min(50, parseInt(searchParams.get("limit") || "12"));

      const filtered = FALLBACK_OPPORTUNITIES.filter((opp) => {
        const matchesType = !type || opp.type === type;
        const matchesSearch = !search || [opp.title, opp.company, opp.description, ...opp.skills, ...opp.tags].join(" ").toLowerCase().includes(search.toLowerCase());
        const matchesLocation = !location || opp.location.toLowerCase().includes(location.toLowerCase());
        const matchesRemote = !remote || opp.isRemote === true;
        const matchesSkills = !skills || skills.split(",").map((s) => s.trim()).every((skill) => opp.skills.includes(skill));
        const matchesCompany = !company || opp.company.toLowerCase().includes(company.toLowerCase());
        return matchesType && matchesSearch && matchesLocation && matchesRemote && matchesSkills && matchesCompany;
      });

      const start = (page - 1) * limit;
      return NextResponse.json({
        opportunities: filtered.slice(start, start + limit),
        total: filtered.length,
        page,
        totalPages: Math.ceil(filtered.length / limit) || 1,
      });
    }

    const type = searchParams.get("type") as "hackathon" | "internship" | "job" | null;
    const search = searchParams.get("search") || "";
    const location = searchParams.get("location") || "";
    const remote = searchParams.get("remote");
    const skills = searchParams.get("skills");
    const company = searchParams.get("company") || "";
    const source = searchParams.get("source") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, parseInt(searchParams.get("limit") || "12"));
    const sortBy = searchParams.get("sortBy") || "latest";

    const query: FilterQuery<any> = { isExpired: false };

    if (type && ["hackathon", "internship", "job"].includes(type)) query.type = type;
    if (remote === "true") query.isRemote = true;
    if (remote === "false") query.isRemote = false;
    if (source) query.source = source;
    if (search) query.$text = { $search: search };
    if (location) query.location = { $regex: location, $options: "i" };
    if (company) query.company = { $regex: company, $options: "i" };
    if (skills) {
      const skillArray = skills.split(",").map((s) => s.trim()).filter(Boolean);
      if (skillArray.length > 0) query.skills = { $in: skillArray };
    }

    const sortMap: Record<string, object> = {
      latest: { postedAt: -1 },
      deadline: { deadline: 1 },
      trending: { isTrending: -1, views: -1 },
      popular: { registerCount: -1 },
    };
    const sort = sortMap[sortBy] || { postedAt: -1 };
    const skip = (page - 1) * limit;

    const [opportunities, total] = await Promise.all([
      Opportunity.find(query).sort(sort).skip(skip).limit(limit).lean(),
      Opportunity.countDocuments(query),
    ]);

    return NextResponse.json({
      opportunities,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("[GET /api/opportunities]", error);
    return NextResponse.json({ opportunities: [], error: "Failed to fetch" }, { status: 500 });
  }
}
