import re

with open("src/app/actions/tournamentActions.ts", "r") as f:
    content = f.read()

# Fix createTournament
old_create = """  const tournament = await prisma.tournament.create({
    data: { 
      name, 
      type, 
      format, 
      status: "setup",
      startDate,
      pricePerPlayer,
      prizes: prizes || null
    }
  });"""

new_create = """  const tournament = await prisma.tournament.create({
    data: { 
      name, 
      type, 
      format, 
      status: "setup",
      startDate,
      drawDate,
      maxTeams,
      pricePerPlayer,
      prizes: prizes || null
    }
  });"""

content = content.replace(old_create, new_create)

# Fix createQuickTournament as well just in case
old_quick = """  const tournament = await prisma.tournament.create({
    data: {
      name,
      type,
      format,
      status: "ready_to_draw",
      pricePerPlayer: null,
      prizes: null,
      startDate: new Date()
    }
  });"""

new_quick = """  const tournament = await prisma.tournament.create({
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
  });"""

content = content.replace(old_quick, new_quick)

with open("src/app/actions/tournamentActions.ts", "w") as f:
    f.write(content)

