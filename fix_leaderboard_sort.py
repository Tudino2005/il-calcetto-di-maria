import re

with open("src/lib/leaderboardData.ts", "r") as f:
    content = f.read()

# Replace sorting for players
content = content.replace(
    '.sort((a, b) => b.wins - a.wins);',
    '.sort((a, b) => { if (b.wins !== a.wins) return b.wins - a.wins; return b.winRate - a.winRate; });'
)

with open("src/lib/leaderboardData.ts", "w") as f:
    f.write(content)
