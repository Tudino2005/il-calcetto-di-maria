new_content = """"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath, redirect } from "next/cache";
import { drawTeams, drawTeamsRandom, generateBracket } from "@/lib/tournamentLogic";
import { generateRoundRobinSchedule, generateDoubleEliminationStructure, computeGroupStandings } from "@/lib/tournamentEngines";

// New createTournament that only creates the Lobby
export async function createTournament(formData: FormData) {
  const name = formData.get("name") as string;
  const format = formData.get("format") as string;
  const type = formData.get("type") as string;
  
  // Create tournament in setup mode
  const tournament = await prisma.tournament.create({
    data: { name, type, format, status: "setup" }
  });

  revalidatePath("/tournaments");
  redirect(`/tournaments/${tournament.id}`);
}

export async function addPlayerToTournament(tournamentId: string, playerId: string) {
  await prisma.tournament.update({
    where: { id: tournamentId },
    data: {
      registeredPlayers: {
        connect: { id: playerId }
      }
    }
  });
  revalidatePath(`/tournaments/${tournamentId}`);
}

export async function removePlayerFromTournament(tournamentId: string, playerId: string) {
  await prisma.tournament.update({
    where: { id: tournamentId },
    data: {
      registeredPlayers: {
        disconnect: { id: playerId }
      }
    }
  });
  revalidatePath(`/tournaments/${tournamentId}`);
}

export async function startTournament(tournamentId: string, config?: { teamsPerGroup?: number }) {
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: { registeredPlayers: true }
  });
  if (!tournament || tournament.status !== "setup") return;

  const type = tournament.type;
  const format = tournament.format;
  const players = tournament.registeredPlayers;
  let createdTeams: any[] = [];

  if (type === "coppie_fisse") {
    // For fixed pairs, we assume players were added in pairs logically, but actually they are just a pool of players.
    // Wait, if it's fixed pairs, they need to select which two players form a team.
    // In our simplified lobby, if they use coppie fisse, they add players and we randomly pair them?
    // The prompt requested a simple logic for now, we'll draw them randomly if they chose coppie fisse but used the lobby to add players.
    // Ideally we should have a UI for pairing, but to unblock we use drawTeamsRandom.
    const teamsToInsert = drawTeamsRandom(players);
    createdTeams = await Promise.all(
      teamsToInsert.map(async (t) => {
        const ids = [t.player1.id, t.player2.id].sort();
        const uniqueTeamKey = `${ids[0]}_${ids[1]}`;
        let team = await prisma.team.findUnique({ where: { uniqueTeamKey }, include: { player1: true, player2: true } });
        if (!team) {
          team = await prisma.team.create({
            data: { player1Id: t.player1.id, player2Id: t.player2.id, uniqueTeamKey },
            include: { player1: true, player2: true }
          });
        }
        return team;
      })
    );
  } else {
    const teamsToInsert = type === "sorteggio_integrale" ? drawTeamsRandom(players) : drawTeams(players);
    createdTeams = await Promise.all(
      teamsToInsert.map(async (t) => {
        const ids = [t.player1.id, t.player2.id].sort();
        const uniqueTeamKey = `${ids[0]}_${ids[1]}`;
        let team = await prisma.team.findUnique({ where: { uniqueTeamKey }, include: { player1: true, player2: true } });
        if (!team) {
          team = await prisma.team.create({
            data: { player1Id: t.player1.id, player2Id: t.player2.id, uniqueTeamKey },
            include: { player1: true, player2: true }
          });
        }
        return team;
      })
    );
  }

  if (format === "gironi_eliminazione") {
    const teamsPerGroup = config?.teamsPerGroup || 4;
    const shuffled = [...createdTeams].sort(() => Math.random() - 0.5);
    const numGroups = Math.ceil(shuffled.length / teamsPerGroup);
    
    for (let i = 0; i < numGroups; i++) {
      const groupName = `Gruppo ${String.fromCharCode(65 + i)}`;
      const groupTeams = shuffled.slice(i * teamsPerGroup, (i + 1) * teamsPerGroup);
      
      const dbGroup = await prisma.tournamentGroup.create({
        data: { tournamentId: tournament.id, name: groupName }
      });

      for (const t of groupTeams) {
        await prisma.groupStanding.create({
          data: { groupId: dbGroup.id, teamId: t.id }
        });
      }

      const schedule = generateRoundRobinSchedule(groupTeams);
      for (const round of schedule) {
        for (const match of round) {
          await prisma.match.create({
            data: {
              tournamentId: tournament.id,
              groupId: dbGroup.id,
              teamAId: match.teamAId,
              teamBId: match.teamBId,
              bracketType: "group_stage"
            }
          });
        }
      }
    }
  } else if (format === "doppia_eliminazione") {
    const initialMatchesData = generateDoubleEliminationStructure(createdTeams);
    const createdMatchIds: string[] = [];
    for (const m of initialMatchesData.wbRounds[0]) {
      if (m.teamAId && m.teamBId) {
        const dbMatch = await prisma.match.create({
          data: { teamAId: m.teamAId, teamBId: m.teamBId, tournamentId: tournament.id, bracketType: "winners" }
        });
        createdMatchIds.push(dbMatch.id);
      }
    }
    await prisma.tournament.update({
      where: { id: tournament.id },
      data: { 
        status: "in_progress",
        bracketData: JSON.stringify({ wbRounds: [createdMatchIds], lbRounds: [] }) 
      }
    });
    return;
  } else {
    const initialMatchesData = generateBracket(createdTeams);
    const createdMatchIds: string[] = [];
    for (const m of initialMatchesData) {
      if (m.teamAId && m.teamBId) {
        const dbMatch = await prisma.match.create({
          data: { teamAId: m.teamAId, teamBId: m.teamBId, tournamentId: tournament.id, bracketType: "winners" }
        });
        createdMatchIds.push(dbMatch.id);
      }
    }
    await prisma.tournament.update({
      where: { id: tournament.id },
      data: { 
        status: "in_progress",
        bracketData: JSON.stringify({ rounds: [createdMatchIds] }) 
      }
    });
    return;
  }

  await prisma.tournament.update({
    where: { id: tournament.id },
    data: { status: "in_progress" }
  });
  
  revalidatePath(`/tournaments/${tournamentId}`);
}

export async function getTournaments() {
  return await prisma.tournament.findMany({
    orderBy: { createdAt: "desc" },
    include: { winnerTeam: { include: { player1: true, player2: true } } },
  });
}

export async function getTournament(id: string) {
  return await prisma.tournament.findUnique({
    where: { id },
    include: {
      registeredPlayers: true,
      matches: {
        include: {
          teamA: { include: { player1: true, player2: true } },
          teamB: { include: { player1: true, player2: true } },
          winnerTeam: true,
        },
        orderBy: { playedAt: "asc" }
      },
      groups: {
        include: {
          standings: {
            include: { team: { include: { player1: true, player2: true } } }
          },
          matches: true
        }
      }
    }
  });
}

export async function generatePlayoffSeeding(tournamentId: string, qualifiersPerGroup: number) {
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: {
      groups: { include: { matches: true, standings: { include: { team: true } } } },
      matches: true
    }
  });

  if (!tournament || tournament.format !== "gironi_eliminazione") return null;

  const qualifiedTeams = [];
  for (const g of tournament.groups) {
    const teams = g.standings.map(s => s.team as any);
    const standings = computeGroupStandings(teams, g.matches);
    const topN = standings.slice(0, qualifiersPerGroup).map(s => s.team);
    qualifiedTeams.push(...topN);
  }

  const initialMatchesData = generateBracket(qualifiedTeams);
  const createdMatchIds: string[] = [];
  
  for (const m of initialMatchesData) {
    if (m.teamAId && m.teamBId) {
      const dbMatch = await prisma.match.create({
        data: {
          teamAId: m.teamAId,
          teamBId: m.teamBId,
          tournamentId: tournament.id,
          bracketType: "playoff"
        }
      });
      createdMatchIds.push(dbMatch.id);
    }
  }

  await prisma.tournament.update({
    where: { id: tournament.id },
    data: { bracketData: JSON.stringify({ rounds: [createdMatchIds] }) }
  });

  revalidatePath("/tournaments");
  return tournament;
}
"""

with open("src/app/actions/tournamentActions.ts", "w") as f:
    f.write(new_content)
