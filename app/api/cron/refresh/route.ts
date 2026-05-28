import { NextResponse } from "next/server";
import { refreshAllOpportunities } from "@/lib/services/opportunity.service";

/**
 * GET /api/cron/refresh
 * Called by Vercel Cron every 6 hours (configured in vercel.json).
 * Protected by CRON_SECRET header to prevent unauthorized triggers.
 */
export async function GET(request: Request) {
  // Verify cron secret to prevent unauthorized triggers
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log(`[Cron] Triggered at ${new Date().toISOString()}`);
    const result = await refreshAllOpportunities();
    console.log("[Cron] Complete:", result);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...result,
    });
  } catch (err: any) {
    console.error("[Cron] Failed:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Cron job failed" },
      { status: 500 }
    );
  }
}
