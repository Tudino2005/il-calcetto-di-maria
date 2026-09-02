import re

with open("src/components/TournamentForm.tsx", "r") as f:
    content = f.read()

# Add states
content = content.replace(
    '  const [teamsPerGroup, setTeamsPerGroup] = useState<number>(4);',
    '  const [teamsPerGroup, setTeamsPerGroup] = useState<number>(4);\n  const [startDate, setStartDate] = useState("");\n  const [pricePerPlayer, setPricePerPlayer] = useState("");\n  const [prizes, setPrizes] = useState("");'
)

# Add appends
content = content.replace(
    '    formData.append("teamsPerGroup", teamsPerGroup.toString());',
    '    formData.append("teamsPerGroup", teamsPerGroup.toString());\n    if (startDate) formData.append("startDate", startDate);\n    if (pricePerPlayer) formData.append("pricePerPlayer", pricePerPlayer);\n    if (prizes) formData.append("prizes", prizes);'
)

# Add inputs
pattern = r'(      <div>\n        <label className="block text-slate-400 font-bold mb-4 uppercase tracking-wider text-sm">Formato Torneo</label>)'
replacement = """      <div className="grid md:grid-cols-3 gap-6">
        <div>
          <label className="block text-slate-400 font-bold mb-2 uppercase tracking-wider text-sm">Data di Inizio</label>
          <input
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-purple-500"
          />
        </div>
        <div>
          <label className="block text-slate-400 font-bold mb-2 uppercase tracking-wider text-sm">Costo Iscrizione (€)</label>
          <input
            type="number"
            min="0"
            step="0.5"
            value={pricePerPlayer}
            onChange={(e) => setPricePerPlayer(e.target.value)}
            placeholder="es. 10"
            className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-purple-500"
          />
        </div>
        <div>
          <label className="block text-slate-400 font-bold mb-2 uppercase tracking-wider text-sm">Premi</label>
          <input
            type="text"
            value={prizes}
            onChange={(e) => setPrizes(e.target.value)}
            placeholder="es. 1° Coppa, 2° Cena"
            className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

\\1"""
content = re.sub(pattern, replacement, content)

with open("src/components/TournamentForm.tsx", "w") as f:
    f.write(content)
