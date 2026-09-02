import re

with open("src/app/actions/matchActions.ts", "r") as f:
    content = f.read()

# Replace the deletePlayer action with a robust one
pattern = r'export async function deletePlayer\(playerId: string\) \{[\s\S]*?\}'

replacement = """export async function deletePlayer(playerId: string) {
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
}"""

content = re.sub(pattern, replacement, content)

with open("src/app/actions/matchActions.ts", "w") as f:
    f.write(content)
