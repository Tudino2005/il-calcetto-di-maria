import re

with open("src/app/page.tsx", "r") as f:
    content = f.read()

# Make inProgressTournaments also include 'drawing'
old_in = """  const inProgressTournaments = await prisma.tournament.findMany({
    where: { status: "in_progress" },
    orderBy: { createdAt: "desc" },"""

new_in = """  const inProgressTournaments = await prisma.tournament.findMany({
    where: { status: { in: ["in_progress", "drawing"] } },
    orderBy: { createdAt: "desc" },"""

content = content.replace(old_in, new_in)

with open("src/app/page.tsx", "w") as f:
    f.write(content)
