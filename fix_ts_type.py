import re

with open("src/components/TournamentBracket.tsx", "r") as f:
    content = f.read()

# Add teamNames?: any to TournamentInfo type
content = content.replace("  bracketData: string | null;", "  bracketData: string | null;\n  teamNames?: any;")

with open("src/components/TournamentBracket.tsx", "w") as f:
    f.write(content)
