import re

with open("src/components/TournamentForm.tsx", "r") as f:
    content = f.read()

# Add maxTeams state
content = content.replace(
    'const [teamsPerGroup, setTeamsPerGroup] = useState(4);',
    'const [teamsPerGroup, setTeamsPerGroup] = useState(4);\n  const [maxTeams, setMaxTeams] = useState(8);'
)

# Append maxTeams to formData
content = content.replace(
    'formData.append("teamsPerGroup", teamsPerGroup.toString());',
    'formData.append("teamsPerGroup", teamsPerGroup.toString());\n    formData.append("maxTeams", maxTeams.toString());'
)

# Insert the maxTeams input into the grid
old_grid = """      <div className="grid md:grid-cols-3 gap-6">
        <div>
          <label className="block text-slate-400 font-bold mb-2 uppercase tracking-wider text-sm">Data di Inizio</label>"""

new_grid = """      <div className="grid md:grid-cols-2 gap-6 mb-2">
        <div>
          <label className="block text-slate-400 font-bold mb-2 uppercase tracking-wider text-sm">Numero Max Squadre</label>
          <select value={maxTeams} onChange={(e) => setMaxTeams(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-purple-500">
            <option value={4}>4 Squadre (8 Giocatori)</option>
            <option value={8}>8 Squadre (16 Giocatori)</option>
            <option value={16}>16 Squadre (32 Giocatori)</option>
            <option value={32}>32 Squadre (64 Giocatori)</option>
            <option value={64}>64 Squadre (128 Giocatori)</option>
          </select>
        </div>
        <div>
          <label className="block text-slate-400 font-bold mb-2 uppercase tracking-wider text-sm">Data di Inizio</label>"""

content = content.replace(old_grid, new_grid)

# Close the new grid and open a new one for costs and prizes
old_date_end = """            className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-purple-500"
          />
        </div>
        <div>
          <label className="block text-slate-400 font-bold mb-2 uppercase tracking-wider text-sm">Costo Iscrizione (€)</label>"""

new_date_end = """            className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-slate-400 font-bold mb-2 uppercase tracking-wider text-sm">Costo Iscrizione (€)</label>"""

content = content.replace(old_date_end, new_date_end)

with open("src/components/TournamentForm.tsx", "w") as f:
    f.write(content)
