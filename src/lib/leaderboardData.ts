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
