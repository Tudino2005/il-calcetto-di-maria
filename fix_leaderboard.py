import re

with open("src/lib/leaderboardData.ts", "r") as f:
    content = f.read()

# Replace matchFilter
content = content.replace(
    'const matchFilter = { where: { tournamentId: null } };',
    'const matchFilter = { where: { winnerTeamId: { not: null } } };'
)

with open("src/lib/leaderboardData.ts", "w") as f:
    f.write(content)
