"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { drawTeams, drawTeamsRandom, drawTeamsBalanced, drawTeamsRandomBalanced, generateBracket } from "@/lib/tournamentLogic";
import { getLeaderboardData } from "@/lib/leaderboardData";
import { generateRoundRobinSchedule, generateDoubleEliminationStructure, computeGroupStandings } from "@/lib/tournamentEngines";

// New createTournament that only creates the Lobby
export async function createTournament(formData: FormData) {
  const name = formData.get("name") as string;
  const format = formData.get("format") as string;
  const maxTeams = Number(formData.get("maxTeams") || 8);
  const type = formData.get("type") as string;
  const startDateStr = formData.get("startDate") as string;
  const endDateStr = formData.get("endDate") as string;
  const pricePerPlayerStr = formData.get("pricePerPlayer") as string;
  const prizes = formData.get("prizes") as string;
  const allowRoleSwapsStr = formData.get("allowRoleSwaps") as string;
  const allowRoleSwaps = allowRoleSwapsStr === "true";
  const isBalancedDraw = formData.get("isBalancedDraw") === "true";
  const targetGoals = Number(formData.get("targetGoals") || 7);
  const advantageThreshold = Number(formData.get("advantageThreshold") || 5);

  const drawDateStr = formData.get("drawDate") as string;
  const drawDate = drawDateStr ? new Date(drawDateStr) : null;
  const startDate = startDateStr ? new Date(startDateStr) : null;
  const endDate = endDateStr ? new Date(endDateStr) : null;
  const pricePerPlayer = pricePerPlayerStr ? parseFloat(pricePerPlayerStr) : null;
  
  // Create tournament in setup mode
  const tournament = await prisma.tournament.create({
    data: { 
      name, 
      type, 
      format, 
      allowRoleSwaps,
      isBalancedDraw,
      targetGoals,
      advantageThreshold,
      status: "setup",
      startDate,
      endDate,
      drawDate,
      maxTeams,
      pricePerPlayer,
      prizes: prizes || null
    }
  });

  revalidatePath("/tournaments");
  redirect(`/tournaments/${tournament.id}`);
}

export async function addPlayerToTournament(tournamentId: string, playerId: string) {
  try {
    const existing = await prisma.tournamentRegistration.findUnique({
      where: {
        tournamentId_playerId: { tournamentId, playerId }
      }
    });

    if (!existing) {
      await prisma.tournamentRegistration.create({
        data: {
          tournamentId,
          playerId
        }
      });
    }
  } catch (error) {
    console.error("Error adding player to tournament:", error);
  }
  revalidatePath(`/tournaments/${tournamentId}`);
}

export async function togglePlayerPayment(tournamentId: string, playerId: string, hasPaid: boolean) {
  await prisma.tournamentRegistration.update({
    where: {
      tournamentId_playerId: { tournamentId, playerId }
    },
    data: { hasPaid }
  });
  revalidatePath(`/tournaments/${tournamentId}`);
}

export async function closeRegistrations(tournamentId: string) {
  await prisma.tournament.update({
    where: { id: tournamentId },
    data: { status: "ready_to_draw" }
  });
  revalidatePath(`/tournaments/${tournamentId}`);
}

export async function removePlayerFromTournament(tournamentId: string, playerId: string) {
  await prisma.tournamentRegistration.delete({
    where: {
      tournamentId_playerId: { tournamentId, playerId }
    }
  });
  revalidatePath(`/tournaments/${tournamentId}`);
}

const COCKTAIL_AND_BEER_NAMES = [
  // Cocktail Classici & Pestati
  "I Negroni Sbagliati",
  "I Mojito Pestati",
  "I Gin Tonic",
  "Gli Spritz Aperol",
  "Gli Spritz Campari",
  "I Campari Soda",
  "I Cuba Libre",
  "I Moscow Mule",
  "I Long Island",
  "I Margarita col Sale",
  "I Daiquiri Ghiacciati",
  "I Caipirinha Tropicali",
  "I Bloody Mary",
  "I Black Russian",
  "I White Russian",
  "Gli Old Fashioned",
  "I Manhattan Decisi",
  "I Piña Colada",
  "I Sex on the Beach",
  "I Tequila Sunrise",
  "I Bellini Frizzanti",
  "Gli Hugo Freschi",
  "I Gin Lemon",
  "I Vodka RedBull",
  "I B-52 Incendiari",

  // Birre & Mastri Birrai
  "Le Bionde Doppio Malto",
  "Le IPA Luppolate",
  "Le Weizen Torbide",
  "Le Stout Cariche",
  "Le Pilsner Ghiacciate",
  "Le Blanche Speziate",
  "Le Bock Rosse",
  "I Mastri Birrai",
  "Le Trappiste d'Abbazia",
  "I Boccali Spumeggianti",
  "Le Bionde Senza Filtro",
  "I Fusti a Caduta",
  "Le Rosse d'Irlanda",
  "Le Lager alla Spina",

  // Amari, Liquori & Shot
  "Gli Amari del Capo",
  "I Grappini Corretti",
  "I Sambuca con la Mosca",
  "I Montenegro & Ghiaccio",
  "Gli Jägermeister Ghiacciati",
  "I Rum & Pera",
  "I Limoncelli Fatti in Casa",
  "I Tequila & Sale",
  "I Chupito Assassini",
  "I Whiskey Torbati",
  "Gli Assenzio Maledetti",
  "I Cynar da Bar",
  "I Braulio Alpini",
  "I Fernet della Notte",
  "I Mirto di Sardegna",
  "I Sambuca Flambé",
  "Gli Amari Lucani"
];

const IRONIC_NAMES = COCKTAIL_AND_BEER_NAMES;

function generateTeamNames(teams: any[]) {
  const shuffledNames = [...IRONIC_NAMES].sort(() => Math.random() - 0.5);
  const map: Record<string, string> = {};
  teams.forEach((t, i) => {
    map[t.id] = shuffledNames[i % shuffledNames.length];
  });
  return map;
}

export async function startTournament(tournamentId: string, config?: { teamsPerGroup?: number, fixedPairs?: string[][] }) {
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: { registrations: { include: { player: true } } }
  });
  if (!tournament || tournament.status !== "ready_to_draw") return;

  const type = tournament.type;
  const format = tournament.format;
  const players = tournament.registrations.map((r: any) => r.player);
  let createdTeams: any[] = [];

  if (type === "coppie_fisse") {
    let teamsToInsert: any[] = [];
    if (config?.fixedPairs && config.fixedPairs.length > 0) {
      teamsToInsert = config.fixedPairs.map(pair => {
        return {
          player1: players.find((p: any) => p.id === pair[0]),
          player2: players.find((p: any) => p.id === pair[1])
        };
      });
    } else {
      if (tournament.isBalancedDraw) {
        const { playerStats } = await getLeaderboardData();
        const statMap = new Map(playerStats.map(p => [p.id, p]));
        teamsToInsert = drawTeamsRandomBalanced(players, statMap);
      } else {
        teamsToInsert = drawTeamsRandom(players);
      }
    }
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
    let teamsToInsert: any[] = [];
    if (tournament.isBalancedDraw) {
      const { playerStats } = await getLeaderboardData();
      const statMap = new Map(playerStats.map(p => [p.id, p]));
      teamsToInsert = type === "sorteggio_integrale" ? drawTeamsRandomBalanced(players, statMap) : drawTeamsBalanced(players, statMap);
    } else {
      teamsToInsert = type === "sorteggio_integrale" ? drawTeamsRandom(players) : drawTeams(players);
    }
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

  const teamNamesMap = generateTeamNames(createdTeams);

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

    // Gironi: go directly to drawing for team reveal ceremony, 
    // then in_progress (no per-match draw ceremony needed)
    await prisma.tournament.update({
      where: { id: tournament.id },
      data: { status: "drawing", teamNames: teamNamesMap }
    });
    redirect(`/tournaments/${tournamentId}?draw=true`);
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
        status: "drawing",
        bracketData: JSON.stringify({ wbRounds: [createdMatchIds], lbRounds: [] }),
        teamNames: teamNamesMap
      }
    });
    redirect(`/tournaments/${tournamentId}?draw=true`);
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
        status: "drawing",
        bracketData: JSON.stringify({ rounds: [createdMatchIds] }),
        teamNames: teamNamesMap
      }
    });
    redirect(`/tournaments/${tournamentId}?draw=true`);
  }
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
      registrations: { include: { player: true } },
      registrationRequests: { orderBy: { createdAt: "asc" } },
      matches: {
        include: {
          teamA: { include: { player1: true, player2: true } },
          teamB: { include: { player1: true, player2: true } },
          winnerTeam: { include: { player1: true, player2: true } },
        },
        orderBy: { playedAt: "asc" }
      },
      winnerTeam: { include: { player1: true, player2: true } },
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
  revalidatePath(`/tournaments/${tournamentId}`);
  return tournament;
}

export async function createQuickTournament(formData: FormData) {
  const name = formData.get("name") as string;
  const format = formData.get("format") as string;
  const maxTeams = Number(formData.get("maxTeams") || 8);
  const type = formData.get("type") as string;
  const playerIdsStr = formData.get("playerIds") as string;
  
  const playerIds = playerIdsStr ? playerIdsStr.split(",") : [];

  // 1. Create Tournament (ready to draw immediately)
  const tournament = await prisma.tournament.create({
    data: {
      name,
      type,
      format,
      maxTeams,
      status: "ready_to_draw",
      pricePerPlayer: null,
      prizes: null,
      startDate: new Date()
    }
  });

  // 2. Create Registrations
  if (playerIds.length > 0) {
    await prisma.tournamentRegistration.createMany({
      data: playerIds.map(id => ({
        tournamentId: tournament.id,
        playerId: id,
        hasPaid: true // implicitly true for quick tournaments
      }))
    });
  }

  const fixedPairsStr = formData.get("fixedPairs") as string;
  let fixedPairs = undefined;
  if (fixedPairsStr) {
    try { fixedPairs = JSON.parse(fixedPairsStr); } catch(e) {}
  }

  // 3. Generate Bracket & Start
  await startTournament(tournament.id, { fixedPairs });

  // 4. Go to Ceremony/Bracket
  redirect(`/tournaments/${tournament.id}?draw=true`);
}


export async function wipeTournamentData(pin: string) {
  if (pin !== "MARIA2026") {
    throw new Error("PIN errato!");
  }
  
  // Wipe in correct order due to foreign keys
  await prisma.match.deleteMany({});
  await prisma.groupStanding.deleteMany({});
  await prisma.tournamentGroup.deleteMany({});
  await prisma.tournamentRegistration.deleteMany({});
  await prisma.tournament.deleteMany({});
  
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/tournaments");
}


export async function wipeAllData(pin: string) {
  if (pin !== "MARIA2026") {
    throw new Error("PIN errato!");
  }
  
  // Wipe in correct order due to foreign keys
  await prisma.match.deleteMany({});
  await prisma.groupStanding.deleteMany({});
  await prisma.tournamentGroup.deleteMany({});
  await prisma.tournamentRegistration.deleteMany({});
  await prisma.tournament.deleteMany({});
  await prisma.team.deleteMany({});
  await prisma.player.deleteMany({});
  
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/tournaments");
  revalidatePath("/players");
  revalidatePath("/match");
}

export async function createRegistrationRequest(tournamentId: string, playerName: string, preferredRole: string) {
  const req = await prisma.registrationRequest.create({
    data: {
      tournamentId,
      playerName,
      preferredRole,
    }
  });
  return req;
}

export async function getRegistrationRequest(id: string) {
  return await prisma.registrationRequest.findUnique({
    where: { id }
  });
}

export async function respondToRegistrationRequest(requestId: string, status: string, adminReply: string | null = null) {
  // status: 'accepted' or 'rejected'
  const req = await prisma.registrationRequest.update({
    where: { id: requestId },
    data: { status, adminReply }
  });
  
  // If accepted, auto-create player and enroll
  if (status === "accepted") {
    // find or create player
    const allPlayers = await prisma.player.findMany();
    let player = allPlayers.find(p => p.name.toLowerCase() === req.playerName.trim().toLowerCase());
    if (!player) {
      player = await prisma.player.create({
        data: { name: req.playerName, preferredRole: req.preferredRole }
      });
    }
    
    // Add to tournament if not already
    const existingReg = await prisma.tournamentRegistration.findUnique({
      where: { tournamentId_playerId: { tournamentId: req.tournamentId, playerId: player.id } }
    });
    if (!existingReg) {
      await prisma.tournamentRegistration.create({
        data: { tournamentId: req.tournamentId, playerId: player.id }
      });
    }
  }
  
  revalidatePath("/admin");
  revalidatePath(`/tournaments/${req.tournamentId}`);
  return req;
}

export async function finishDrawAnimation(tournamentId: string) {
  try {
    const tournament = await prisma.tournament.findUnique({ where: { id: tournamentId }, select: { format: true } });
    // For group stage tournaments, skip the per-match draw ceremony and go directly to in_progress
    const nextStatus = tournament?.format === "gironi_eliminazione" ? "in_progress" : "matches_drawing";
    await prisma.tournament.update({
      where: { id: tournamentId },
      data: { status: nextStatus }
    });
    revalidatePath("/");
    revalidatePath("/tournaments");
    revalidatePath(`/tournaments/${tournamentId}`);
  } catch (error) {
    console.warn("finishDrawAnimation: Impossibile aggiornare il torneo (forse è stato eliminato nel frattempo?)", error);
  }
}

export async function finishMatchesDrawAnimation(tournamentId: string) {
  try {
    await prisma.tournament.update({
      where: { id: tournamentId },
      data: { status: "in_progress" }
    });
    revalidatePath("/");
    revalidatePath("/tournaments");
    revalidatePath(`/tournaments/${tournamentId}`);
  } catch (error) {
    console.warn("finishMatchesDrawAnimation: Impossibile aggiornare il torneo", error);
  }
}

export async function recalculateTournamentAwards(tournamentId: string) {
  "use server";
  const { finalizeTournamentAwards } = await import("@/lib/tournamentAwards");
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId }
  });
  if (!tournament || tournament.status !== "completed" || !tournament.winnerTeamId) {
    return { error: "Torneo non completato o senza vincitore" };
  }
  const result = await finalizeTournamentAwards(tournamentId, tournament.winnerTeamId);
  revalidatePath("/hall-of-fame");
  revalidatePath(`/tournaments/${tournamentId}`);
  return { ok: true, result };
}

export async function deleteTournament(tournamentId: string) {
  try {
    // Delete related matches first to avoid foreign key errors
    await prisma.match.deleteMany({
      where: { tournamentId }
    });
    
    // Delete groups and standings
    await prisma.tournamentGroup.deleteMany({
      where: { tournamentId }
    });

    // Delete requests
    await prisma.registrationRequest.deleteMany({
      where: { tournamentId }
    });

    // Finally delete the tournament (registrations are cascaded)\
    await prisma.tournament.delete({
      where: { id: tournamentId }
    });
    
    revalidatePath('/tournaments');
    revalidatePath('/admin');
  } catch (error) {
    console.error("Error deleting tournament:", error);
  }
}

// ─── Scheduling Actions ────────────────────────────────────────────────────────

import {
  scheduleTournamentMatches,
  formatScheduleReport,
  ScheduleConfig,
  SchedulableMatch,
} from "@/lib/tournamentScheduler";

/**
 * Saves the scheduling configuration to the tournament record.
 */
export async function saveSchedulingConfig(
  tournamentId: string,
  config: {
    numTables: number;
    scheduleStartTime: string;
    scheduleDays: number[];
    maxMatchesPerDay: number;
    scheduleStartDate: string;
  }
) {
  await prisma.tournament.update({
    where: { id: tournamentId },
    data: {
      numTables: config.numTables,
      scheduleStartTime: config.scheduleStartTime,
      scheduleDays: config.scheduleDays,
      maxMatchesPerDay: config.maxMatchesPerDay,
      startDate: config.scheduleStartDate ? new Date(config.scheduleStartDate) : undefined,
    },
  });
  revalidatePath(`/tournaments/${tournamentId}`);
  return { ok: true };
}

/**
 * Core scheduling action: computes and writes scheduledAt to every match.
 */
export async function generateSchedule(tournamentId: string): Promise<{
  ok: boolean;
  report?: string;
  error?: string;
}> {
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: {
      matches: { orderBy: { playedAt: "asc" } },
      groups: { include: { matches: { orderBy: { playedAt: "asc" } } } },
    },
  });

  if (!tournament) return { ok: false, error: "Torneo non trovato." };
  if (!tournament.startDate) return { ok: false, error: "Inserisci una data di inizio torneo." };
  if (!tournament.scheduleStartTime) return { ok: false, error: "Inserisci un orario di inizio partite." };
  if (!tournament.scheduleDays || (tournament.scheduleDays as number[]).length === 0)
    return { ok: false, error: "Seleziona almeno un giorno della settimana." };
  if (!tournament.numTables || tournament.numTables < 1)
    return { ok: false, error: "Inserisci il numero di biliardini disponibili." };
  if (!tournament.maxMatchesPerDay || tournament.maxMatchesPerDay < 1)
    return { ok: false, error: "Inserisci il numero massimo di partite al giorno." };

  const config: ScheduleConfig = {
    startDate: tournament.startDate,
    scheduleStartTime: tournament.scheduleStartTime,
    scheduleDays: tournament.scheduleDays as number[],
    numTables: tournament.numTables,
    maxMatchesPerDay: tournament.maxMatchesPerDay,
    matchDurationMinutes: 30,
  };

  const schedulableMatches: SchedulableMatch[] = [];

  if (tournament.format === "gironi_eliminazione" && tournament.groups.length > 0) {
    const groupMatchQueues = tournament.groups.map((g) => [...g.matches]);
    const maxRoundsPerGroup = Math.max(...groupMatchQueues.map((q) => q.length));

    for (let roundIdx = 0; roundIdx < maxRoundsPerGroup; roundIdx++) {
      for (const queue of groupMatchQueues) {
        const m = queue[roundIdx];
        if (!m) continue;
        schedulableMatches.push({ id: m.id, teamAId: m.teamAId, teamBId: m.teamBId, round: roundIdx });
      }
    }

    const playoffMatches = tournament.matches.filter((m) => m.bracketType === "playoff");
    const baseRound = maxRoundsPerGroup + 1;
    let playoffRound = baseRound;
    let playoffsInCurrentRound = 0;
    const playoffsPerRound = Math.max(1, Math.floor(playoffMatches.length / 2));

    for (const m of playoffMatches) {
      schedulableMatches.push({ id: m.id, teamAId: m.teamAId, teamBId: m.teamBId, round: playoffRound });
      playoffsInCurrentRound++;
      if (playoffsInCurrentRound >= playoffsPerRound) { playoffRound++; playoffsInCurrentRound = 0; }
    }
  } else {
    const allMatches = [...tournament.matches];
    let roundIdx = 0;
    let remaining = [...allMatches];
    let chunkSize = Math.ceil(remaining.length / 2) || 1;
    while (remaining.length > 0) {
      const chunk = remaining.splice(0, Math.max(1, chunkSize));
      for (const m of chunk) {
        schedulableMatches.push({ id: m.id, teamAId: m.teamAId, teamBId: m.teamBId, round: roundIdx });
      }
      roundIdx++;
      chunkSize = Math.max(1, Math.floor(chunkSize / 2));
    }
  }

  const schedulable = schedulableMatches.filter((m) => m.teamAId && m.teamBId);
  if (schedulable.length === 0)
    return { ok: false, error: "Nessuna partita con squadre definite. Genera prima il tabellone o i gironi." };

  let summary;
  try {
    summary = scheduleTournamentMatches(schedulable, config);
  } catch (err: any) {
    return { ok: false, error: err.message };
  }

  for (const result of summary.results) {
    await prisma.match.update({ where: { id: result.matchId }, data: { scheduledAt: result.scheduledAt } });
  }

  await prisma.tournament.update({
    where: { id: tournamentId },
    data: { endDate: summary.estimatedEndDate },
  });

  revalidatePath(`/tournaments/${tournamentId}`);
  const report = formatScheduleReport(summary);
  return { ok: true, report };
}
