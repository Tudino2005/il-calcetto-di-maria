import re

with open('src/components/TVSlideshow.tsx', 'r') as f:
    content = f.read()

# Add import
import_stmt = 'import { calculateTournamentProbabilities, calculateMatchProbabilities } from "@/lib/probabilityUtils";'
if import_stmt in content:
    content = content.replace(import_stmt, import_stmt + '\nimport { getFeederMatchInfo } from "@/lib/tournamentLogic";')

# Replace TBD for teamA
old_teamA = '<span>{m.teamAId ? `${m.teamA?.player1?.name} & ${m.teamA?.player2?.name}` : "TBD"}</span>'
new_teamA = '<span>{m.teamAId ? `${m.teamA?.player1?.name} & ${m.teamA?.player2?.name}` : getFeederMatchInfo(currentSlide.tournament, m.id, "A")}</span>'

if old_teamA in content:
    content = content.replace(old_teamA, new_teamA)
else:
    print("Could not find old_teamA")

# Replace TBD for teamB
old_teamB = '<span>{m.teamBId ? `${m.teamB?.player1?.name} & ${m.teamB?.player2?.name}` : "TBD"}</span>'
new_teamB = '<span>{m.teamBId ? `${m.teamB?.player1?.name} & ${m.teamB?.player2?.name}` : getFeederMatchInfo(currentSlide.tournament, m.id, "B")}</span>'

if old_teamB in content:
    content = content.replace(old_teamB, new_teamB)
else:
    print("Could not find old_teamB")

with open('src/components/TVSlideshow.tsx', 'w') as f:
    f.write(content)

print("Patched TVSlideshow.tsx!")
