import re

with open("src/components/TVSlideshow.tsx", "r") as f:
    content = f.read()

# Prossimi incontri
content = content.replace(
    '<span className="text-white truncate">{m.teamA?.player1?.name} & {m.teamA?.player2?.name}</span>',
    '<span className="text-white flex-1 leading-tight">{m.teamA?.player1?.name} <span className="text-slate-500 text-sm mx-1">&</span> {m.teamA?.player2?.name}</span>'
)
content = content.replace(
    '<span className="text-white truncate">{m.teamB?.player1?.name} & {m.teamB?.player2?.name}</span>',
    '<span className="text-white flex-1 text-right leading-tight">{m.teamB?.player1?.name} <span className="text-slate-500 text-sm mx-1">&</span> {m.teamB?.player2?.name}</span>'
)
content = content.replace(
    '<span className="text-slate-500 mx-4">VS</span>',
    '<span className="text-slate-500 mx-4 shrink-0">VS</span>'
)

# Ultimi Risultati
content = content.replace(
    'truncate ${m.winnerTeamId === m.teamAId',
    'flex-1 leading-tight ${m.winnerTeamId === m.teamAId'
)
content = content.replace(
    'truncate ${m.winnerTeamId === m.teamBId',
    'flex-1 text-right leading-tight ${m.winnerTeamId === m.teamBId'
)
content = content.replace(
    '<div className="bg-slate-950 px-4 py-1 rounded-xl text-xl font-black text-white shadow-inner mx-4">',
    '<div className="shrink-0 bg-slate-950 px-4 py-1 rounded-xl text-xl font-black text-white shadow-inner mx-4">'
)


with open("src/components/TVSlideshow.tsx", "w") as f:
    f.write(content)
