import re

with open("prisma/schema.prisma", "r") as f:
    content = f.read()

# Fix Player
content = re.sub(
    r'  teamsAsPlayer2\s+Team\[\]\s+@relation\("Player2"\)',
    '  teamsAsPlayer2          Team[]       @relation("Player2")\n  registrations           TournamentRegistration[]',
    content
)
# If there are any stray Tournament fields on Player, remove them.
content = re.sub(r'\s*Tournament\s+Tournament\?\s+@relation\(fields: \[tournamentId\], references: \[id\]\)\n\s*tournamentId\s+String\?\n', '\n', content)

# Fix Tournament
content = re.sub(r'\s*registeredPlayers\s+Player\[\]\s+@relation\("TournamentRegisteredPlayers"\)', '', content)
content = content.replace(
    '  winnerTeamId      String?',
    '  registrations     TournamentRegistration[]\n  winnerTeamId      String?'
)

with open("prisma/schema.prisma", "w") as f:
    f.write(content)
