import { NextResponse } from "next/server";

/** GET /api/unstop/jobs?page=1&q=search */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page") || "1";
  const q = searchParams.get("q") || "";

  try {
    const params = new URLSearchParams({
      opportunity: "jobs", page, per_page: "12",
      deadline: "", sort: "0", ...(q && { search: q }),
    });

    const res = await fetch(`https://unstop.com/api/public/opportunity/search?${params}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "application/json, text/plain, */*",
        Referer: "https://unstop.com/jobs",
        Origin: "https://unstop.com",
      },
      next: { revalidate: 1800 },
    });

    if (!res.ok) throw new Error(`Unstop API ${res.status}`);
    const json = await res.json();
    const items: any[] = json?.data?.data || [];

    const jobs = items.map((item) => ({
      _id: String(item.id),
      title: item.title,
      image: item.banner?.image_url || item.banner_mobile?.image_url ||
        `https://d8it4huxumps7.cloudfront.net/lambda-pdfs/opportunity-bannerImages/${item.id}.png`,
      orgLogo: item.logoUrl2 || item.logoUrl || "",
      company: item.organisation?.name || "Unknown Company",
      location: item.location || (item.region === "online" ? "Remote" : "On-site"),
      jobType: item.job_type || "Full-time",
      postedDate: item.start_date ? new Date(item.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "",
      deadline: item.end_date ? new Date(item.end_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "",
      salaryInfo: item.overall_prizes || "CTC available on Unstop",
      tags: (item.filters || []).slice(0, 3).map((f: any) => f.name),
      registrationLink: item.seo_url || `https://unstop.com/${item.public_url}`,
      daysLeft: item.time_left?.days_left ?? 0,
      registerCount: item.registerCount || 0,
      regnOpen: item.regn_open === 1,
      mode: item.region || "offline",
    }));

    return NextResponse.json({ jobs, total: json?.data?.total || jobs.length });
  } catch (err) {
    console.error("[Unstop jobs]", err);
    return NextResponse.json({ jobs: [], error: "Failed to fetch from Unstop" }, { status: 500 });
  }
}
