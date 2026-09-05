import re

with open("src/components/TournamentForm.tsx", "r") as f:
    content = f.read()

# Add drawDate state
content = content.replace(
    'const [startDate, setStartDate] = useState("");',
    'const [startDate, setStartDate] = useState("");\n  const [drawDate, setDrawDate] = useState("");'
)

# Append to formData
content = content.replace(
    'if (startDate) formData.append("startDate", startDate);',
    'if (startDate) formData.append("startDate", startDate);\n    if (drawDate && type !== "coppie_fisse") formData.append("drawDate", drawDate);'
)

# Add UI field
old_ui = """        <div>
          <label className="block text-slate-400 font-bold mb-2 uppercase tracking-wider text-sm">Data di Inizio</label>
          <input
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-6">"""

new_ui = """        <div>
          <label className="block text-slate-400 font-bold mb-2 uppercase tracking-wider text-sm">Data di Inizio</label>
          <input
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {type !== "coppie_fisse" && (
          <div>
            <label className="block text-slate-400 font-bold mb-2 uppercase tracking-wider text-sm">Data Sorteggio</label>
            <input
              type="datetime-local"
              value={drawDate}
              onChange={(e) => setDrawDate(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-purple-500"
            />
          </div>
        )}"""

content = content.replace(old_ui, new_ui)

with open("src/components/TournamentForm.tsx", "w") as f:
    f.write(content)
