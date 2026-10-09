import { prisma } from "./prisma";
import { calculatePlayerRoleStats, getEffectiveMatchRole } from "./roleUtils";
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
  const { playerStats, teamStats } = await getLeaderboardData();
  
  const playerRankMap = new Map();
  playerStats.forEach((p: any, idx: number) => {
    playerRankMap.set(p.id, idx + 1);
  });

  const advancedStats = allPlayers.map(player => {
    const rank = playerRankMap.get(player.id) || null;
    const basicStats = playerStats.find(p => p.id === player.id) || { played: 0, wins: 0, winRate: 0, points: 0 };
    
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
    // Calculate best partner and recent matches
    const partnerMap = new Map();
    const recentMatches: any[] = [];

    allMatches.forEach((m: any) => {
      const isTeamA = m.teamA?.player1Id === player.id || m.teamA?.player2Id === player.id;
      const isTeamB = m.teamB?.player1Id === player.id || m.teamB?.player2Id === player.id;
      if (!isTeamA && !isTeamB) return;

      recentMatches.push(m);

      let partner = null;
      let myTeam = null;
      let iWon = false;

      if (isTeamA) {
        myTeam = m.teamA;
        iWon = m.winnerTeamId === m.teamAId;
        partner = m.teamA.player1Id === player.id ? m.teamA.player2 : m.teamA.player1;
      } else {
        myTeam = m.teamB;
        iWon = m.winnerTeamId === m.teamBId;
        partner = m.teamB.player1Id === player.id ? m.teamB.player2 : m.teamB.player1;
      }

      if (partner) {
        if (!partnerMap.has(partner.id)) {
          partnerMap.set(partner.id, { partner, played: 0, wins: 0, goalsFor: 0, goalsAgainst: 0 });
        }
        const entry = partnerMap.get(partner.id);
        entry.played += 1;
        if (iWon) entry.wins += 1;
        
        let teamGoals = 0;
        let opponentGoals = 0;
        if (m.setScores) {
          try {
            const parsedSets = typeof m.setScores === 'string' ? JSON.parse(m.setScores) : m.setScores;
            if (Array.isArray(parsedSets)) {
              for (const set of parsedSets) {
                if (isTeamA) {
                  teamGoals += Number(set.scoreA || 0);
                  opponentGoals += Number(set.scoreB || 0);
                } else {
                  teamGoals += Number(set.scoreB || 0);
                  opponentGoals += Number(set.scoreA || 0);
                }
              }
            }
          } catch (e) {}
        } else {
          teamGoals = isTeamA ? (Number(m.scoreTeamA) || 0) : (Number(m.scoreTeamB) || 0);
          opponentGoals = isTeamA ? (Number(m.scoreTeamB) || 0) : (Number(m.scoreTeamA) || 0);
        }
        entry.goalsFor += teamGoals;
        entry.goalsAgainst += opponentGoals;
      }
    });

    const teamRankMap = new Map();
    teamStats.forEach((t: any, idx: number) => {
      // Create a unique key for the team to look it up easily
      const key = [t.player1Id, t.player2Id].sort().join('-');
      teamRankMap.set(key, idx + 1);
    });

    const partnerStats = Array.from(partnerMap.values()).map((p: any) => {
      const teamKey = [player.id, p.partner.id].sort().join('-');
      return {
        ...p,
        teamRank: teamRankMap.get(teamKey) || null,
        winRate: p.played > 0 ? ((p.wins / p.played) * 100).toFixed(1) : "0.0"
      };
    });

    let idealPartner = partnerStats.filter((p: any) => p.played >= 3);
    if (idealPartner.length > 0) {
      idealPartner.sort((a, b) => {
        const wrDiff = Number(b.winRate) - Number(a.winRate);
        if (wrDiff !== 0) return wrDiff;
        return b.played - a.played;
      });
    } else {
      idealPartner = partnerStats.sort((a, b) => {
        const wrDiff = Number(b.winRate) - Number(a.winRate);
        if (wrDiff !== 0) return wrDiff;
        return b.played - a.played;
      });
    }
    const bestPartner = idealPartner.length > 0 ? idealPartner[0] : null;

    recentMatches.sort((a: any, b: any) => new Date(b.playedAt || b.createdAt).getTime() - new Date(a.playedAt || a.createdAt).getTime());
    const allMatchesFormatted = recentMatches.map((m: any) => {
      const isTeamA = m.teamA?.player1Id === player.id || m.teamA?.player2Id === player.id;
      
      // Determina il ruolo usando la logica ufficiale
      const effective = getEffectiveMatchRole(m, player.id);
      let myRole = 'Jolly';
      if (effective === 'portiere') myRole = 'Difensore';
      if (effective === 'attaccante') myRole = 'Attaccante';

      return {
        id: m.id,
        playedAt: m.playedAt,
        won: m.winnerTeamId === (isTeamA ? m.teamAId : m.teamBId),
        myTeam: isTeamA ? m.teamA : m.teamB,
        oppTeam: isTeamA ? m.teamB : m.teamA,
        myScore: isTeamA ? m.scoreTeamA : m.scoreTeamB,
        oppScore: isTeamA ? m.scoreTeamB : m.scoreTeamA,
        setScores: m.setScores,
        tournamentId: m.tournamentId, // For knowing if it's a tournament or free match
        role: myRole,
        isTeamA
      };
    });
    
    const last5Matches = allMatchesFormatted.slice(0, 5);



    return {
      player,
      rank,
      played: basicStats.played,
      wins: basicStats.wins,
      winRate: basicStats.winRate,
      points: basicStats.points,
      totalGoalsScored,
      avgGoalsPerMatch,
      roleStats,
      bestPartner,
      allPartners: partnerStats.sort((a,b) => b.played !== a.played ? b.played - a.played : Number(b.winRate) - Number(a.winRate)),
      last5Matches,
      allMatches: allMatchesFormatted,
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
