import { IOpportunity } from "@/database/opportunity.model";
import { generateOpportunityHash } from "@/database/opportunity.model";

/**
 * Unstop public API service.
 * Fetches hackathons, internships, and jobs from Unstop's public search endpoint.
 * No auth required — uses same headers as a browser request.
 */

const UNSTOP_BASE = "https://unstop.com/api/public/opportunity/search";

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept: "application/json, text/plain, */*",
  Referer: "https://unstop.com/",
  Origin: "https://unstop.com",
};

function formatDate(dateStr: string): Date | undefined {
  if (!dateStr) return undefined;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? undefined : d;
}

function getPrize(item: any): string {
  if (item.overall_prizes) return item.overall_prizes;
  if (item.prizes?.length > 0) {
    const p = item.prizes[0];
    if (p.cash) return `₹${Number(p.cash).toLocaleString("en-IN")}+`;
  }
  return "Certificates + Prizes";
}

/**
 * Fetch a single category from Unstop's API and normalize to IOpportunity.
 * @param category - "hackathons" | "internships" | "jobs"
 * @param page - page number (1-indexed)
 * @param perPage - results per page
 */
async function fetchUnstopCategory(
  category: "hackathons" | "internships" | "jobs",
  page = 1,
  perPage = 20
): Promise<{ items: Partial<IOpportunity>[]; total: number }> {
  const opportunityMap: Record<string, string> = {
    hackathons: "hackathons",
    internships: "internships",
    jobs: "jobs",
  };

  const params = new URLSearchParams({
    opportunity: opportunityMap[category],
    page: String(page),
    per_page: String(perPage),
    deadline: "",
    sort: "0",
  });

  const res = await fetch(`${UNSTOP_BASE}?${params}`, {
    headers: HEADERS,
    next: { revalidate: 3600 }, // Next.js cache: 1 hour
  });

  if (!res.ok) {
    throw new Error(`Unstop ${category} API returned ${res.status}`);
  }

  const json = await res.json();
  const raw: any[] = json?.data?.data || [];

  const items: Partial<IOpportunity>[] = raw.map((item) => {
    const title = item.title || "Untitled";
    const company = item.organisation?.name || "Unknown Organization";
    const source = "Unstop";

    const base: Partial<IOpportunity> = {
      title,
      company,
      type: category === "hackathons" ? "hackathon" : category === "internships" ? "internship" : "job",
      location: item.location || (item.region === "online" ? "Online / Remote" : "India"),
      isRemote: item.region === "online",
      deadline: formatDate(item.end_date),
      skills: (item.filters || []).slice(0, 8).map((f: any) => f.name),
      tags: (item.filters || []).slice(0, 4).map((f: any) => f.name),
      applyLink: item.seo_url || `https://unstop.com/${item.public_url || ""}`,
      source,
      logo: item.logoUrl2 || item.logoUrl || "",
      description: item.description || "",
      postedAt: formatDate(item.start_date) || new Date(),
      externalId: String(item.id),
      registerCount: item.registerCount || 0,
      hash: generateOpportunityHash(title, company, source),
    };

    if (category === "hackathons") {
      base.stipend = getPrize(item);
    } else if (category === "internships") {
      base.stipend = item.overall_prizes || "Stipend available on Unstop";
      base.duration = item.regnRequirements?.duration || undefined;
    } else {
      base.stipend = "Salary available on Unstop";
    }

    return base;
  });

  return { items, total: json?.data?.total || items.length };
}

/** Fetch all three Unstop categories and return normalized items. */
export async function fetchUnstopOpportunities(): Promise<Partial<IOpportunity>[]> {
  const results: Partial<IOpportunity>[] = [];

  const categories: Array<"hackathons" | "internships" | "jobs"> = [
    "hackathons",
    "internships",
    "jobs",
  ];

  // Fetch all categories in parallel with retry
  await Promise.allSettled(
    categories.map(async (cat) => {
      try {
        const { items } = await fetchUnstopCategory(cat, 1, 20);
        results.push(...items);
        console.log(`[Unstop] Fetched ${items.length} ${cat}`);
      } catch (err) {
        console.warn(`[Unstop] Failed to fetch ${cat}:`, err);
      }
    })
  );

  return results;
}

// Named export for direct route handler use (single category)
export { fetchUnstopCategory };
