import re

with open('src/components/TournamentForm.tsx', 'r') as f:
    content = f.read()

# I will use a regex substitution that replaces from `<div>\n        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-4">`
# to the end of the `gironi_eliminazione` label

start_marker = '      <div>\n        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-4">\n          <label className="block text-slate-400 font-bold uppercase tracking-wider text-sm">Formato Torneo</label>'
end_marker = '            <div>\n              <span className="text-white font-bold block">Gironi + Eliminazione</span>\n              <span className="text-slate-500 text-sm">Fase a gruppi seguita da playoff stile Mondiali.</span>\n            </div>\n          </label>\n        </div>'

start_idx = content.find(start_marker)
end_idx = content.find(end_marker) + len(end_marker)

if start_idx != -1 and content.find(end_marker) != -1:
    new_block = """      <div>
        <label className="block text-slate-400 font-bold uppercase tracking-wider text-sm mb-4">Formato Torneo</label>
        
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex flex-col gap-3 flex-1">
            <label className={clsx("flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors", format === "eliminazione_diretta" ? "bg-purple-900/20 border-purple-500" : "bg-slate-900 border-slate-700 hover:border-slate-500")}>
              <input type="radio" name="formatRadio" value="eliminazione_diretta" checked={format === "eliminazione_diretta"} onChange={() => setFormat("eliminazione_diretta")} className="w-5 h-5 accent-purple-500" />
              <div>
                <span className="text-white font-bold block">Eliminazione Diretta</span>
                <span className="text-slate-500 text-sm">Tabellone classico. Chi perde è fuori.</span>
              </div>
            </label>
            <label className={clsx("flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors", format === "doppia_eliminazione" ? "bg-purple-900/20 border-purple-500" : "bg-slate-900 border-slate-700 hover:border-slate-500")}>
              <input type="radio" name="formatRadio" value="doppia_eliminazione" checked={format === "doppia_eliminazione"} onChange={() => setFormat("doppia_eliminazione")} className="w-5 h-5 accent-purple-500" />
              <div>
                <span className="text-white font-bold block">Doppia Eliminazione</span>
                <span className="text-slate-500 text-sm">Tabellone Winners e Losers Bracket.</span>
              </div>
            </label>
            <label className={clsx("flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors", format === "gironi_eliminazione" ? "bg-purple-900/20 border-purple-500" : "bg-slate-900 border-slate-700 hover:border-slate-500")}>
              <input type="radio" name="formatRadio" value="gironi_eliminazione" checked={format === "gironi_eliminazione"} onChange={() => setFormat("gironi_eliminazione")} className="w-5 h-5 accent-purple-500" />
              <div>
                <span className="text-white font-bold block">Gironi + Eliminazione</span>
                <span className="text-slate-500 text-sm">Fase a gruppi seguita da playoff stile Mondiali.</span>
              </div>
            </label>
          </div>

          <div className="flex flex-col justify-center flex-1">
            <div className="bg-slate-800/40 border border-slate-700/80 rounded-2xl p-6 flex flex-col gap-6 shadow-inner">
              <div className="flex flex-col items-center text-center">
                <label className="text-xs font-black uppercase tracking-wider text-purple-300 block mb-3">
                  Gol per vincere ogni Set
                </label>
                <div className="flex gap-2">
                  {[5, 6, 7, 8, 10].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => updateGoalSettings(val, Math.min(advantageThreshold, val - 1))}
                      className={clsx(
                        "w-12 h-12 rounded-xl text-lg font-black transition shadow-sm",
                        targetGoals === val ? "bg-purple-600 text-white border-2 border-purple-400 shadow-purple-500/30" : "bg-slate-900 border-2 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white"
                      )}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-px w-full bg-slate-700/50"></div>

              <div className="flex flex-col items-center text-center">
                <label className="text-xs font-black uppercase tracking-wider text-yellow-400 block mb-3">
                  Soglia Vantaggi (Pari a cui scattano)
                </label>
                <div className="flex gap-2">
                  {[4, 5, 6, 7, 8].filter(val => val < targetGoals).map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => updateGoalSettings(targetGoals, val)}
                      className={clsx(
                        "w-12 h-12 rounded-xl text-lg font-black transition shadow-sm",
                        advantageThreshold === val ? "bg-yellow-500 text-slate-950 border-2 border-yellow-300 shadow-yellow-500/30" : "bg-slate-900 border-2 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white"
                      )}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>"""
    
    content = content[:start_idx] + new_block + content[end_idx:]
    with open('src/components/TournamentForm.tsx', 'w') as f:
        f.write(content)
    print("Patched successfully")
else:
    print("Could not find block")

