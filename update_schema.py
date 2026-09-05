import re

with open("prisma/schema.prisma", "r") as f:
    content = f.read()

# Add drawDate to Tournament
old_tour = """  status         String // 'setup', 'ready_to_draw', 'in_progress', 'completed'
  startDate      DateTime?
  maxTeams       Int                      @default(8)"""

new_tour = """  status         String // 'setup', 'ready_to_draw', 'in_progress', 'completed'
  startDate      DateTime?
  drawDate       DateTime?
  maxTeams       Int                      @default(8)"""

content = content.replace(old_tour, new_tour)

with open("prisma/schema.prisma", "w") as f:
    f.write(content)
