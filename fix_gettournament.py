import re

with open("src/app/actions/tournamentActions.ts", "r") as f:
    content = f.read()

# Add winnerTeam to include
content = content.replace(
    '          winnerTeam: true,\n        },\n        orderBy: { playedAt: "asc" }\n      },\n      groups: {',
    '          winnerTeam: { include: { player1: true, player2: true } },\n        },\n        orderBy: { playedAt: "asc" }\n      },\n      winnerTeam: { include: { player1: true, player2: true } },\n      groups: {'
)

with open("src/app/actions/tournamentActions.ts", "w") as f:
    f.write(content)
