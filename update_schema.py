import re

with open("prisma/schema.prisma", "r") as f:
    content = f.read()

content = content.replace(
    "status         String   // 'setup', 'in_progress', 'completed'",
    "status         String   // 'setup', 'in_progress', 'completed'\n  registeredPlayers Player[] @relation(\"TournamentRegisteredPlayers\")"
)

content = content.replace(
    "teamsAsPlayer2   Team[] @relation(\"TeamPlayer2\")",
    "teamsAsPlayer2   Team[] @relation(\"TeamPlayer2\")\n  tournamentsAsRegistered Tournament[] @relation(\"TournamentRegisteredPlayers\")"
)

with open("prisma/schema.prisma", "w") as f:
    f.write(content)
