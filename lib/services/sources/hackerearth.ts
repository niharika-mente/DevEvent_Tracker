import { IOpportunity } from "@/database/opportunity.model";
import { generateOpportunityHash } from "@/database/opportunity.model";

/**
 * HackerEarth Challenges API service.
 * Uses HackerEarth's documented public API to fetch live hackathons/challenges.
 * Docs: https://www.hackerearth.com/docs/wiki/developers/v2/
 *
 * Requires HACKEREARTH_CLIENT_ID in environment variables (free to register).
 * Falls back gracefully if no API key is provided.
 */

const HE_BASE = "https://www.hackerearth.com/api/v2";
const CLIENT_ID = process.env.HACKEREARTH_CLIENT_ID || "";

interface HEChallenge {
  id: number;
  title: string;
  slug: string;
  url: string;
  start_time: string;
  end_time: string;
  description?: string;
  type: string;
  prize?: { description: string };
  organization?: { name: string; logo?: string };
  skills?: string[];
  tags?: string[];
}

/**
 * Fetch challenges from HackerEarth API.
 * Returns hackathon-type opportunities.
 */
export async function fetchHackerEarthOpportunities(): Promise<Partial<IOpportunity>[]> {
  if (!CLIENT_ID) {
    console.warn("[HackerEarth] No CLIENT_ID set — skipping live fetch");
    return [];
  }

  try {
    const res = await fetch(
      `${HE_BASE}/challenges/?client_id=${CLIENT_ID}&limit=20&status=ongoing`,
      {
        headers: { Accept: "application/json" },
        next: { revalidate: 3600 },
      }
    );

    if (!res.ok) {
      throw new Error(`HackerEarth API ${res.status}`);
    }

    const json = await res.json();
    const challenges: HEChallenge[] = json.results || [];

    return challenges.map((c) => {
      const title = c.title;
      const company = c.organization?.name || "HackerEarth";
      const source = "HackerEarth";

      return {
        title,
        company,
        type: "hackathon" as const,
        location: "Online",
        isRemote: true,
        stipend: c.prize?.description || "Prizes & Certificates",
        deadline: c.end_time ? new Date(c.end_time) : undefined,
        skills: c.skills || [],
        tags: c.tags || ["HackerEarth", "Online"],
        applyLink: c.url,
        source,
        logo: c.organization?.logo || "https://www.hackerearth.com/favicon.ico",
        description: c.description || "",
        postedAt: c.start_time ? new Date(c.start_time) : new Date(),
        externalId: String(c.id),
        hash: generateOpportunityHash(title, company, source),
      };
    });
  } catch (err) {
    console.error("[HackerEarth] Fetch failed:", err);
    return [];
  }
}
