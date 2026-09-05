import re

with open("src/app/actions/tournamentActions.ts", "r") as f:
    content = f.read()

old_query = """    let player = await prisma.player.findFirst({
      where: { name: { equals: req.playerName, mode: "insensitive" } }
    });"""

new_query = """    const allPlayers = await prisma.player.findMany();
    let player = allPlayers.find(p => p.name.toLowerCase() === req.playerName.trim().toLowerCase());"""

content = content.replace(old_query, new_query)

with open("src/app/actions/tournamentActions.ts", "w") as f:
    f.write(content)
