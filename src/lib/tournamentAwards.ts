import { prisma } from "./prisma";
import { calculatePlayerRoleStats } from "./roleUtils";

export async function finalizeTournamentAwards(tournamentId: string, winnerTeamId: string) {
  try {
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        matches: {
          include: {
            teamA: { include: { player1: true, player2: true } },
            teamB: { include: { player1: true, player2: true } },
            winnerTeam: { include: { player1: true, player2: true } }
          }
        },
        winnerTeam: { include: { player1: true, player2: true } }
      }
    });

    if (!tournament) return null;

    // 1. Gather all players who participated
    const playerMap = new Map<string, any>();
    
    // We only count matches that actually happened (winnerTeamId exists)
    const playedMatches = tournament.matches.filter(m => m.winnerTeamId !== null);
    const maxPossibleMatchesForPlayer = 3; // a rough baseline, actually we can find the max matches played by any single player
    let globalMaxMatches = 0;
    
    // Quick pass to find max matches played by anyone
    const matchesCountMap = new Map<string, number>();
    playedMatches.forEach(m => {
      [m.teamA?.player1.id, m.teamA?.player2.id, m.teamB?.player1.id, m.teamB?.player2.id].forEach(pid => {
        if (pid) matchesCountMap.set(pid, (matchesCountMap.get(pid) || 0) + 1);
      });
    });
    matchesCountMap.forEach(count => {
      if (count > globalMaxMatches) globalMaxMatches = count;
    });

    // 50% threshold
    const minMatchesThreshold = Math.max(2, Math.floor(globalMaxMatches * 0.5));

    matchesCountMap.forEach((_, playerId) => {
      // Find the player object
      let playerObj = null;
      for (const m of playedMatches) {
        if (m.teamA?.player1.id === playerId) playerObj = m.teamA.player1;
        if (m.teamA?.player2.id === playerId) playerObj = m.teamA.player2;
        if (m.teamB?.player1.id === playerId) playerObj = m.teamB.player1;
        if (m.teamB?.player2.id === playerId) playerObj = m.teamB.player2;
        if (playerObj) break;
      }
      
      if (playerObj) {
        const stats = calculatePlayerRoleStats(playerId, playedMatches);
        playerMap.set(playerId, { player: playerObj, stats });
      }
    });

    // 2. Select Guantoni d'Oro (Best GK)
    // Criteria: min matches as GK, lowest defensive index (goals conceded per match), tie breakers: win rate, then matches played
    let bestGKs: any[] = [];
    playerMap.forEach(({ player, stats }) => {
      if (stats.gkMatches >= minMatchesThreshold && stats.defensiveIndex !== null) {
        bestGKs.push({ player, stats });
      }
    });

    bestGKs.sort((a, b) => {
      const defA = parseFloat(a.stats.defensiveIndex);
      const defB = parseFloat(b.stats.defensiveIndex);
      if (defA !== defB) return defA - defB; // Lower is better
      
      const winA = parseFloat(a.stats.gkWinRate);
      const winB = parseFloat(b.stats.gkWinRate);
      if (winA !== winB) return winB - winA; // Higher win rate is better
      
      return b.stats.gkMatches - a.stats.gkMatches; // More matches is better
    });

    // Ex aequo handling for GK
    let goldenGloves = [];
    if (bestGKs.length > 0) {
      const topGK = bestGKs[0];
      goldenGloves = bestGKs.filter(gk => 
        gk.stats.defensiveIndex === topGK.stats.defensiveIndex && 
        gk.stats.gkWinRate === topGK.stats.gkWinRate
      );
    }

    // 3. Select Scarpa d'Oro (Best Striker)
    // Criteria: min matches as ST, highest offensive index (goals scored per match), tie breakers: win rate, then matches played
    let bestSTs: any[] = [];
    playerMap.forEach(({ player, stats }) => {
      if (stats.stMatches >= minMatchesThreshold && stats.offensiveIndex !== null) {
        bestSTs.push({ player, stats });
      }
    });

    bestSTs.sort((a, b) => {
      const offA = parseFloat(a.stats.offensiveIndex);
      const offB = parseFloat(b.stats.offensiveIndex);
      if (offA !== offB) return offB - offA; // Higher is better
      
      const winA = parseFloat(a.stats.stWinRate);
      const winB = parseFloat(b.stats.stWinRate);
      if (winA !== winB) return winB - winA; // Higher is better
      
      return b.stats.stMatches - a.stats.stMatches; // More matches is better
    });

    let goldenBoots = [];
    if (bestSTs.length > 0) {
      const topST = bestSTs[0];
      goldenBoots = bestSTs.filter(st => 
        st.stats.offensiveIndex === topST.stats.offensiveIndex && 
        st.stats.stWinRate === topST.stats.stWinRate
      );
    }

    // 4. Winning Team Stats
    let winningTeamStats = null;
    if (tournament.winnerTeam) {
      let teamMatchesPlayed = 0;
      let teamMatchesWon = 0;
      let teamSetsWon = 0;
      let teamSetsLost = 0;
      let teamGoalsScored = 0;
      let teamGoalsConceded = 0;

      playedMatches.forEach(m => {
        const isTeamA = m.teamAId === winnerTeamId;
        const isTeamB = m.teamBId === winnerTeamId;
        if (!isTeamA && !isTeamB) return;

        teamMatchesPlayed++;
        if (m.winnerTeamId === winnerTeamId) teamMatchesWon++;

        // Parse sets safely
        const sets = typeof m.setScores === 'string' ? JSON.parse(m.setScores) : m.setScores;
        if (Array.isArray(sets)) {
          sets.forEach((set: any) => {
            const scoreA = Number(set.scoreA) || 0;
            const scoreB = Number(set.scoreB) || 0;
            if (isTeamA) {
              teamGoalsScored += scoreA;
              teamGoalsConceded += scoreB;
              if (scoreA > scoreB) teamSetsWon++;
              else if (scoreB > scoreA) teamSetsLost++;
            } else {
              teamGoalsScored += scoreB;
              teamGoalsConceded += scoreA;
              if (scoreB > scoreA) teamSetsWon++;
              else if (scoreA > scoreB) teamSetsLost++;
            }
          });
        }
      });

      winningTeamStats = {
        matchesPlayed: teamMatchesPlayed,
        matchesWon: teamMatchesWon,
        winRate: teamMatchesPlayed > 0 ? ((teamMatchesWon / teamMatchesPlayed) * 100).toFixed(1) : "0.0",
        setsWon: teamSetsWon,
        setsLost: teamSetsLost,
        goalsScored: teamGoalsScored,
        goalsConceded: teamGoalsConceded
      };
    }

    // 5. Construct Awards JSON
    const awardsData = {
      winningTeam: {
        team: tournament.winnerTeam,
        stats: winningTeamStats
      },
      goldenGloves: goldenGloves.map(gk => ({
        player: gk.player,
        stats: {
          defensiveIndex: gk.stats.defensiveIndex,
          gkWinRate: gk.stats.gkWinRate,
          gkMatches: gk.stats.gkMatches,
          gkGoalsConceded: gk.stats.gkGoalsConceded
        }
      })),
      goldenBoots: goldenBoots.map(st => ({
        player: st.player,
        stats: {
          offensiveIndex: st.stats.offensiveIndex,
          stWinRate: st.stats.stWinRate,
          stMatches: st.stats.stMatches,
          stGoalsScored: st.stats.stGoalsScored
        }
      })),
      tournamentStats: {
        totalMatches: playedMatches.length,
        minMatchesThreshold
      }
    };

    // 6. Save to DB
    await prisma.tournament.update({
      where: { id: tournamentId },
      data: { awardsData: JSON.stringify(awardsData) }
    });

    console.log(`Tournament ${tournamentId} awards calculated and frozen successfully.`);
    return awardsData;

  } catch (err) {
    console.error("Error finalizing tournament awards:", err);
    return null;
  }
}
