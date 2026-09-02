import re

with open("src/app/actions/matchActions.ts", "r") as f:
    content = f.read()

new_action = """
export async function deletePlayer(playerId: string) {
  // Can't delete if they are part of a team? 
  // Actually, wait, player is linked to teams, and teams are linked to matches.
  // Prisma will block it if we don't handle cascades, OR we just delete them.
  // Teams don't have onDelete cascade for players in schema.
  // Let's delete the player. If they have teams, we might need to delete those teams too?
  // Wait, let's just try to delete the player. 
  // If they have matches, maybe it's better to NOT delete them, or to delete their teams?
  
  // Safe deletion: delete all teams they belong to first, which cascades to matches, or maybe just delete the player and let Prisma cascade?
  // Let's look at schema.
  await prisma.player.delete({
    where: { id: playerId }
  });
}
"""

content += new_action

with open("src/app/actions/matchActions.ts", "w") as f:
    f.write(content)
