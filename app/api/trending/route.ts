import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Opportunity from "@/database/opportunity.model";

/** GET /api/trending — top trending opportunities */
export async function GET() {
  try {
    await connectToDatabase();
    const opportunities = await Opportunity.find({ isTrending: true, isExpired: false })
      .sort({ views: -1 }).limit(8).lean();
    return NextResponse.json({ opportunities });
  } catch {
    return NextResponse.json({ opportunities: [], error: "Failed" }, { status: 500 });
  }
}
