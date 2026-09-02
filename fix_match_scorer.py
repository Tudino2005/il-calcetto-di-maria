import re

with open("src/components/MatchScorer.tsx", "r") as f:
    content = f.read()

content = content.replace(
    'const backLink = match.tournamentId ? `/tournaments/${match.tournamentId}` : "/";',
    'const backLink = match.tournamentId ? `/tournaments/${match.tournamentId}` : "/admin";'
)
content = content.replace(
    'const backText = match.tournamentId ? "Torna al Tabellone" : "Torna alla Home";',
    'const backText = match.tournamentId ? "Torna al Tabellone" : "Torna al Pannello";'
)

with open("src/components/MatchScorer.tsx", "w") as f:
    f.write(content)
