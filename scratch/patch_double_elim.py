import re

with open('src/components/DoubleEliminationBracket.tsx', 'r') as f:
    content = f.read()

import_stmt = 'import TournamentAgenda from "./TournamentAgenda";'
if import_stmt in content:
    content = content.replace(import_stmt, import_stmt + '\nimport { getFeederMatchInfo } from "@/lib/tournamentLogic";')

old_teamA = '<span className="truncate text-sm">{m.teamA ? `${m.teamA.player1.name} & ${m.teamA.player2.name}` : "TBD"}</span>'
new_teamA = '<span className="truncate text-sm" title={!m.teamA ? getFeederMatchInfo(tournament, m.id, "A") : ""}>{m.teamA ? `${m.teamA.player1.name} & ${m.teamA.player2.name}` : getFeederMatchInfo(tournament, m.id, "A")}</span>'

if old_teamA in content:
    content = content.replace(old_teamA, new_teamA)

old_teamB = '<span className="truncate text-sm">{m.teamB ? `${m.teamB.player1.name} & ${m.teamB.player2.name}` : "TBD"}</span>'
new_teamB = '<span className="truncate text-sm" title={!m.teamB ? getFeederMatchInfo(tournament, m.id, "B") : ""}>{m.teamB ? `${m.teamB.player1.name} & ${m.teamB.player2.name}` : getFeederMatchInfo(tournament, m.id, "B")}</span>'

if old_teamB in content:
    content = content.replace(old_teamB, new_teamB)

with open('src/components/DoubleEliminationBracket.tsx', 'w') as f:
    f.write(content)

print("Patched DoubleEliminationBracket.tsx!")
