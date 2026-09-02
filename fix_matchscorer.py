import re

with open("src/components/MatchScorer.tsx", "r") as f:
    content = f.read()

# Fix MatchInfo
content = content.replace(
    '  teamA: TeamInfo;\n  teamB: TeamInfo;',
    '  teamA: TeamInfo | null;\n  teamB: TeamInfo | null;'
)

with open("src/components/MatchScorer.tsx", "w") as f:
    f.write(content)
