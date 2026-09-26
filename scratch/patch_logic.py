import re

with open('src/lib/tournamentLogic.ts', 'r') as f:
    content = f.read()

new_logic = """
export function drawTeamsRandomBalanced(players: any[], playerStatsMap: Map<string, any>): { player1: any; player2: any }[] {
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
  
  return teams;
}

export function drawTeamsBalanced(players: any[], playerStatsMap: Map<string, any>): { player1: any; player2: any }[] {
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

  return teams;
}
"""

content = content + new_logic

with open('src/lib/tournamentLogic.ts', 'w') as f:
    f.write(content)

print("Patched tournamentLogic!")
