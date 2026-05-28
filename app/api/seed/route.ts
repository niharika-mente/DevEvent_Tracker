import { NextResponse } from "next/server";
import { seedDatabase } from "@/lib/services/opportunity.service";

/**
 * POST /api/seed
 * Seeds the database with sample opportunity data.
 * DISABLED in production — only works in development mode.
 */
export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Seed disabled in production" }, { status: 403 });
  }

  try {
    const { inserted, skipped } = await seedDatabase();
    return NextResponse.json({
      success: true,
      message: `Seeded DB: ${inserted} inserted, ${skipped} skipped (duplicates)`,
      inserted,
      skipped,
    });
  } catch (err: any) {
    console.error("[POST /api/seed]", err);
    return NextResponse.json({ error: err?.message || "Seed failed" }, { status: 500 });
  }
}
