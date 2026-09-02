import re

with open("src/app/actions/tournamentActions.ts", "r") as f:
    content = f.read()

# Let's just append the new action at the end of the file.
new_action = """
export async function createQuickTournament(formData: FormData) {
  const name = formData.get("name") as string;
  const format = formData.get("format") as string;
  const type = formData.get("type") as string;
  const playerIdsStr = formData.get("playerIds") as string;
  
  const playerIds = playerIdsStr ? playerIdsStr.split(",") : [];

  // 1. Create Tournament (ready to draw immediately)
  const tournament = await prisma.tournament.create({
    data: {
      name,
      type,
      format,
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

  // 3. Generate Bracket & Start
  await startTournament(tournament.id);

  // 4. Go to Ceremony/Bracket
  redirect(`/tournaments/${tournament.id}?draw=true`);
}
"""
content += new_action

with open("src/app/actions/tournamentActions.ts", "w") as f:
    f.write(content)
