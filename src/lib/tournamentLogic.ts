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
