import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Opportunity from "@/database/opportunity.model";
import { FALLBACK_OPPORTUNITIES } from "@/lib/fallback-data";

/** GET /api/featured — featured hackathons for carousel */
export async function GET() {
  try {
    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json({ opportunities: FALLBACK_OPPORTUNITIES.filter((opp) => opp.isFeatured).slice(0, 6) });
    }

    const opportunities = await Opportunity.find({
      isFeatured: true, isExpired: false, type: "hackathon",
    }).sort({ postedAt: -1 }).limit(6).lean();
    return NextResponse.json({ opportunities });
  } catch {
    return NextResponse.json({ opportunities: [], error: "Failed" }, { status: 500 });
  }
}
