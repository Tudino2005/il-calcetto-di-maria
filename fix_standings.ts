import { PrismaClient } from "@prisma/client";
import { computeGroupStandings } from "./src/lib/tournamentEngines";

const prisma = new PrismaClient();

async function main() {
  const tournaments = await prisma.tournament.findMany({
    where: { format: "gironi_eliminazione" },
    include: {
      groups: {
        include: {
          standings: true,
          matches: { include: { teamA: true, teamB: true } }
        }
      }
    }
  });

  console.log(`Trovati ${tournaments.length} tornei a gironi.`);

  for (const t of tournaments) {
    for (const g of t.groups) {
      if (g.standings.length === 0 && g.matches.length > 0) {
        console.log(`Gruppo ${g.name} nel torneo ${t.name} non ha standings! Ricostruisco...`);
        const teamMap = new Map();
        for (const m of g.matches) {
          if (m.teamA && !teamMap.has(m.teamAId)) teamMap.set(m.teamAId, m.teamA);
          if (m.teamB && !teamMap.has(m.teamBId)) teamMap.set(m.teamBId, m.teamB);
        }
        
        const teams = Array.from(teamMap.values());
        const computed = computeGroupStandings(teams, g.matches);

        for (const s of computed) {
          await prisma.groupStanding.create({
            data: {
              groupId: g.id,
              teamId: s.teamId,
              played: s.played,
              won: s.won,
              lost: s.lost,
              setsFor: s.setsFor,
              setsAgainst: s.setsAgainst,
              points: s.points
            }
          });
        }
        console.log(`Finito di ricostruire gruppo ${g.name}.`);
      } else if (g.standings.length > 0) {
        // Even if they exist, recalculate points just in case!
        console.log(`Gruppo ${g.name} ha standings, ricalcolo per sicurezza...`);
        const teams = g.matches.map(m => m.teamA).concat(g.matches.map(m => m.teamB)).filter(Boolean);
        const uniqueTeams = Array.from(new Map(teams.map(t => [t.id, t])).values());
        const computed = computeGroupStandings(uniqueTeams, g.matches);
        for (const s of computed) {
          await prisma.groupStanding.updateMany({
            where: { groupId: g.id, teamId: s.teamId },
            data: {
              played: s.played,
              won: s.won,
              lost: s.lost,
              setsFor: s.setsFor,
              setsAgainst: s.setsAgainst,
              points: s.points
            }
          });
        }
      }
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
