with open('src/components/TournamentForm.tsx', 'r') as f:
    content = f.read()

old_adv = """              <div className="flex flex-col items-center text-center mb-2">
                <label className="text-xs font-black uppercase tracking-wider text-yellow-400 block mb-3">
                  Soglia Vantaggi (Pari a cui scattano)
                </label>
                <div className="flex gap-2">
                  {[99, 4, 5, 6, 7, 8].filter(val => val === 99 || val < targetGoals).map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => updateGoalSettings(targetGoals, val)}
                      className={clsx(
                        "h-9 rounded-lg font-black transition shadow-sm flex items-center justify-center",
                        val === 99 ? "w-12 text-xs" : "w-9 text-sm",
                        advantageThreshold === val ? "bg-yellow-500 text-slate-950 border-2 border-yellow-300 shadow-yellow-500/30" : "bg-slate-900 border-2 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white"
                      )}
                    >
                      {val === 99 ? "NO" : val}
                    </button>
                  ))}
                </div>
              </div>"""

new_adv = """              <div className="flex flex-col items-center text-center mb-2">
                <label className="text-xs font-black uppercase tracking-wider text-yellow-400 block mb-3">
                  Vantaggi (Vittoria di 2 scarto)
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => updateGoalSettings(targetGoals, targetGoals - 1)}
                    className={clsx(
                      "w-16 h-9 rounded-lg font-black transition shadow-sm text-sm flex items-center justify-center",
                      advantageThreshold !== 99 ? "bg-yellow-500 text-slate-950 border-2 border-yellow-300 shadow-yellow-500/30" : "bg-slate-900 border-2 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white"
                    )}
                  >
                    SI
                  </button>
                  <button
                    type="button"
                    onClick={() => updateGoalSettings(targetGoals, 99)}
                    className={clsx(
                      "w-16 h-9 rounded-lg font-black transition shadow-sm text-sm flex items-center justify-center",
                      advantageThreshold === 99 ? "bg-yellow-500 text-slate-950 border-2 border-yellow-300 shadow-yellow-500/30" : "bg-slate-900 border-2 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white"
                    )}
                  >
                    NO
                  </button>
                </div>
              </div>"""

content = content.replace(old_adv, new_adv)

with open('src/components/TournamentForm.tsx', 'w') as f:
    f.write(content)
