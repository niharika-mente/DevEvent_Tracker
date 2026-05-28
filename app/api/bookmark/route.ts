import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Opportunity from "@/database/opportunity.model";

/**
 * POST /api/bookmark
 * Body: { id: string }
 * Increments the bookmark count for an opportunity.
 * Actual bookmark list is managed client-side in localStorage.
 */
export async function POST(request: Request) {
  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    await connectToDatabase();
    const updated = await Opportunity.findByIdAndUpdate(
      id,
      { $inc: { bookmarks: 1 } },
      { new: true, select: "bookmarks" }
    ).lean();
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, bookmarks: (updated as any).bookmarks });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

/** DELETE /api/bookmark — decrement bookmark count */
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    await connectToDatabase();
    await Opportunity.findByIdAndUpdate(id, { $inc: { bookmarks: -1 } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
