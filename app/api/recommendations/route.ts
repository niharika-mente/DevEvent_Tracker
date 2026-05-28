import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Opportunity from "@/database/opportunity.model";

/**
 * POST /api/recommendations
 * Body: { skills: string[] }
 * Returns Jaccard-similarity scored opportunities sorted by match score.
 */
export async function POST(request: Request) {
  try {
    const { skills } = await request.json();
    if (!skills?.length) {
      return NextResponse.json({ opportunities: [], error: "No skills provided" }, { status: 400 });
    }

    await connectToDatabase();

    const candidates = await Opportunity.find({
      isExpired: false,
      skills: { $exists: true, $ne: [] },
    })
      .select("title company type location stipend deadline skills tags logo applyLink source postedAt registerCount isFeatured isTrending")
      .lean();

    const userSkills = (skills as string[]).map((s) => s.toLowerCase().trim());

    const scored = candidates
      .map((opp) => {
        const oppSkills = (opp.skills || []).map((s: string) => s.toLowerCase().trim());
        const intersection = userSkills.filter((s) => oppSkills.includes(s)).length;
        const union = new Set([...userSkills, ...oppSkills]).size;
        const score = union === 0 ? 0 : Math.round((intersection / union) * 100);
        return { ...opp, matchScore: score };
      })
      .filter((o) => o.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10);

    return NextResponse.json({ opportunities: JSON.parse(JSON.stringify(scored)) });
  } catch (err) {
    console.error("[POST /api/recommendations]", err);
    return NextResponse.json({ opportunities: [], error: "Failed" }, { status: 500 });
  }
}
