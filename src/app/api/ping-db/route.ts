import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [matchStats] = await prisma.$queryRaw<any[]>`
      SELECT 
        COALESCE(SUM("scoreTeamA" + "scoreTeamB"), 0)::text as total_goals,
        COUNT(id)::text as total_matches,
        COUNT(CASE WHEN "winnerTeamId" IS NOT NULL THEN 1 END)::text as completed_matches
      FROM "Match"
    `;

    const [otherStats] = await prisma.$queryRaw<any[]>`
      SELECT 
        (SELECT COUNT(id) FROM "Player")::text as total_players,
        (SELECT COUNT(id) FROM "Tournament")::text as total_tournaments,
        (SELECT COUNT(id) FROM "TournamentRegistration")::text as total_registrations
    `;

    // Create a fingerprint hash string from these numbers
    const fingerprint = [
      matchStats?.total_goals,
      matchStats?.total_matches,
      matchStats?.completed_matches,
      otherStats?.total_players,
      otherStats?.total_tournaments,
      otherStats?.total_registrations
    ].join("-");

    return NextResponse.json({ fingerprint });
  } catch (error) {
    console.error("Ping DB error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
