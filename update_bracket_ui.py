import re

with open("src/components/TournamentBracket.tsx", "r") as f:
    content = f.read()

# For TournamentBracket (Active matches view)
old_teamA = """<span className="truncate">{m.teamA ? `${m.teamA.player1.name} & ${m.teamA.player2.name}` : "TBD"}</span>"""
new_teamA = """<span className="truncate flex flex-col">
  {m.teamA && tournament.teamNames && tournament.teamNames[m.teamA.id] && (
    <span className="text-xs text-purple-400 font-bold uppercase tracking-wider mb-0.5">"{tournament.teamNames[m.teamA.id]}"</span>
  )}
  <span>{m.teamA ? `${m.teamA.player1.name} & ${m.teamA.player2.name}` : "TBD"}</span>
</span>"""
content = content.replace(old_teamA, new_teamA)

old_teamB = """<span className="truncate">{m.teamB ? `${m.teamB.player1.name} & ${m.teamB.player2.name}` : "TBD"}</span>"""
new_teamB = """<span className="truncate flex flex-col">
  {m.teamB && tournament.teamNames && tournament.teamNames[m.teamB.id] && (
    <span className="text-xs text-purple-400 font-bold uppercase tracking-wider mb-0.5">"{tournament.teamNames[m.teamB.id]}"</span>
  )}
  <span>{m.teamB ? `${m.teamB.player1.name} & ${m.teamB.player2.name}` : "TBD"}</span>
</span>"""
content = content.replace(old_teamB, new_teamB)

with open("src/components/TournamentBracket.tsx", "w") as f:
    f.write(content)

with open("src/components/TVSlideshow.tsx", "r") as f:
    content2 = f.read()

# For TVSlideshow Bracket Grid
old_grid_a = """<span className="truncate text-lg">{m.teamAId ? `${m.teamA?.player1?.name} & ${m.teamA?.player2?.name}` : "TBD"}</span>"""
new_grid_a = """<span className="truncate text-lg flex flex-col">
  {m.teamAId && currentSlide.tournament.teamNames && currentSlide.tournament.teamNames[m.teamAId] && (
    <span className="text-xs text-purple-400 font-bold uppercase tracking-wider mb-1">"{currentSlide.tournament.teamNames[m.teamAId]}"</span>
  )}
  <span>{m.teamAId ? `${m.teamA?.player1?.name} & ${m.teamA?.player2?.name}` : "TBD"}</span>
</span>"""
content2 = content2.replace(old_grid_a, new_grid_a)

old_grid_b = """<span className="truncate text-lg">{m.teamBId ? `${m.teamB?.player1?.name} & ${m.teamB?.player2?.name}` : "TBD"}</span>"""
new_grid_b = """<span className="truncate text-lg flex flex-col">
  {m.teamBId && currentSlide.tournament.teamNames && currentSlide.tournament.teamNames[m.teamBId] && (
    <span className="text-xs text-purple-400 font-bold uppercase tracking-wider mb-1">"{currentSlide.tournament.teamNames[m.teamBId]}"</span>
  )}
  <span>{m.teamBId ? `${m.teamB?.player1?.name} & ${m.teamB?.player2?.name}` : "TBD"}</span>
</span>"""
content2 = content2.replace(old_grid_b, new_grid_b)

with open("src/components/TVSlideshow.tsx", "w") as f:
    f.write(content2)

