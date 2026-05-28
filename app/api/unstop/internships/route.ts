import { NextResponse } from "next/server";

/** GET /api/unstop/internships?page=1&q=search */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page") || "1";
  const q = searchParams.get("q") || "";

  try {
    const params = new URLSearchParams({
      opportunity: "internships", page, per_page: "12",
      deadline: "", sort: "0", ...(q && { search: q }),
    });

    const res = await fetch(`https://unstop.com/api/public/opportunity/search?${params}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "application/json, text/plain, */*",
        Referer: "https://unstop.com/internships",
        Origin: "https://unstop.com",
      },
      next: { revalidate: 1800 },
    });

    if (!res.ok) throw new Error(`Unstop API ${res.status}`);
    const json = await res.json();
    const items: any[] = json?.data?.data || [];

    const internships = items.map((item) => ({
      _id: String(item.id),
      title: item.title,
      image: item.banner?.image_url || item.banner_mobile?.image_url ||
        `https://d8it4huxumps7.cloudfront.net/lambda-pdfs/opportunity-bannerImages/${item.id}.png`,
      orgLogo: item.logoUrl2 || item.logoUrl || "",
      company: item.organisation?.name || "Unknown Company",
      location: item.location || (item.region === "online" ? "Remote" : "On-site"),
      duration: item.regnRequirements?.duration || "Varies",
      startDate: item.start_date ? new Date(item.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "",
      deadline: item.end_date ? new Date(item.end_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "",
      stipendInfo: item.overall_prizes || "Stipend info on Unstop",
      tags: (item.filters || []).slice(0, 3).map((f: any) => f.name),
      registrationLink: item.seo_url || `https://unstop.com/${item.public_url}`,
      daysLeft: item.time_left?.days_left ?? 0,
      registerCount: item.registerCount || 0,
      regnOpen: item.regn_open === 1,
      mode: item.region || "offline",
    }));

    return NextResponse.json({ internships, total: json?.data?.total || internships.length });
  } catch (err) {
    console.error("[Unstop internships]", err);
    return NextResponse.json({ internships: [], error: "Failed to fetch from Unstop" }, { status: 500 });
  }
}
