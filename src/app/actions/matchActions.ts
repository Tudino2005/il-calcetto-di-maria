"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { advanceDoubleElimination } from "@/lib/doubleEliminationEngine";

export async function createPlayer(name: string, preferredRole: string) {
  const allPlayers = await prisma.player.findMany();
  const exists = allPlayers.some(p => p.name.toLowerCase() === name.trim().toLowerCase());
  if (exists) {
    return { error: "Un giocatore con questo nome esiste già!" };
  }
  const player = await prisma.player.create({ data: { name, preferredRole } });
  revalidatePath("/");
  return player;
}

export async function getPlayers() {
  return await prisma.player.findMany({ orderBy: { name: "asc" } });
}

export async function getTeams() {
  return await prisma.team.findMany({ include: { player1: true, player2: true } });
}

export async function createTeam(player1Id: string, player2Id: string) {
  const ids = [player1Id, player2Id].sort();
  const uniqueTeamKey = `${ids[0]}_${ids[1]}`;
  let team = await prisma.team.findUnique({ where: { uniqueTeamKey } });
  if (!team) {
    team = await prisma.team.create({ data: { player1Id, player2Id, uniqueTeamKey } });
  }
  return team;
}

export async function createMatch(teamAId: string, teamBId: string) {
  const match = await prisma.match.create({
    data: { teamAId, teamBId },
    include: {
      teamA: { include: { player1: true, player2: true } },
      teamB: { include: { player1: true, player2: true } },
    }
  });
  revalidatePath("/");
  return match;
}

export async function updateMatchScore(matchId: string, team: "A" | "B", action: "add" | "remove") {
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match || match.winnerTeamId) return null;

  let scoreA = match.scoreTeamA;
  let scoreB = match.scoreTeamB;

  if (team === "A") scoreA = action === "add" ? scoreA + 1 : Math.max(0, scoreA - 1);
  else scoreB = action === "add" ? scoreB + 1 : Math.max(0, scoreB - 1);

  let winnerTeamId = null;
  if (scoreA === 2) winnerTeamId = match.teamAId;
  if (scoreB === 2) winnerTeamId = match.teamBId;

  const updatedMatch = await prisma.match.update({
    where: { id: matchId },
    data: { scoreTeamA: scoreA, scoreTeamB: scoreB, winnerTeamId },
    include: {
      teamA: { include: { player1: true, player2: true } },
      teamB: { include: { player1: true, player2: true } },
    }
  });

  if (winnerTeamId && updatedMatch.tournamentId) {
    await advanceTournament(updatedMatch.tournamentId, updatedMatch.id, winnerTeamId, updatedMatch.bracketType);
  }

  revalidatePath("/");
  return updatedMatch;
}

export async function scheduleMatch(matchId: string, scheduledAt: Date) {
  const match = await prisma.match.update({
    where: { id: matchId },
    data: { scheduledAt },
  });
  revalidatePath("/");
  return match;
}

async function advanceTournament(tournamentId: string, matchId: string, winnerTeamId: string, bracketType: string) {
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: { matches: true, groups: { include: { matches: true } } }
  });
  if (!tournament) return;

  if (tournament.format === "gironi_eliminazione") {
    // We only update standings dynamically on read. For group stage progression:
    // Check if ALL group matches are finished
    const allFinished = tournament.matches.every(m => m.winnerTeamId !== null);
    if (allFinished && tournament.status !== "completed") {
      // Logic for converting group stage qualifiers into playoffs will be manually triggered
      // by the user via a button "Generate Playoff Seeding" in the UI.
      // So we don't automatically generate it here.
    }
  } else if (tournament.format === "doppia_eliminazione") {
    if (!tournament.bracketData) return;
    const bracket = JSON.parse(tournament.bracketData);
    await advanceDoubleElimination(tournament, matchId, winnerTeamId, bracket);
  } else {
    // Standard Single Elimination
    if (!tournament.bracketData) return;
    let bracket = JSON.parse(tournament.bracketData);
    if (Array.isArray(bracket) && !bracket[0]?.rounds) {
      const initialMatches = tournament.matches.sort((a, b) => a.playedAt.getTime() - b.playedAt.getTime());
      bracket = { rounds: [initialMatches.map(m => m.id)] };
    }
    const rounds = bracket.rounds as string[][];
    let currentRoundIndex = -1, matchIndexInRound = -1;
    
    for (let r = 0; r < rounds.length; r++) {
      const idx = rounds[r].indexOf(matchId);
      if (idx !== -1) { currentRoundIndex = r; matchIndexInRound = idx; break; }
    }

    if (currentRoundIndex !== -1) {
      const expectedMatches = rounds[0].length / Math.pow(2, currentRoundIndex);
      const isFinal = expectedMatches === 1;
      
      if (isFinal) {
        await prisma.tournament.update({
          where: { id: tournament.id },
          data: { status: "completed", winnerTeamId }
        });
      } else {
        const nextRoundIndex = currentRoundIndex + 1;
        const nextMatchIndex = Math.floor(matchIndexInRound / 2);
        if (!rounds[nextRoundIndex]) rounds[nextRoundIndex] = [];
        
        const siblingIndex = matchIndexInRound % 2 === 0 ? matchIndexInRound + 1 : matchIndexInRound - 1;
        const siblingMatchId = rounds[currentRoundIndex][siblingIndex];
        
        if (siblingMatchId) {
          const siblingMatch = tournament.matches.find(m => m.id === siblingMatchId);
          if (siblingMatch && siblingMatch.winnerTeamId) {
            if (!rounds[nextRoundIndex][nextMatchIndex]) {
              const newMatch = await prisma.match.create({
                data: {
                  teamAId: matchIndexInRound % 2 === 0 ? winnerTeamId : siblingMatch.winnerTeamId,
                  teamBId: matchIndexInRound % 2 === 0 ? siblingMatch.winnerTeamId : winnerTeamId,
                  tournamentId: tournament.id,
                  bracketType: "winners"
                }
              });
              rounds[nextRoundIndex][nextMatchIndex] = newMatch.id;
              await prisma.tournament.update({
                where: { id: tournament.id },
                data: { bracketData: JSON.stringify({ rounds }) }
              });
            }
          }
        }
      }
    }
  }
}

export async function deletePlayer(playerId: string) {
  // Find all teams this player is in
  const teams = await prisma.team.findMany({
    where: {
      OR: [
        { player1Id: playerId },
        { player2Id: playerId }
      ]
    }
  });

  const teamIds = teams.map(t => t.id);

  if (teamIds.length > 0) {
    // Delete all matches involving these teams
    await prisma.match.deleteMany({
      where: {
        OR: [
          { teamAId: { in: teamIds } },
          { teamBId: { in: teamIds } }
        ]
      }
    });

    // Delete group standings involving these teams
    await prisma.groupStanding.deleteMany({
      where: { teamId: { in: teamIds } }
    });

    // Delete the teams
    await prisma.team.deleteMany({
      where: { id: { in: teamIds } }
    });
  }

  // Delete registrations
  await prisma.tournamentRegistration.deleteMany({
    where: { playerId }
  });

  // Finally, delete the player
  await prisma.player.delete({
    where: { id: playerId }
  });
}


export async function startFreeMatch(pairs: string[][]) {
  if (pairs.length !== 2 || pairs[0].length !== 2 || pairs[1].length !== 2) {
    throw new Error("Devi formare esattamente 2 squadre da 2 giocatori.");
  }
  
  const teamA = await createTeam(pairs[0][0], pairs[0][1]);
  const teamB = await createTeam(pairs[1][0], pairs[1][1]);
  
  const match = await createMatch(teamA.id, teamB.id);
  
  return match.id;
}
