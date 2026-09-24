import re

with open('src/components/TournamentForm.tsx', 'r') as f:
    content = f.read()

start_marker = '      <div>\n        <label className="block text-slate-400 font-bold mb-4 uppercase tracking-wider text-sm">Modalità Composizione Squadre</label>'
end_marker = '            <div>\n              <span className="text-white font-bold block">Coppie Fisse</span>\n              <span className="text-slate-500 text-sm">Squadre già formate a priori.</span>\n            </div>\n          </label>\n        </div>\n      </div>'

start_idx = content.find(start_marker)
end_idx = content.find(end_marker) + len(end_marker)

if start_idx != -1 and content.find(end_marker) != -1:
    new_block = """      <div>
        <label className="block text-slate-400 font-bold mb-4 uppercase tracking-wider text-sm">Modalità Composizione Squadre</label>
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex flex-col gap-3 flex-1">
            <label className={clsx("flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors", type === "sorteggio_ruoli" ? "bg-purple-900/20 border-purple-500" : "bg-slate-900 border-slate-700 hover:border-slate-500")}>
              <input type="radio" name="typeRadio" value="sorteggio_ruoli" checked={type === "sorteggio_ruoli"} onChange={() => setType("sorteggio_ruoli")} className="w-5 h-5 accent-purple-500" />
              <div>
                <span className="text-white font-bold block">Sorteggio per Ruoli</span>
                <span className="text-slate-500 text-sm">Crea coppie equilibrate unendo un attaccante e un difensore.</span>
              </div>
            </label>
            <label className={clsx("flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors", type === "sorteggio_integrale" ? "bg-purple-900/20 border-purple-500" : "bg-slate-900 border-slate-700 hover:border-slate-500")}>
              <input type="radio" name="typeRadio" value="sorteggio_integrale" checked={type === "sorteggio_integrale"} onChange={() => setType("sorteggio_integrale")} className="w-5 h-5 accent-purple-500" />
              <div>
                <span className="text-white font-bold block">Sorteggio Integrale</span>
                <span className="text-slate-500 text-sm">Composizione puramente casuale.</span>
              </div>
            </label>
            <label className={clsx("flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors", type === "coppie_fisse" ? "bg-purple-900/20 border-purple-500" : "bg-slate-900 border-slate-700 hover:border-slate-500")}>
              <input type="radio" name="typeRadio" value="coppie_fisse" checked={type === "coppie_fisse"} onChange={() => setType("coppie_fisse")} className="w-5 h-5 accent-purple-500" />
              <div>
                <span className="text-white font-bold block">Coppie Fisse</span>
                <span className="text-slate-500 text-sm">Squadre già formate a priori.</span>
              </div>
            </label>
          </div>

          <div className="flex flex-col justify-center flex-1">
            <div className={clsx("bg-slate-800/40 border border-slate-700/80 rounded-2xl p-6 flex flex-col justify-center items-center h-full gap-6 shadow-inner transition-all duration-300", type === "coppie_fisse" ? "opacity-0 pointer-events-none" : "opacity-100")}>
              <div className="flex flex-col items-center text-center max-w-[250px]">
                <label className="text-xs font-black uppercase tracking-wider text-emerald-400 block mb-4">
                  Inversione Ruoli
                </label>
                <div className="flex flex-col items-center gap-3 w-full">
                  <button
                    type="button"
                    onClick={() => setAllowRoleSwaps(!allowRoleSwaps)}
                    className={clsx(
                      "w-16 h-9 rounded-full p-1 transition-colors duration-300 ease-in-out relative flex items-center shadow-inner",
                      allowRoleSwaps ? "bg-emerald-500" : "bg-slate-700"
                    )}
                  >
                    <div
                      className={clsx(
                        "w-7 h-7 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out",
                        allowRoleSwaps ? "translate-x-7" : "translate-x-0"
                      )}
                    />
                  </button>
                  <span className={clsx("text-sm font-bold", allowRoleSwaps ? "text-emerald-400" : "text-slate-400")}>
                    {allowRoleSwaps ? "SÌ, CONSENTITA" : "NO, BLOCCATA"}
                  </span>
                  <span className="text-xs text-slate-500 leading-tight">
                    {allowRoleSwaps 
                      ? "I giocatori potranno scambiarsi i ruoli durante il torneo."
                      : "I giocatori dovranno mantenere il loro ruolo originario."}
                  </span>
                </div>
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

