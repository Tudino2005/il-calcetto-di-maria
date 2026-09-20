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

    const roleStats = calculatePlayerRoleStats(player.id, allMatches);

    // Calculate ideal partner
    const partnerMap = new Map();
    allMatches.forEach((m: any) => {
      const isTeamA = m.teamA?.player1Id === player.id || m.teamA?.player2Id === player.id;
      const isTeamB = m.teamB?.player1Id === player.id || m.teamB?.player2Id === player.id;
      if (!isTeamA && !isTeamB) return;

      const myTeam = isTeamA ? m.teamA : m.teamB;
      const partner = myTeam.player1Id === player.id ? myTeam.player2 : myTeam.player1;
      if (!partner) return;

      const iWon = m.winnerTeamId === myTeam.id;

      let goalsAgainst = 0;
      let goalsFor = 0;
      if (m.setScores) {
        try {
          const parsedSets = typeof m.setScores === 'string' ? JSON.parse(m.setScores) : m.setScores;
          if (Array.isArray(parsedSets)) {
            parsedSets.forEach((set: any) => {
              if (isTeamA) {
                goalsFor += Number(set.scoreA || 0);
                goalsAgainst += Number(set.scoreB || 0);
              } else {
                goalsFor += Number(set.scoreB || 0);
                goalsAgainst += Number(set.scoreA || 0);
              }
            });
          }
        } catch (e) {}
      }

      if (!partnerMap.has(partner.id)) {
        partnerMap.set(partner.id, { partner, played: 0, wins: 0, goalsConceded: 0, goalsScored: 0 });
      }
      const entry = partnerMap.get(partner.id)!;
      entry.played += 1;
      if (iWon) entry.wins += 1;
      entry.goalsConceded += goalsAgainst;
      entry.goalsScored += goalsFor;
    });

    const partnerStatsArr = Array.from(partnerMap.values()).map(p => ({
      ...p,
      winRate: p.played > 0 ? ((p.wins / p.played) * 100).toFixed(1) : "0.0"
    }));

    let idealPartner = partnerStatsArr.filter(p => p.played >= 3).sort((a, b) => {
      const wrDiff = Number(b.winRate) - Number(a.winRate);
      if (wrDiff !== 0) return wrDiff;
      if (b.played !== a.played) return b.played - a.played;
      if (a.goalsConceded !== b.goalsConceded) return a.goalsConceded - b.goalsConceded;
      const rankA = playerRankMap.get(a.partner.id) || 999;
      const rankB = playerRankMap.get(b.partner.id) || 999;
      return rankA - rankB;
    });

    return {
      player,
      rank,
      played: basicStats.played,
      wins: basicStats.wins,
      winRate: basicStats.winRate,
      roleStats,
      idealPartner: idealPartner.length > 0 ? idealPartner[0].partner.name : null
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
