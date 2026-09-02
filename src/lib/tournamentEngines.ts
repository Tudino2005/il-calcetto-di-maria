import { Team, Match } from "@prisma/client";

export function generateRoundRobinSchedule(teams: Team[]) {
  const isOdd = teams.length % 2 !== 0;
  const teamsToSchedule = isOdd ? [...teams, null] : [...teams];
  
  const numRounds = teamsToSchedule.length - 1;
  const half = teamsToSchedule.length / 2;
  const schedule = [];
  const currentPositions = [...teamsToSchedule];
  
  for (let r = 0; r < numRounds; r++) {
    const roundMatches = [];
    for (let i = 0; i < half; i++) {
      const home = currentPositions[i];
      const away = currentPositions[teamsToSchedule.length - 1 - i];
      if (home && away) {
        roundMatches.push({ teamAId: home.id, teamBId: away.id });
      }
    }
    schedule.push(roundMatches);
    const last = currentPositions.pop();
    if (last !== undefined) currentPositions.splice(1, 0, last);
  }
  
  return schedule;
}

export function computeGroupStandings(teams: Team[], groupMatches: Match[]) {
  const standings = teams.map(t => ({
    teamId: t.id, team: t, played: 0, won: 0, lost: 0, setsFor: 0, setsAgainst: 0, points: 0
  }));

  for (const m of groupMatches) {
    if (!m.winnerTeamId) continue;
    const teamA = standings.find(s => s.teamId === m.teamAId);
    const teamB = standings.find(s => s.teamId === m.teamBId);
    if (!teamA || !teamB) continue;

    teamA.played++; teamB.played++;
    teamA.setsFor += m.scoreTeamA; teamA.setsAgainst += m.scoreTeamB;
    teamB.setsFor += m.scoreTeamB; teamB.setsAgainst += m.scoreTeamA;

    if (m.winnerTeamId === teamA.teamId) {
      teamA.won++; teamB.lost++; teamA.points += 3;
    } else {
      teamB.won++; teamA.lost++; teamB.points += 3;
    }
  }

  standings.sort((a, b) => {
    if (a.points !== b.points) return b.points - a.points;
    const diffA = a.setsFor - a.setsAgainst;
    const diffB = b.setsFor - b.setsAgainst;
    if (diffA !== diffB) return diffB - diffA;
    if (a.setsFor !== b.setsFor) return b.setsFor - a.setsFor;
    const h2h = groupMatches.find(m => (m.teamAId === a.teamId && m.teamBId === b.teamId) || (m.teamAId === b.teamId && m.teamBId === a.teamId));
    if (h2h && h2h.winnerTeamId) return h2h.winnerTeamId === a.teamId ? -1 : 1;
    return 0;
  });

  return standings;
}

export function generateDoubleEliminationStructure(teams: Team[]) {
  const shuffledTeams = [...teams].sort(() => Math.random() - 0.5);
  const wbMatches = [];
  for (let i = 0; i < shuffledTeams.length; i += 2) {
    wbMatches.push({
      id: `wb-r0-m${i/2}`,
      teamAId: shuffledTeams[i].id,
      teamBId: shuffledTeams[i + 1]?.id || null,
      bracketType: "winners"
    });
  }
  return {
    wbRounds: [wbMatches],
    lbRounds: []
  };
}
