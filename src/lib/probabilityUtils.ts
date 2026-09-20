export function calculateTournamentProbabilities(tournament: any, advancedPlayerStats: any[]) {
  if (!tournament || !tournament.matches || !advancedPlayerStats) return new Map();

  const getPlayerRating = (playerId: string) => {
    const stats = advancedPlayerStats.find((s: any) => s.player.id === playerId);
    if (!stats) return 50;
    const played = stats.playedMatches || 0;
    const wins = stats.wonMatches || 0;
    return ((wins + 2.5) / (played + 5)) * 100;
  };

  const eliminatedTeamIds = new Set<string>();
  tournament.matches.forEach((m: any) => {
    if (m.winnerTeamId) {
      if (m.teamAId && m.teamAId !== m.winnerTeamId) eliminatedTeamIds.add(m.teamAId);
      if (m.teamBId && m.teamBId !== m.winnerTeamId) eliminatedTeamIds.add(m.teamBId);
    }
  });

  const extracted = new Map();
  tournament.matches.forEach((m: any) => {
     if (m.teamA) extracted.set(m.teamA.id, m.teamA);
     if (m.teamB) extracted.set(m.teamB.id, m.teamB);
  });
  const teams = Array.from(extracted.values());

  let totalTournamentRating = 0;
  const teamRatings = new Map();

  teams.forEach((team: any) => {
    if (eliminatedTeamIds.has(team.id)) {
      teamRatings.set(team.id, 0);
      return;
    }

    const p1Rating = getPlayerRating(team.player1.id);
    const p2Rating = getPlayerRating(team.player2.id);
    let baseRating = p1Rating + p2Rating;
    
    const p1Role = (team.player1.preferredRole || '').toLowerCase();
    const p2Role = (team.player2.preferredRole || '').toLowerCase();
    const isP1Def = p1Role === 'portiere' || p1Role === 'difensore';
    const isP1Str = p1Role === 'attaccante';
    const isP2Def = p2Role === 'portiere' || p2Role === 'difensore';
    const isP2Str = p2Role === 'attaccante';
    
    if ((isP1Def && isP2Str) || (isP1Str && isP2Def)) {
      baseRating *= 1.05;
    }

    const expRating = Math.pow(baseRating, 3);
    teamRatings.set(team.id, expRating);
    totalTournamentRating += expRating;
  });

  const probabilities = new Map();
  teams.forEach((team: any) => {
    if (eliminatedTeamIds.has(team.id)) {
      probabilities.set(team.id, 0);
    } else if (totalTournamentRating > 0) {
      const expRating = teamRatings.get(team.id);
      const prob = (expRating / totalTournamentRating) * 100;
      probabilities.set(team.id, prob);
    } else {
      probabilities.set(team.id, 0);
    }
  });

  return probabilities;
}

export function calculateMatchProbabilities(tournament: any, advancedPlayerStats: any[]) {
  if (!tournament || !tournament.matches || !advancedPlayerStats) return new Map();

  const getPlayerRating = (playerId: string) => {
    const stats = advancedPlayerStats.find((s: any) => s.player.id === playerId);
    if (!stats) return 50;
    const played = stats.playedMatches || 0;
    const wins = stats.wonMatches || 0;
    return ((wins + 2.5) / (played + 5)) * 100;
  };

  const getTeamRating = (team: any) => {
    if (!team || !team.player1 || !team.player2) return 0;
    const p1Rating = getPlayerRating(team.player1.id);
    const p2Rating = getPlayerRating(team.player2.id);
    let baseRating = p1Rating + p2Rating;
    
    const p1Role = (team.player1.preferredRole || '').toLowerCase();
    const p2Role = (team.player2.preferredRole || '').toLowerCase();
    const isP1Def = p1Role === 'portiere' || p1Role === 'difensore';
    const isP1Str = p1Role === 'attaccante';
    const isP2Def = p2Role === 'portiere' || p2Role === 'difensore';
    const isP2Str = p2Role === 'attaccante';
    
    if ((isP1Def && isP2Str) || (isP1Str && isP2Def)) {
      baseRating *= 1.05;
    }
    return baseRating;
  };

  const matchProbabilities = new Map();

  tournament.matches.forEach((m: any) => {
    if (m.teamA && m.teamB && !m.winnerTeamId) {
      const ratingA = getTeamRating(m.teamA);
      const ratingB = getTeamRating(m.teamB);
      
      const expA = Math.pow(ratingA, 2);
      const expB = Math.pow(ratingB, 2);
      const totalExp = expA + expB;
      
      if (totalExp > 0) {
        matchProbabilities.set(m.id, {
          teamAProb: (expA / totalExp) * 100,
          teamBProb: (expB / totalExp) * 100
        });
      }
    }
  });

  return matchProbabilities;
}
