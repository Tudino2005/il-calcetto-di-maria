import re

with open("src/app/actions/matchActions.ts", "r") as f:
    content = f.read()

old_query = """  const existing = await prisma.player.findFirst({
    where: { name: { equals: name, mode: "insensitive" } }
  });
  if (existing) {"""

new_query = """  const allPlayers = await prisma.player.findMany();
  const exists = allPlayers.some(p => p.name.toLowerCase() === name.trim().toLowerCase());
  if (exists) {"""

content = content.replace(old_query, new_query)

with open("src/app/actions/matchActions.ts", "w") as f:
    f.write(content)
