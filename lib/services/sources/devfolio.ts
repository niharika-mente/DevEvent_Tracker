import { IOpportunity, generateOpportunityHash } from "@/database/opportunity.model";

/**
 * Devfolio hackathons service.
 * Fetches from Devfolio's public listing API endpoint.
 */
export async function fetchDevfolioHackathons(): Promise<Partial<IOpportunity>[]> {
  try {
    const res = await fetch(
      "https://devfolio.co/api/search/hackathons?type=upcoming&page=0&per_page=20",
      {
        headers: {
          Accept: "application/json",
          "User-Agent": "Mozilla/5.0",
        },
        next: { revalidate: 3600 },
      }
    );
    if (!res.ok) throw new Error(`Devfolio API ${res.status}`);
    const json = await res.json();
    const items: any[] = json?.results || json?.hackathons || [];

    return items.map((h) => {
      const title = h.name || h.title || "Hackathon";
      const company = h.team_name || h.organizer || "Devfolio";
      const source = "Devfolio";
      return {
        title,
        company,
        type: "hackathon" as const,
        location: h.city ? `${h.city}, India` : "Online",
        isRemote: !h.city || h.is_online,
        stipend: h.prize_pool ? `$${h.prize_pool}` : "Prizes & Goodies",
        deadline: h.registration_closes_at ? new Date(h.registration_closes_at) : undefined,
        skills: (h.themes || h.tags || []).slice(0, 6),
        tags: ["Devfolio", "Hackathon", ...(h.themes || []).slice(0, 2)],
        applyLink: `https://devfolio.co/hackathons/${h.slug || ""}`,
        source,
        logo: h.favicon || h.logo || "https://devfolio.co/favicon.ico",
        description: h.tagline || h.description || "",
        postedAt: h.starts_at ? new Date(h.starts_at) : new Date(),
        externalId: h.id || h.slug,
        registerCount: h.total_applications || 0,
        hash: generateOpportunityHash(title, company, source),
      };
    });
  } catch (err) {
    console.error("[Devfolio] Fetch failed:", err);
    return [];
  }
}
