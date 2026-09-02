import re

with open("src/components/MatchScorer.tsx", "r") as f:
    content = f.read()

pattern = r'  const teamAWon = match\.winnerTeamId === match\.teamA\.id;\n  const teamBWon = match\.winnerTeamId === match\.teamB\.id;'
replacement = """  const teamAWon = match.teamA ? match.winnerTeamId === match.teamA.id : false;
  const teamBWon = match.teamB ? match.winnerTeamId === match.teamB.id : false;"""

content = re.sub(pattern, replacement, content)

with open("src/components/MatchScorer.tsx", "w") as f:
    f.write(content)
