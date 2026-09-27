const fs = require('fs');
let code = fs.readFileSync('src/lib/leaderboardData.ts', 'utf8');

// Patch playerStats map function
code = code.replace(
\`  const playerStats = players.map(p => {
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
  }).filter(p => p.played > 0 && p.wins > 0).sort((a, b) => { if (b.wins !== a.wins) return b.wins - a.wins; return b.winRate - a.winRate; });\`,
\`  const playerStats = players.map(p => {
    let wins = 0;
    let played = 0;
    let points = 0;
    
    const allTeams = [...p.teamsAsPlayer1, ...p.teamsAsPlayer2];
    allTeams.forEach(t => {
      const allMatches = [...t.matchesAsTeamA, ...t.matchesAsTeamB];
      allMatches.forEach(m => {
        if (!m.winnerTeamId) return;
        played++;
        const won = (m.winnerTeamId === t.id);
        if (won) wins++;

        const myScore = (m.teamAId === t.id) ? m.scoreTeamA : m.scoreTeamB;
        const oppScore = (m.teamAId === t.id) ? m.scoreTeamB : m.scoreTeamA;

        if (won) {
          points += (oppScore === 0) ? 3 : 2;
        } else {
          points += (myScore > 0) ? 1 : 0;
        }
      });
    });

    const winRate = played > 0 ? ((wins / played) * 100).toFixed(1) : 0;

    return {
      ...p,
      wins,
      played,
      points,
      winRate: Number(winRate)
    };
  }).filter(p => p.played > 0).sort((a, b) => { 
    if (b.points !== a.points) return b.points - a.points; 
    if (b.wins !== a.wins) return b.wins - a.wins; 
    return b.winRate - a.winRate; 
  });\`
);

// Patch teamStats map function
code = code.replace(
\`  const teamStats = teams.map(t => {
    const wins = t.matchesAsWinner.length;
    const played = t.matchesAsTeamA.length + t.matchesAsTeamB.length;
    const winRate = played > 0 ? ((wins / played) * 100).toFixed(1) : 0;

    return {
      ...t,
      wins,
      played,
      winRate: Number(winRate)
    };
  }).filter(t => t.played > 0 && t.wins > 0).sort((a, b) => { if (b.wins !== a.wins) return b.wins - a.wins; return b.winRate - a.winRate; });\`,
\`  const teamStats = teams.map(t => {
    let wins = 0;
    let played = 0;
    let points = 0;

    const allMatches = [...t.matchesAsTeamA, ...t.matchesAsTeamB];
    allMatches.forEach(m => {
      if (!m.winnerTeamId) return;
      played++;
      const won = (m.winnerTeamId === t.id);
      if (won) wins++;

      const myScore = (m.teamAId === t.id) ? m.scoreTeamA : m.scoreTeamB;
      const oppScore = (m.teamAId === t.id) ? m.scoreTeamB : m.scoreTeamA;

      if (won) {
        points += (oppScore === 0) ? 3 : 2;
      } else {
        points += (myScore > 0) ? 1 : 0;
      }
    });

    const winRate = played > 0 ? ((wins / played) * 100).toFixed(1) : 0;

    return {
      ...t,
      wins,
      played,
      points,
      winRate: Number(winRate)
    };
  }).filter(t => t.played > 0).sort((a, b) => { 
    if (b.points !== a.points) return b.points - a.points; 
    if (b.wins !== a.wins) return b.wins - a.wins; 
    return b.winRate - a.winRate; 
  });\`
);

fs.writeFileSync('src/lib/leaderboardData.ts', code);
