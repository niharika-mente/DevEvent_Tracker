import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Opportunity from "@/database/opportunity.model";

/** GET /api/opportunities/:id */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const opp = await Opportunity.findById(params.id).lean();
    if (!opp) return NextResponse.json({ error: "Not found" }, { status: 404 });
    // Increment views asynchronously
    Opportunity.findByIdAndUpdate(params.id, { $inc: { views: 1 } }).exec();
    return NextResponse.json({ opportunity: opp });
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
