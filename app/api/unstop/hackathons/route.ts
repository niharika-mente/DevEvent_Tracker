import { NextResponse } from "next/server";
import { FALLBACK_OPPORTUNITIES } from "@/lib/fallback-data";

/** GET /api/unstop/hackathons?page=1&q=search */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const q = searchParams.get("q") || "";

  try {
    const params = new URLSearchParams({
      opportunity: "hackathons", page: String(page), per_page: "12",
      deadline: "", sort: "0", ...(q && { search: q }),
    });

    const res = await fetch(`https://unstop.com/api/public/opportunity/search?${params}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "application/json, text/plain, */*",
        Referer: "https://unstop.com/hackathons",
        Origin: "https://unstop.com",
      },
      next: { revalidate: 1800 },
    });

    if (!res.ok) throw new Error(`Unstop API ${res.status}`);
    const json = await res.json();
    const items: any[] = json?.data?.data || [];

    const hackathons = items.map((item) => ({
      _id: String(item.id),
      title: item.title,
      image: item.banner?.image_url || item.banner_mobile?.image_url ||
        `https://d8it4huxumps7.cloudfront.net/lambda-pdfs/opportunity-bannerImages/${item.id}.png`,
      orgLogo: item.logoUrl2 || item.logoUrl || "",
      location: item.location || (item.region === "online" ? "Online" : "Offline / Hybrid"),
      startDate: item.start_date ? new Date(item.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "",
      endDate: item.end_date ? new Date(item.end_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "",
      prizePool: item.overall_prizes || (item.prizes?.[0]?.cash ? `₹${Number(item.prizes[0].cash).toLocaleString("en-IN")}+` : "Certificates + Prizes"),
      mode: item.region || "online",
      organizer: item.organisation?.name || "Unknown",
      tags: (item.filters || []).slice(0, 3).map((f: any) => f.name),
      registrationLink: item.seo_url || `https://unstop.com/${item.public_url}`,
      daysLeft: item.time_left?.days_left ?? 0,
      registerCount: item.registerCount || 0,
      regnOpen: item.regn_open === 1,
    }));

    return NextResponse.json({ hackathons, total: json?.data?.total || hackathons.length });
  } catch (err) {
    console.warn("[Unstop hackathons] falling back to local demo data:", err);
    const hackathons = FALLBACK_OPPORTUNITIES.filter((opp) => opp.type === "hackathon")
      .slice(0, 12)
      .map((opp) => ({
        _id: String(opp._id),
        title: opp.title,
        image: opp.logo || "/images/event1.png",
        orgLogo: opp.logo || "",
        location: opp.location,
        startDate: new Date(opp.postedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
        endDate: new Date(opp.deadline || Date.now()).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
        prizePool: opp.stipend || "Certificates + Prizes",
        mode: opp.isRemote ? "online" : "offline",
        organizer: opp.company,
        tags: opp.tags.slice(0, 3),
        registrationLink: opp.applyLink,
        daysLeft: Math.max(0, Math.ceil((new Date(opp.deadline || Date.now()).getTime() - Date.now()) / 86_400_000)),
        registerCount: opp.registerCount || 0,
        regnOpen: !opp.isExpired,
      }));

    return NextResponse.json({ hackathons, total: hackathons.length });
  }
}
