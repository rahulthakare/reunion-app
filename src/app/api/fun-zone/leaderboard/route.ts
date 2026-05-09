import { NextResponse, type NextRequest } from "next/server";
import { getSessionUser } from "../_helpers";
import { getLeaderboard } from "@/lib/utils/funZone";

// GET /api/fun-zone/leaderboard — auth required
export async function GET(request: NextRequest) {
  const user = await getSessionUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const scores = await getLeaderboard(100);
    return NextResponse.json({ scores });
  } catch (err) {
    console.error("[GET leaderboard] failed:", err);
    return NextResponse.json({ error: "Failed to fetch leaderboard." }, { status: 500 });
  }
}
