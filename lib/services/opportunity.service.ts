import connectToDatabase from "@/lib/mongodb";
import Opportunity, { IOpportunity, generateOpportunityHash } from "@/database/opportunity.model";
import { fetchUnstopOpportunities } from "./sources/unstop";
import { fetchHackerEarthOpportunities } from "./sources/hackerearth";
import { fetchDevfolioHackathons } from "./sources/devfolio";
import { fetchYCombinatorJobs } from "./sources/ycombinator";
import { SEED_OPPORTUNITIES } from "./sources/seed.data";

/**
 * Core opportunity orchestration service.
 * Handles fetching from all sources, deduplication, expiry, and trending computation.
 */

// ─── Deduplication & Save ─────────────────────────────────────────────────────

/**
 * Inserts opportunities into the DB, skipping duplicates (by hash).
 * Returns count of newly inserted records.
 */
export async function deduplicateAndSave(
  items: Partial<IOpportunity>[]
): Promise<{ inserted: number; skipped: number }> {
  await connectToDatabase();
  let inserted = 0;
  let skipped = 0;

  // Process in batches of 10 to avoid overwhelming DB
  const BATCH_SIZE = 10;
  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE);

    await Promise.allSettled(
      batch.map(async (item) => {
        try {
          // Ensure hash is set
          if (!item.hash && item.title && item.company && item.source) {
            item.hash = generateOpportunityHash(item.title, item.company, item.source);
          }
          if (!item.hash) return;

          // insertOne with hash uniqueness check (upsert avoids race condition)
          await Opportunity.updateOne(
            { hash: item.hash },
            { $setOnInsert: item },
            { upsert: true }
          );
          inserted++;
        } catch (err: any) {
          // Duplicate key error (E11000) is expected and fine
          if (err?.code === 11000) {
            skipped++;
          } else {
            console.error("[OpportunityService] Save error:", err?.message);
            skipped++;
          }
        }
      })
    );
  }

  return { inserted, skipped };
}

// ─── Expiry Management ────────────────────────────────────────────────────────

/**
 * Marks all opportunities with a past deadline as expired.
 * Called by cron job every 6 hours.
 */
export async function expireOldOpportunities(): Promise<number> {
  await connectToDatabase();
  const result = await Opportunity.updateMany(
    { deadline: { $lt: new Date() }, isExpired: false },
    { $set: { isExpired: true } }
  );
  console.log(`[OpportunityService] Expired ${result.modifiedCount} opportunities`);
  return result.modifiedCount;
}

// ─── Trending Computation ─────────────────────────────────────────────────────

/**
 * Computes a trending score = views * 0.4 + bookmarks * 0.4 + recency * 0.2
 * and marks the top 10 as isTrending.
 */
export async function computeTrending(): Promise<void> {
  await connectToDatabase();

  // Reset all trending flags
  await Opportunity.updateMany({}, { $set: { isTrending: false } });

  const now = Date.now();
  const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;

  const opportunities = await Opportunity.find({ isExpired: false })
    .select("_id views bookmarks postedAt")
    .lean();

  // Score each opportunity
  const scored = opportunities.map((o) => {
    const ageMs = now - new Date(o.postedAt).getTime();
    const recencyScore = Math.max(0, 1 - ageMs / ONE_WEEK); // 0–1
    const score = o.views * 0.4 + o.bookmarks * 0.4 + recencyScore * 100 * 0.2;
    return { _id: o._id, score };
  });

  // Pick top 10
  const top10 = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map((o) => o._id);

  await Opportunity.updateMany(
    { _id: { $in: top10 } },
    { $set: { isTrending: true } }
  );

  console.log(`[OpportunityService] Updated trending: ${top10.length} opportunities`);
}

// ─── Main Refresh Orchestrator ────────────────────────────────────────────────

/**
 * Master function called by the cron job.
 * Fetches from all sources, deduplicates, saves, expires old, and recomputes trending.
 */
export async function refreshAllOpportunities(): Promise<{
  sources: Record<string, { fetched: number; error?: string }>;
  inserted: number;
  skipped: number;
  expired: number;
}> {
  console.log("[CronJob] Starting opportunity refresh...");
  const sourceStats: Record<string, { fetched: number; error?: string }> = {};
  const allItems: Partial<IOpportunity>[] = [];

  // ── Fetch from all sources in parallel ──
  const fetchers: Array<[string, () => Promise<Partial<IOpportunity>[]>]> = [
    ["Unstop", fetchUnstopOpportunities],
    ["HackerEarth", fetchHackerEarthOpportunities],
    ["Devfolio", fetchDevfolioHackathons],
    ["Y Combinator", fetchYCombinatorJobs],
  ];

  await Promise.allSettled(
    fetchers.map(async ([name, fetchFn]) => {
      try {
        const items = await fetchFn();
        allItems.push(...items);
        sourceStats[name] = { fetched: items.length };
        console.log(`[CronJob] ${name}: fetched ${items.length}`);
      } catch (err: any) {
        sourceStats[name] = { fetched: 0, error: err?.message };
        console.error(`[CronJob] ${name} failed:`, err?.message);
      }
    })
  );

  // ── Save with deduplication ──
  const { inserted, skipped } = await deduplicateAndSave(allItems);

  // ── Expire stale opportunities ──
  const expired = await expireOldOpportunities();

  // ── Recompute trending ──
  await computeTrending();

  console.log(`[CronJob] Done — inserted: ${inserted}, skipped: ${skipped}, expired: ${expired}`);

  return { sources: sourceStats, inserted, skipped, expired };
}

// ─── Seed DB ─────────────────────────────────────────────────────────────────

/**
 * Seeds the DB with sample data. Only intended for dev/first-run.
 */
export async function seedDatabase(): Promise<{ inserted: number; skipped: number }> {
  return deduplicateAndSave(
    SEED_OPPORTUNITIES.map((o) => ({
      ...o,
      hash: generateOpportunityHash(o.title, o.company, o.source),
    }))
  );
}
