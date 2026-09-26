import re

with open('src/app/actions/tournamentActions.ts', 'r') as f:
    content = f.read()

old_func = """export async function addPlayerToTournament(tournamentId: string, playerId: string) {
  await prisma.tournamentRegistration.create({
    data: {
      tournamentId,
      playerId
    }
  });
  revalidatePath(`/tournaments/${tournamentId}`);
}"""

new_func = """export async function addPlayerToTournament(tournamentId: string, playerId: string) {
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
}"""

if old_func in content:
    content = content.replace(old_func, new_func)
    print("Patched addPlayerToTournament!")
else:
    print("Could not find old_func!")

with open('src/app/actions/tournamentActions.ts', 'w') as f:
    f.write(content)
