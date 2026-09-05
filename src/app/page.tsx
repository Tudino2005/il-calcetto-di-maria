export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { getLeaderboardData } from "@/lib/leaderboardData";
import TVSlideshow from "@/components/TVSlideshow";

export const revalidate = 0; // Disable caching for live TV mode

export default async function TVHomePage() {
  const promoTournaments = await prisma.tournament.findMany({
    where: { status: { in: ["setup", "ready_to_draw"] } },
    orderBy: { createdAt: "desc" },
    include: { registrations: { include: { player: true } } }
  });

  const inProgressTournaments = await prisma.tournament.findMany({
    where: { status: "in_progress" },
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
    take: 6,
    include: {
      teamA: { include: { player1: true, player2: true } },
      teamB: { include: { player1: true, player2: true } }
    }
  });

  const { playerStats, teamStats } = await getLeaderboardData();

  const data = {
    promoTournaments,
    inProgressTournaments,
    completedTournaments,
    recentFreeMatches,
    playerStats,
    teamStats
  };

  return <TVSlideshow data={data} />;
}
