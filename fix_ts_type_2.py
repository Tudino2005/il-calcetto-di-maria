import re

with open("src/components/TournamentBracket.tsx", "r") as f:
    content = f.read()

content = content.replace("  winnerTeam: TeamInfo | null;\n};", "  winnerTeam: TeamInfo | null;\n  teamNames?: any;\n};")

with open("src/components/TournamentBracket.tsx", "w") as f:
    f.write(content)
