export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { getLeaderboardData, getFreeMatchesLeaderboard } from "@/lib/leaderboardData";
import { getAdvancedPlayerStatsForTV } from "@/lib/advancedPlayerStats";
import TVSlideshow from "@/components/TVSlideshow";

export const revalidate = 0; // Disable caching for live TV mode

export default async function TVHomePage() {
  const promoTournaments = await prisma.tournament.findMany({
    where: { status: { in: ["setup", "ready_to_draw"] } },
    orderBy: { createdAt: "desc" },
    include: { registrations: { include: { player: true } } }
  });

  const inProgressTournaments = await prisma.tournament.findMany({
    where: { status: { in: ["in_progress", "drawing"] } },
    orderBy: { createdAt: "desc" },
    include: {
      matches: {
        include: {
          teamA: { include: { player1: true, player2: true } },
          teamB: { include: { player1: true, player2: true } }
        },
        orderBy: { playedAt: 'desc' } // Most recent matches first
      }
    }
  });

  const completedTournaments = await prisma.tournament.findMany({
    where: { status: "completed", winnerTeamId: { not: null } },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { winnerTeam: { include: { player1: true, player2: true } } }
  });

  const recentFreeMatches = await prisma.match.findMany({
    where: { tournamentId: null, winnerTeamId: { not: null } },
    orderBy: { playedAt: 'desc' },
    take: 15,
    include: {
      teamA: { include: { player1: true, player2: true } },
      teamB: { include: { player1: true, player2: true } }
    }
  });

  const { playerStats, teamStats } = await getLeaderboardData();
  const freeMatchesStats = await getFreeMatchesLeaderboard();
  const advancedPlayerStats = await getAdvancedPlayerStatsForTV();

  const data = {
    promoTournaments,
    inProgressTournaments,
    completedTournaments,
    recentFreeMatches,
    playerStats,
    teamStats,
    freeMatchesStats,
    advancedPlayerStats
  };

  return <TVSlideshow data={data} />;
}
