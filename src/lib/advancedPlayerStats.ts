import { prisma } from "./prisma";
import { calculatePlayerRoleStats } from "./roleUtils";
import { getLeaderboardData } from "./leaderboardData";

export async function getAdvancedPlayerStatsForTV() {
  const allMatches = await prisma.match.findMany({
    where: { winnerTeamId: { not: null } },
    include: {
      teamA: { include: { player1: true, player2: true } },
      teamB: { include: { player1: true, player2: true } }
    }
  });

  const allPlayers = await prisma.player.findMany();
  const { playerStats } = await getLeaderboardData();
  
  const playerRankMap = new Map();
  playerStats.forEach((p: any, idx: number) => {
    playerRankMap.set(p.id, idx + 1);
  });

  const advancedStats = allPlayers.map(player => {
    const rank = playerRankMap.get(player.id) || null;
    const basicStats = playerStats.find(p => p.id === player.id) || { played: 0, wins: 0, winRate: 0 };
    
    // Skip players with 0 matches
    if (basicStats.played === 0) return null;

    // Calculate total goals made by this player's team across all matches
    let totalGoalsScored = 0;
    allMatches.forEach((m: any) => {
      const isTeamA = m.teamA?.player1Id === player.id || m.teamA?.player2Id === player.id;
      const isTeamB = m.teamB?.player1Id === player.id || m.teamB?.player2Id === player.id;
      if (!isTeamA && !isTeamB) return;

      if (m.setScores) {
        try {
          const parsedSets = typeof m.setScores === 'string' ? JSON.parse(m.setScores) : m.setScores;
          if (Array.isArray(parsedSets)) {
            parsedSets.forEach((set: any) => {
              if (isTeamA) totalGoalsScored += Number(set.scoreA || 0);
              else totalGoalsScored += Number(set.scoreB || 0);
            });
          }
        } catch (e) {}
      } else {
        if (isTeamA) totalGoalsScored += Number(m.scoreTeamA || 0);
        else totalGoalsScored += Number(m.scoreTeamB || 0);
      }
    });

    const avgGoalsPerMatch = basicStats.played > 0
      ? (totalGoalsScored / basicStats.played).toFixed(2)
      : null;

    const roleStats = calculatePlayerRoleStats(player.id, allMatches);

    return {
      player,
      rank,
      played: basicStats.played,
      wins: basicStats.wins,
      winRate: basicStats.winRate,
      totalGoalsScored,
      avgGoalsPerMatch,
      roleStats,
    };
  });
  
  const validStats = advancedStats.filter(Boolean) as any[];

  // Sort by rank
  return validStats.sort((a, b) => {
    if (a.rank && b.rank) return a.rank - b.rank;
    if (a.rank) return -1;
    if (b.rank) return 1;
    return 0;
  });
}
