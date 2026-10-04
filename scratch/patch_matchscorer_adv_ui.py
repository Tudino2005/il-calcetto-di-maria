with open('src/components/MatchScorer.tsx', 'r') as f:
    content = f.read()

old_adv = """            <div>
              <label className="text-[11px] font-black uppercase tracking-wider text-yellow-400 block mb-1">
                Soglia Vantaggi (Pari a cui scattano)
              </label>
              <div className="flex gap-1.5">
                {[99, 4, 5, 6, 7, 8].filter(val => val === 99 || val < targetGoals).map(val => (
                  <button
                    key={val}
                    onClick={() => updateSettings("goals", targetGoals, val)}
                    className={clsx(
                      "px-3 py-1 rounded-lg text-sm font-black transition",
                      advantageThreshold === val ? "bg-yellow-500 text-slate-950" : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
                    )}
                  >
                    {val === 99 ? "NO" : val}
                  </button>
                ))}
              </div>
            </div>"""

new_adv = """            <div>
              <label className="text-[11px] font-black uppercase tracking-wider text-yellow-400 block mb-1">
                Vantaggi (Scarto di 2)
              </label>
              <div className="flex gap-1.5">
                <button
                  onClick={() => updateSettings("goals", targetGoals, targetGoals - 1)}
                  className={clsx(
                    "px-4 py-1 rounded-lg text-sm font-black transition",
                    advantageThreshold !== 99 ? "bg-yellow-500 text-slate-950" : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
                  )}
                >
                  SI
                </button>
                <button
                  onClick={() => updateSettings("goals", targetGoals, 99)}
                  className={clsx(
                    "px-4 py-1 rounded-lg text-sm font-black transition",
                    advantageThreshold === 99 ? "bg-yellow-500 text-slate-950" : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
                  )}
                >
                  NO
                </button>
              </div>
            </div>"""

content = content.replace(old_adv, new_adv)

with open('src/components/MatchScorer.tsx', 'w') as f:
    f.write(content)
