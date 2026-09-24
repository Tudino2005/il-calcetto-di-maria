import { Player } from "@prisma/client";

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function drawTeamsRandom(players: Player[]): { player1: Player; player2: Player }[] {
  const shuffled = shuffleArray(players);
  const teams: { player1: Player; player2: Player }[] = [];
  
  for (let i = 0; i < shuffled.length; i += 2) {
    if (shuffled[i + 1]) {
      teams.push({
        player1: shuffled[i],
        player2: shuffled[i + 1],
      });
    }
  }
  
  return teams;
}

export function drawTeams(players: Player[]): { player1: Player; player2: Player }[] {
  const attackers = players.filter((p) => p.preferredRole === "attaccante");
  const goalkeepers = players.filter((p) => p.preferredRole === "portiere");
  const both = players.filter((p) => p.preferredRole === "entrambi");

  let poolA = [...attackers];
  let poolG = [...goalkeepers];
  let poolB = [...both];

  const targetHalf = players.length / 2;

  // Fill from 'entrambi'
  while (poolA.length < targetHalf && poolB.length > 0) {
    poolA.push(poolB.pop()!);
  }
  while (poolG.length < targetHalf && poolB.length > 0) {
    poolG.push(poolB.pop()!);
  }
  
  // If still imbalanced, force off-role to ensure NO players are dropped
  while (poolA.length < targetHalf && poolG.length > targetHalf) {
    poolA.push(poolG.pop()!);
  }
  while (poolG.length < targetHalf && poolA.length > targetHalf) {
    poolG.push(poolA.pop()!);
  }

  poolA = shuffleArray(poolA);
  poolG = shuffleArray(poolG);

  const teams: { player1: Player; player2: Player }[] = [];
  const teamCount = Math.min(poolA.length, poolG.length);

  for (let i = 0; i < teamCount; i++) {
    teams.push({
      player1: poolA[i],
      player2: poolG[i],
    });
  }

  return teams;
}

export function generateBracket(teams: { id: string }[]) {
  // teams length should be 4, 8, 16
  const shuffledTeams = shuffleArray(teams);
  const matches = [];
  for (let i = 0; i < shuffledTeams.length; i += 2) {
    matches.push({
      id: `match-${i / 2}`,
      teamAId: shuffledTeams[i].id,
      teamBId: shuffledTeams[i + 1]?.id || null, // in case of odd number, bye
      winnerId: null,
    });
  }
  return matches;
}

export function getFeederMatchInfo(tournament: any, currentMatchId: string, slot: "A" | "B"): string {
  if (!tournament || !tournament.bracketData) return "IN ATTESA";
  
  try {
    const bData = JSON.parse(tournament.bracketData);
    
    // Single Elim
    if (bData.rounds) {
      for (let r = 1; r < bData.rounds.length; r++) {
        const idx = bData.rounds[r].indexOf(currentMatchId);
        if (idx !== -1) {
          const feederIdx = idx * 2 + (slot === "A" ? 0 : 1);
          const feederId = bData.rounds[r - 1][feederIdx];
          if (feederId) {
            const fm = tournament.matches?.find((m: any) => m.id === feederId);
            if (fm && fm.teamA && fm.teamB) {
              const nameA = fm.teamA.player1.name + " & " + fm.teamA.player2.name;
              const nameB = fm.teamB.player1.name + " & " + fm.teamB.player2.name;
              return `VINCENTE: ${nameA} VS ${nameB}`;
            }
          }
        }
      }
    }
    
    // Double Elim (Simplification for WB)
    if (bData.wbRounds) {
      for (let r = 1; r < bData.wbRounds.length; r++) {
        const idx = bData.wbRounds[r].indexOf(currentMatchId);
        if (idx !== -1) {
          const feederIdx = idx * 2 + (slot === "A" ? 0 : 1);
          const feederId = bData.wbRounds[r - 1][feederIdx];
          if (feederId) {
            const fm = tournament.matches?.find((m: any) => m.id === feederId);
            if (fm && fm.teamA && fm.teamB) {
              const nameA = fm.teamA.player1.name + " & " + fm.teamA.player2.name;
              const nameB = fm.teamB.player1.name + " & " + fm.teamB.player2.name;
              return `VINCENTE: ${nameA} VS ${nameB}`;
            }
          }
        }
      }
      

      // Double Elim LB
      if (bData.lbRounds) {
        for (let r = 0; r < bData.lbRounds.length; r++) {
          const idx = bData.lbRounds[r].indexOf(currentMatchId);
          if (idx !== -1) {
            let feederId: string | undefined;
            let isLoser = false;

            if (r % 2 === 1) {
              // ODD LB Round (e.g. 1, 3)
              if (slot === "A") {
                feederId = bData.lbRounds[r - 1][idx];
              } else {
                // Comes from WB drop
                const wbRound = (r + 1) / 2;
                const matchesInTargetLbRound = bData.lbRounds[r].length;
                const wbMatchIndex = (matchesInTargetLbRound - 1) - idx;
                if (bData.wbRounds[wbRound]) {
                  feederId = bData.wbRounds[wbRound][wbMatchIndex];
                  isLoser = true;
                }
              }
            } else {
              // EVEN LB Round (e.g. 0, 2)
              if (r === 0) {
                // Comes from WB Round 0
                const wbMatchIndex = idx * 2 + (slot === "A" ? 0 : 1);
                feederId = bData.wbRounds[0][wbMatchIndex];
                isLoser = true;
              } else {
                // Comes from previous LB Round
                const feederIdx = idx * 2 + (slot === "A" ? 0 : 1);
                feederId = bData.lbRounds[r - 1][feederIdx];
              }
            }

            if (feederId) {
              const fm = tournament.matches?.find((m: any) => m.id === feederId);
              if (fm && fm.teamA && fm.teamB) {
                const nameA = fm.teamA.player1.name + " & " + fm.teamA.player2.name;
                const nameB = fm.teamB.player1.name + " & " + fm.teamB.player2.name;
                return `${isLoser ? 'PERDENTE' : 'VINCENTE'}: ${nameA} VS ${nameB}`;
              }
            }
          }
        }
      }
      // For GF
      if (bData.gfMatches && bData.gfMatches.includes(currentMatchId)) {
         return slot === "A" ? "VINCENTE WB" : "VINCENTE LB";
      }
    }
  } catch(e) {}
  
  return "IN ATTESA";
}
