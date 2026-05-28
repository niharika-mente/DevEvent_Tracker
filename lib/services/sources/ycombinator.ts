import { IOpportunity, generateOpportunityHash } from "@/database/opportunity.model";

/**
 * Y Combinator Work at a Startup job board.
 * Uses their public JSON endpoint (no auth required).
 */
export async function fetchYCombinatorJobs(): Promise<Partial<IOpportunity>[]> {
  try {
    const res = await fetch("https://www.ycombinator.com/jobs.json", {
      next: { revalidate: 7200 },
    });
    if (!res.ok) throw new Error(`YC API returned ${res.status}`);
    const jobs: any[] = await res.json();

    return jobs.slice(0, 30).map((j) => {
      const title = j.title || "Software Engineer";
      const company = j.company_name || "YC Startup";
      const source = "Y Combinator";
      return {
        title,
        company,
        type: "job" as const,
        location: j.location || "Remote",
        isRemote: (j.remote || "").toLowerCase().includes("remote"),
        stipend: j.salary || "Competitive",
        skills: (j.tags || []).slice(0, 6),
        tags: ["YC", "Startup", ...(j.tags || []).slice(0, 2)],
        applyLink: j.url || "https://www.workatastartup.com/jobs",
        source,
        logo: j.company_logo || "https://www.ycombinator.com/favicon.ico",
        description: j.description || "",
        postedAt: j.created_at ? new Date(j.created_at) : new Date(),
        externalId: String(j.id || j.title),
        hash: generateOpportunityHash(title, company, source),
      };
    });
  } catch (err) {
    console.error("[YCombinator] Fetch failed:", err);
    return [];
  }
}
