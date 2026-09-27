
function calculateTeamCost(p1: any, p2: any, historicalPairCounts: Map<string, number> | undefined) {
  if (!historicalPairCounts) return 0;
  const ids = [p1.id, p2.id].sort();
  const key = `${ids[0]}_${ids[1]}`;
  const played = historicalPairCounts.get(key) || 0;
  // If they played > 0 times, add a small penalty. If > 2, add a huge penalty.
  if (played > 2) return 1000 + played;
  if (played > 0) return 10 * played;
  return 0;
}

function optimizeTeamsByCost(
  teams: { player1: any; player2: any }[],
  historicalPairCounts: Map<string, number> | undefined,
  enforceRoles: boolean
) {
  if (!historicalPairCounts) return teams;
  
  // Hill climbing: try swapping players between teams to reduce total cost
  let improved = true;
  let iterations = 0;
  while (improved && iterations < 1000) {
    improved = false;
    iterations++;
    
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        const t1 = teams[i];
        const t2 = teams[j];
        
        // Current cost
        const currentCost = calculateTeamCost(t1.player1, t1.player2, historicalPairCounts) + 
                            calculateTeamCost(t2.player1, t2.player2, historicalPairCounts);
                            
        // Option A: swap player2s
        const swapACost = calculateTeamCost(t1.player1, t2.player2, historicalPairCounts) + 
                          calculateTeamCost(t2.player1, t1.player2, historicalPairCounts);
                          
        // Option B: swap player1s
        const swapBCost = calculateTeamCost(t2.player1, t1.player2, historicalPairCounts) + 
                          calculateTeamCost(t1.player1, t2.player2, historicalPairCounts);

        if (enforceRoles) {
          // If roles are enforced, player1 is always Attaccante, player2 is always Portiere.
          // We can only swap player2s (Portieri) or player1s (Attaccanti).
          if (swapACost < currentCost) {
            const temp = t1.player2;
            t1.player2 = t2.player2;
            t2.player2 = temp;
            improved = true;
          }
        } else {
          // If no roles, we can swap anything. 
          // Option A (swap p2s):
          if (swapACost < currentCost) {
            const temp = t1.player2;
            t1.player2 = t2.player2;
            t2.player2 = temp;
            improved = true;
          } 
          // Option B (swap p1 from t1 with p2 from t2)
          else {
            const swapCrossCost = calculateTeamCost(t1.player1, t2.player1, historicalPairCounts) + 
                                  calculateTeamCost(t1.player2, t2.player2, historicalPairCounts);
            if (swapCrossCost < currentCost) {
               const temp = t1.player2;
               t1.player2 = t2.player1;
               t2.player1 = temp;
               improved = true;
            }
          }
        }
      }
    }
  }
  return teams;
}

import { Player } from "@prisma/client";

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function drawTeamsRandom(players: Player[], historicalPairCounts?: Map<string, number>): { player1: Player; player2: Player }[] {
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
  
  return optimizeTeamsByCost(teams, historicalPairCounts, false);
}

export function drawTeams(players: Player[], historicalPairCounts?: Map<string, number>): { player1: Player; player2: Player }[] {
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

  return optimizeTeamsByCost(teams, historicalPairCounts, true);
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

export function drawTeamsRandomBalanced(players: any[], playerStatsMap: Map<string, any>, historicalPairCounts?: Map<string, number>): { player1: any; player2: any }[] {
  // Sort players by winRate descending
  const sorted = [...players].sort((a, b) => {
    const aStats = playerStatsMap.get(a.id);
    const bStats = playerStatsMap.get(b.id);
    const aWR = aStats ? aStats.winRate : 0;
    const bWR = bStats ? bStats.winRate : 0;
    return bWR - aWR;
  });

  const teams: { player1: any; player2: any }[] = [];
  const mid = Math.floor(sorted.length / 2);
  
  for (let i = 0; i < mid; i++) {
    teams.push({
      player1: sorted[i],
      player2: sorted[sorted.length - 1 - i],
    });
  }
  
  return optimizeTeamsByCost(teams, historicalPairCounts, false);
}

export function drawTeamsBalanced(players: any[], playerStatsMap: Map<string, any>, historicalPairCounts?: Map<string, number>): { player1: any; player2: any }[] {
  const attackers = players.filter((p) => p.preferredRole === "attaccante");
  const goalkeepers = players.filter((p) => p.preferredRole === "portiere");
  const both = players.filter((p) => p.preferredRole === "entrambi");

  let poolA = [...attackers];
  let poolG = [...goalkeepers];
  let poolB = [...both];

  const targetHalf = players.length / 2;

  // Fill from 'entrambi' just like normal
  while (poolA.length < targetHalf && poolB.length > 0) {
    poolA.push(poolB.pop()!);
  }
  while (poolG.length < targetHalf && poolB.length > 0) {
    poolG.push(poolB.pop()!);
  }
  
  while (poolA.length < targetHalf && poolG.length > targetHalf) {
    poolA.push(poolG.pop()!);
  }
  while (poolG.length < targetHalf && poolA.length > targetHalf) {
    poolG.push(poolA.pop()!);
  }

  // Sort both pools by winRate
  const sortByWR = (a: any, b: any) => {
    const aWR = playerStatsMap.get(a.id)?.winRate || 0;
    const bWR = playerStatsMap.get(b.id)?.winRate || 0;
    return bWR - aWR; // descending (strongest first)
  };

  poolA.sort(sortByWR);
  poolG.sort(sortByWR); // Also strongest first

  const teams: { player1: any; player2: any }[] = [];
  
  // Pair strongest attacker with weakest goalkeeper (or vice versa)
  for (let i = 0; i < targetHalf; i++) {
    teams.push({
      player1: poolA[i],
      player2: poolG[poolG.length - 1 - i], // Weakest goalkeeper
    });
  }

  return optimizeTeamsByCost(teams, historicalPairCounts, true);
}
