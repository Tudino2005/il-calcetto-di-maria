import re

with open('src/components/TournamentForm.tsx', 'r') as f:
    content = f.read()

start_marker = '    <form onSubmit={handleSubmit} className="flex flex-col gap-8">'
end_marker = '      <div>\n        <label className="block text-slate-400 font-bold uppercase tracking-wider text-sm mb-4">Formato Torneo</label>'

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx != -1 and end_idx != -1:
    old_block = content[start_idx:end_idx]
    
    new_block = """    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      {/* ROW 1 */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-5">
          <label className="block text-slate-400 font-bold mb-2 uppercase tracking-wider text-sm">Nome Torneo</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="es. Coppa dei Campioni 2026"
            className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-purple-500 transition-colors"
            required
          />
        </div>
        <div className="md:col-span-4">
          <label className="block text-slate-400 font-bold mb-2 uppercase tracking-wider text-sm">Numero Max Squadre</label>
          <select value={maxTeams} onChange={(e) => setMaxTeams(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-purple-500">
            <option value={4}>4 Squadre (8 Giocatori)</option>
            <option value={8}>8 Squadre (16 Giocatori)</option>
            <option value={16}>16 Squadre (32 Giocatori)</option>
            <option value={32}>32 Squadre (64 Giocatori)</option>
            <option value={64}>64 Squadre (128 Giocatori)</option>
          </select>
        </div>
        <div className="md:col-span-3">
          <label className="block text-slate-400 font-bold mb-2 uppercase tracking-wider text-sm">Costo Iscrizione a Persona (€)</label>
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
      </div>

      {/* ROW 2 */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-3">
          <label className="block text-slate-400 font-bold mb-2 uppercase tracking-wider text-sm">Data di Inizio</label>
          <input
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-purple-500"
          />
        </div>
        <div className="md:col-span-3">
          <label className="block text-slate-400 font-bold mb-2 uppercase tracking-wider text-sm">Data di Fine</label>
          <input
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-purple-500"
          />
        </div>
        
        {type !== "coppie_fisse" ? (
          <>
            <div className="md:col-span-3">
              <label className="block text-slate-400 font-bold mb-2 uppercase tracking-wider text-sm">Data Sorteggio</label>
              <input
                type="datetime-local"
                value={drawDate}
                onChange={(e) => setDrawDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-slate-400 font-bold mb-2 uppercase tracking-wider text-sm">Premi</label>
              <input
                type="text"
                value={prizes}
                onChange={(e) => setPrizes(e.target.value)}
                placeholder="es. 1° Coppa, 2° Cena"
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-purple-500"
              />
            </div>
          </>
        ) : (
          <div className="md:col-span-6">
            <label className="block text-slate-400 font-bold mb-2 uppercase tracking-wider text-sm">Premi</label>
            <input
              type="text"
              value={prizes}
              onChange={(e) => setPrizes(e.target.value)}
              placeholder="es. 1° Coppa, 2° Cena"
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-purple-500"
            />
          </div>
        )}
      </div>\n\n"""

    content = content.replace(old_block, new_block)
    
    with open('src/components/TournamentForm.tsx', 'w') as f:
        f.write(content)
    print("Patched Tournament Form!")
else:
    print("Could not find start/end markers")
