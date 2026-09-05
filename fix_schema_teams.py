import re

with open("prisma/schema.prisma", "r") as f:
    content = f.read()

# Add maxTeams to Tournament
old_tour = """  status         String // 'setup', 'ready_to_draw', 'in_progress', 'completed'
  startDate      DateTime?
  pricePerPlayer Float?
  prizes         String?
  registrations  TournamentRegistration[]"""

new_tour = """  status         String // 'setup', 'ready_to_draw', 'in_progress', 'completed'
  startDate      DateTime?
  maxTeams       Int                      @default(8)
  pricePerPlayer Float?
  prizes         String?
  registrations  TournamentRegistration[]"""

content = content.replace(old_tour, new_tour)

with open("prisma/schema.prisma", "w") as f:
    f.write(content)
