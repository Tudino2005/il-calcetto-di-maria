import { prisma } from "./prisma";

export async function getLeaderboardData() {
  // Include all completed matches (Free matches + Tournament matches)
  const matchFilter = { where: { winnerTeamId: { not: null } } };

  const players = await prisma.player.findMany({
    include: {
      teamsAsPlayer1: { 
        include: { 
          matchesAsWinner: matchFilter, 
          matchesAsTeamA: matchFilter, 
          matchesAsTeamB: matchFilter 
        } 
      },
      teamsAsPlayer2: { 
        include: { 
          matchesAsWinner: matchFilter, 
          matchesAsTeamA: matchFilter, 
          matchesAsTeamB: matchFilter 
        } 
      },
    }
  });

  const teams = await prisma.team.findMany({
    include: {
      player1: true,
      player2: true,
      matchesAsWinner: matchFilter,
      matchesAsTeamA: matchFilter,
      matchesAsTeamB: matchFilter,
    }
  });

  const playerStats = players.map(p => {
    let wins = 0;
    let played = 0;
    
    const allTeams = [...p.teamsAsPlayer1, ...p.teamsAsPlayer2];
    allTeams.forEach(t => {
      wins += t.matchesAsWinner.length;
      played += t.matchesAsTeamA.length + t.matchesAsTeamB.length;
    });

    const winRate = played > 0 ? ((wins / played) * 100).toFixed(1) : 0;

    return {
      ...p,
      wins,
      played,
      winRate: Number(winRate)
    };
  }).filter(p => p.played > 0).sort((a, b) => { if (b.wins !== a.wins) return b.wins - a.wins; return b.winRate - a.winRate; });

  const teamStats = teams.map(t => {
    const wins = t.matchesAsWinner.length;
    const played = t.matchesAsTeamA.length + t.matchesAsTeamB.length;
    const winRate = played > 0 ? ((wins / played) * 100).toFixed(1) : 0;

    return {
      ...t,
      wins,
      played,
      winRate: Number(winRate)
    };
  }).filter(t => t.played > 0).sort((a, b) => { if (b.wins !== a.wins) return b.wins - a.wins; return b.winRate - a.winRate; });

  return { playerStats, teamStats };
}

export async function getFreeMatchesLeaderboard() {
  const allPlayers = await prisma.player.findMany();
  const freeMatches = await prisma.match.findMany({
    where: { tournamentId: null, winnerTeamId: { not: null } },
    include: { teamA: true, teamB: true },
    orderBy: { playedAt: 'desc' }
  });

  const playerStatsMap = new Map();

  allPlayers.forEach(p => {
    playerStatsMap.set(p.id, {
      id: p.id,
      name: p.name,
      role: p.preferredRole,
      sg: 0,
      v: 0,
      p: 0,
      sv: 0,
      sp: 0,
      recentForm: [] as ('W' | 'L')[]
    });
  });

  // Since matches are ordered by playedAt desc, processing them updates total stats 
  // and we can simply push to recentForm up to 5 items.
  for (const m of freeMatches) {
    const teamAWon = m.winnerTeamId === m.teamAId;
    
    // Parse sets
    let setsA = 0;
    let setsB = 0;
    if (m.setScores) {
      const sets = typeof m.setScores === 'string' ? JSON.parse(m.setScores) : m.setScores;
      if (Array.isArray(sets)) {
        sets.forEach((set: any) => {
          const scoreA = Number(set.scoreA) || 0;
          const scoreB = Number(set.scoreB) || 0;
          if (scoreA > scoreB) setsA++;
          else if (scoreB > scoreA) setsB++;
        });
      }
    }

    const processPlayer = (playerId: string | null | undefined, isTeamA: boolean) => {
      if (!playerId) return;
      const stats = playerStatsMap.get(playerId);
      if (!stats) return;

      stats.sg++;
      
      const wonMatch = (isTeamA && teamAWon) || (!isTeamA && !teamAWon);
      if (wonMatch) stats.v++;
      else stats.p++;

      if (isTeamA) {
        stats.sv += setsA;
        stats.sp += setsB;
      } else {
        stats.sv += setsB;
        stats.sp += setsA;
      }

      if (stats.recentForm.length < 5) {
        stats.recentForm.push(wonMatch ? 'W' : 'L');
      }
    };

    processPlayer(m.teamA?.player1Id, true);
    processPlayer(m.teamA?.player2Id, true);
    processPlayer(m.teamB?.player1Id, false);
    processPlayer(m.teamB?.player2Id, false);
  }

  const results = Array.from(playerStatsMap.values())
    .map(stats => {
      // Calculate derived stats
      const ds = stats.sv - stats.sp;
      const wr = stats.sg > 0 ? (stats.v / stats.sg) * 100 : 0;

      // Wilson Score Confidence Interval (lower bound, 95% confidence)
      // This is the formula used by IMDb for its Top 250.
      // It answers: "In the worst plausible case, how good is this player?"
      // Players with few games get heavily penalized, rewarding consistency over time.
      // z = 1.96 for 95% confidence interval
      const z = 1.96;
      const n = stats.sg;
      const p = n > 0 ? stats.v / n : 0;
      const wilsonScore = n > 0
        ? (p + (z * z) / (2 * n) - z * Math.sqrt((p * (1 - p) + (z * z) / (4 * n)) / n)) / (1 + (z * z) / n)
        : 0;

      return { ...stats, ds, wr, wilsonScore };
    })
    // Only include players with at least 1 match played
    .filter(stats => stats.sg > 0)
    // Sort by Wilson Score desc (statistically fair), then WR% as tiebreaker, then DS
    .sort((a, b) => {
      if (b.wilsonScore !== a.wilsonScore) return b.wilsonScore - a.wilsonScore;
      if (b.wr !== a.wr) return b.wr - a.wr;
      return b.ds - a.ds;
    });

  return results;
}
