import re

with open("prisma/schema.prisma", "r") as f:
    content = f.read()

# Add registrationRequests to Tournament
old_tour = """  winnerTeam Team?             @relation("TournamentWinner", fields: [winnerTeamId], references: [id])
  matches    Match[]
  groups     TournamentGroup[]
}"""

new_tour = """  winnerTeam Team?             @relation("TournamentWinner", fields: [winnerTeamId], references: [id])
  matches    Match[]
  groups     TournamentGroup[]
  registrationRequests RegistrationRequest[]
}"""

content = content.replace(old_tour, new_tour)

with open("prisma/schema.prisma", "w") as f:
    f.write(content)
