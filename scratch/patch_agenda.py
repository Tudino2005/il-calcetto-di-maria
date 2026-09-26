import re

with open('src/components/TournamentAgenda.tsx', 'r') as f:
    content = f.read()

import_stmt = 'import { Calendar, Clock, Trophy, MapPin } from "lucide-react";'
if import_stmt in content:
    content = content.replace(import_stmt, import_stmt + '\nimport { getFeederMatchInfo } from "@/lib/tournamentLogic";')

# Replace TBD for teamA
old_teamA = '>{m.teamA ? `${m.teamA.player1.name} & ${m.teamA.player2.name}` : "TBD"}<'
new_teamA = '>{m.teamA ? `${m.teamA.player1.name} & ${m.teamA.player2.name}` : getFeederMatchInfo(tournament, m.id, "A")}<'

content = content.replace(old_teamA, new_teamA)

# Replace TBD for teamB
old_teamB = '>{m.teamB ? `${m.teamB.player1.name} & ${m.teamB.player2.name}` : "TBD"}<'
new_teamB = '>{m.teamB ? `${m.teamB.player1.name} & ${m.teamB.player2.name}` : getFeederMatchInfo(tournament, m.id, "B")}<'

content = content.replace(old_teamB, new_teamB)

with open('src/components/TournamentAgenda.tsx', 'w') as f:
    f.write(content)

print("Patched TournamentAgenda.tsx!")
