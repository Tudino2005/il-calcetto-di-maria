import re

with open("prisma/schema.prisma", "r") as f:
    content = f.read()

# 1. Remove implicit relations
content = re.sub(r'\s*tournamentsAsRegistered Tournament\[\] @relation\("TournamentRegisteredPlayers"\)\n', '\n', content)
content = re.sub(r'\s*registeredPlayers Player\[\] @relation\("TournamentRegisteredPlayers"\)\n', '\n', content)

# 2. Add explicit relation to Player and Tournament
content = content.replace(
    '  createdAt      DateTime @default(now())',
    '  createdAt      DateTime @default(now())\n\n  registrations  TournamentRegistration[]'
)
content = content.replace(
    '  winnerTeamId   String?',
    '  registrations     TournamentRegistration[]\n  winnerTeamId   String?'
)
content = content.replace(
    "  status            String // 'setup', 'in_progress', 'completed'",
    "  status            String // 'setup', 'ready_to_draw', 'in_progress', 'completed'"
)

# 3. Append the new model
content += """
model TournamentRegistration {
  id           String     @id @default(uuid())
  tournamentId String
  playerId     String
  hasPaid      Boolean    @default(false)
  createdAt    DateTime   @default(now())

  tournament   Tournament @relation(fields: [tournamentId], references: [id], onDelete: Cascade)
  player       Player     @relation(fields: [playerId], references: [id], onDelete: Cascade)

  @@unique([tournamentId, playerId])
}
"""

with open("prisma/schema.prisma", "w") as f:
    f.write(content)
