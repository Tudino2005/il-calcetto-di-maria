import re

with open("src/app/actions/tournamentActions.ts", "r") as f:
    content = f.read()

# Update addPlayerToTournament
content = content.replace(
"""export async function addPlayerToTournament(tournamentId: string, playerId: string) {
  await prisma.tournament.update({
    where: { id: tournamentId },
    data: {
      registeredPlayers: {
        connect: { id: playerId }
      }
    }
  });
  revalidatePath(`/tournaments/${tournamentId}`);
}""",
"""export async function addPlayerToTournament(tournamentId: string, playerId: string) {
  await prisma.tournamentRegistration.create({
    data: {
      tournamentId,
      playerId
    }
  });
  revalidatePath(`/tournaments/${tournamentId}`);
}"""
)

# Update removePlayerFromTournament
content = content.replace(
"""export async function removePlayerFromTournament(tournamentId: string, playerId: string) {
  await prisma.tournament.update({
    where: { id: tournamentId },
    data: {
      registeredPlayers: {
        disconnect: { id: playerId }
      }
    }
  });
  revalidatePath(`/tournaments/${tournamentId}`);
}""",
"""export async function removePlayerFromTournament(tournamentId: string, playerId: string) {
  await prisma.tournamentRegistration.delete({
    where: {
      tournamentId_playerId: { tournamentId, playerId }
    }
  });
  revalidatePath(`/tournaments/${tournamentId}`);
}"""
)

# Add togglePlayerPayment
content = content.replace(
"""export async function removePlayerFromTournament(tournamentId: string, playerId: string) {""",
"""export async function togglePlayerPayment(tournamentId: string, playerId: string, hasPaid: boolean) {
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

export async function removePlayerFromTournament(tournamentId: string, playerId: string) {"""
)

# Update getTournament include
content = content.replace(
    'registeredPlayers: true,',
    'registrations: { include: { player: true } },'
)

# Update startTournament
content = content.replace(
"""export async function startTournament(tournamentId: string, config?: { teamsPerGroup?: number }) {
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: { registeredPlayers: true }
  });
  if (!tournament || tournament.status !== "setup") return;

  const type = tournament.type;
  const format = tournament.format;
  const players = tournament.registeredPlayers;""",
"""export async function startTournament(tournamentId: string, config?: { teamsPerGroup?: number }) {
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: { registrations: { include: { player: true } } }
  });
  if (!tournament || tournament.status !== "ready_to_draw") return;

  const type = tournament.type;
  const format = tournament.format;
  const players = tournament.registrations.map((r: any) => r.player);"""
)

with open("src/app/actions/tournamentActions.ts", "w") as f:
    f.write(content)
