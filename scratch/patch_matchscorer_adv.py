with open('src/components/MatchScorer.tsx', 'r') as f:
    content = f.read()

old_adv = """              <div className="flex gap-1.5">
                {[4, 5, 6, 7, 8].filter(val => val < targetGoals).map(val => (
                  <button
                    key={val}
                    onClick={() => updateSettings("goals", targetGoals, val)}
                    className={clsx(
                      "px-3 py-1 rounded-lg text-sm font-black transition",
                      advantageThreshold === val ? "bg-yellow-500 text-slate-950" : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
                    )}
                  >
                    {val}
                  </button>
                ))}
              </div>"""

new_adv = """              <div className="flex gap-1.5">
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
              </div>"""

content = content.replace(old_adv, new_adv)

with open('src/components/MatchScorer.tsx', 'w') as f:
    f.write(content)
