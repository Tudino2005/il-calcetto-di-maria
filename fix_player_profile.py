import re

with open("src/app/players/[id]/page.tsx", "r") as f:
    content = f.read()

# Replace tournamentId: null with winnerTeamId: { not: null }
content = content.replace('{ tournamentId: null }', '{ winnerTeamId: { not: null } }')

# Replace "Partite Libere" text
content = content.replace('"Partite Libere"', '"Partite Giocate"')
content = content.replace('Partite Libere', 'Partite Giocate')
# Replace "all free matches" comment
content = content.replace('Extract all free matches', 'Extract all completed matches')

with open("src/app/players/[id]/page.tsx", "w") as f:
    f.write(content)
