import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Opportunity from "@/database/opportunity.model";

/** GET /api/featured — featured hackathons for carousel */
export async function GET() {
  try {
    await connectToDatabase();
    const opportunities = await Opportunity.find({
      isFeatured: true, isExpired: false, type: "hackathon",
    }).sort({ postedAt: -1 }).limit(6).lean();
    return NextResponse.json({ opportunities });
  } catch {
    return NextResponse.json({ opportunities: [], error: "Failed" }, { status: 500 });
  }
}
