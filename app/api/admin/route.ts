import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Opportunity from "@/database/opportunity.model";

/** GET /api/admin — dashboard statistics */
export async function GET() {
  try {
    await connectToDatabase();

    const [total, byType, bySources, expired, today, trending] = await Promise.all([
      Opportunity.countDocuments(),
      Opportunity.aggregate([{ $group: { _id: "$type", count: { $sum: 1 } } }]),
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

    const typeMap = Object.fromEntries(byType.map((b: any) => [b._id, b.count]));

    return NextResponse.json({
      total,
      active: total - expired,
      expired,
      today,
      trending,
      hackathons: typeMap["hackathon"] || 0,
      internships: typeMap["internship"] || 0,
      jobs: typeMap["job"] || 0,
      bySources,
    });
  } catch (err) {
    console.error("[GET /api/admin]", err);
    return NextResponse.json({ error: "Failed to load stats" }, { status: 500 });
  }
}
