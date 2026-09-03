import re

# Fix QuickTournamentForm.tsx
with open("src/components/QuickTournamentForm.tsx", "r") as f:
    content = f.read()

content = content.replace(
    'newPairs[openPairIndex].push(id);',
    'newPairs[openPairIndex] = [...newPairs[openPairIndex], id];'
)

with open("src/components/QuickTournamentForm.tsx", "w") as f:
    f.write(content)

# Fix TournamentLobby.tsx
with open("src/components/TournamentLobby.tsx", "r") as f:
    content2 = f.read()

content2 = content2.replace(
    'newPairs[openPairIndex].push(id);',
    'newPairs[openPairIndex] = [...newPairs[openPairIndex], id];'
)

with open("src/components/TournamentLobby.tsx", "w") as f:
    f.write(content2)
