import re

def patch_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # 1. Update initial state via useEffect to prioritize tournament rules
    old_effect = """  useEffect(() => {
    try {
      const saved = localStorage.getItem("foosball_scorer_settings");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.mode) setMode(parsed.mode);
        if (parsed.targetGoals) setTargetGoals(parsed.targetGoals);
        if (parsed.advantageThreshold) setAdvantageThreshold(parsed.advantageThreshold);
      }
    } catch {}
  }, []);"""

    new_effect = """  useEffect(() => {
    if (match.tournament) {
      setMode(match.tournament.scoringMode as ScorerMode || "goals");
      setTargetGoals(match.tournament.targetGoals || 7);
      setAdvantageThreshold(match.tournament.advantageThreshold ?? 5);
      return;
    }
    try {
      const saved = localStorage.getItem("foosball_scorer_settings");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.mode) setMode(parsed.mode);
        if (parsed.targetGoals) setTargetGoals(parsed.targetGoals);
        if (parsed.advantageThreshold) setAdvantageThreshold(parsed.advantageThreshold);
      }
    } catch {}
  }, [match.tournament]);"""

    # 2. Hide interactive settings if it's a tournament
    old_settings = """        {/* SETTINGS & MODE CONTROLS */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Mode switch */}
          <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl p-1 text-xs font-bold">
            <button
              onClick={() => updateSettings("goals", targetGoals, advantageThreshold)}
              className={clsx(
                "px-3 py-1.5 rounded-lg transition-all",
                mode === "goals" ? "bg-purple-600 text-white shadow" : "text-slate-400 hover:text-white"
              )}
            >
              ⚽ Modalità Gol
            </button>
            <button
              onClick={() => updateSettings("sets", targetGoals, advantageThreshold)}
              className={clsx(
                "px-3 py-1.5 rounded-lg transition-all",
                mode === "sets" ? "bg-slate-700 text-white shadow" : "text-slate-400 hover:text-white"
              )}
            >
              🏆 Solo Partite
            </button>
          </div>

        </div>
      </header>

      <div className="flex flex-col lg:flex-row items-stretch gap-4 mb-4 w-full">
        {/* ALWAYS VISIBLE SETTINGS PANEL */}
        {mode === "goals" && (
          <div className="bg-slate-900/95 border border-purple-500/30 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-center lg:justify-start gap-4 animate-in fade-in slide-in-from-top-2 w-full lg:w-1/2">
          <div className="flex items-center gap-4 flex-wrap">
            <div>
              <label className="text-[11px] font-black uppercase tracking-wider text-purple-300 block mb-1">
                Gol per vincere ogni Partita
              </label>
              <div className="flex gap-1.5">
                {[5, 6, 7, 8, 9, 10].map(val => (
                  <button
                    key={val}
                    onClick={() => updateSettings("goals", val, advantageThreshold === 99 ? 99 : val - 1)}
                    className={clsx(
                      "px-3 py-1 rounded-lg text-sm font-black transition",
                      targetGoals === val ? "bg-purple-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
                    )}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-8 w-px bg-slate-700 hidden sm:block"></div>

            <div>
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
            </div>
          </div>
          </div>
        )}
"""

    new_settings = """        {/* SETTINGS & MODE CONTROLS */}
        <div className="flex items-center gap-2 flex-wrap">
          {match.tournamentId ? (
            <div className="flex items-center gap-3 text-xs font-bold text-slate-400 bg-slate-900 px-4 py-2 rounded-xl border border-slate-800">
              <span className="text-white">{mode === 'goals' ? '⚽ Modalità Gol' : '🏆 Solo Partite'}</span>
              {mode === 'goals' && (
                <>
                  <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                  <span>Vittoria: {targetGoals} Gol</span>
                  <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                  <span>Vantaggi: {advantageThreshold === 99 ? 'NO' : 'SI'}</span>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl p-1 text-xs font-bold">
              <button
                onClick={() => updateSettings("goals", targetGoals, advantageThreshold)}
                className={clsx(
                  "px-3 py-1.5 rounded-lg transition-all",
                  mode === "goals" ? "bg-purple-600 text-white shadow" : "text-slate-400 hover:text-white"
                )}
              >
                ⚽ Modalità Gol
              </button>
              <button
                onClick={() => updateSettings("sets", targetGoals, advantageThreshold)}
                className={clsx(
                  "px-3 py-1.5 rounded-lg transition-all",
                  mode === "sets" ? "bg-slate-700 text-white shadow" : "text-slate-400 hover:text-white"
                )}
              >
                🏆 Solo Partite
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-col lg:flex-row items-stretch gap-4 mb-4 w-full">
        {/* ALWAYS VISIBLE SETTINGS PANEL (ONLY FOR FREE MATCHES) */}
        {!match.tournamentId && mode === "goals" && (
          <div className="bg-slate-900/95 border border-purple-500/30 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-center lg:justify-start gap-4 animate-in fade-in slide-in-from-top-2 w-full lg:w-1/2">
          <div className="flex items-center gap-4 flex-wrap">
            <div>
              <label className="text-[11px] font-black uppercase tracking-wider text-purple-300 block mb-1">
                Gol per vincere ogni Partita
              </label>
              <div className="flex gap-1.5">
                {[5, 6, 7, 8, 9, 10].map(val => (
                  <button
                    key={val}
                    onClick={() => updateSettings("goals", val, advantageThreshold === 99 ? 99 : val - 1)}
                    className={clsx(
                      "px-3 py-1 rounded-lg text-sm font-black transition",
                      targetGoals === val ? "bg-purple-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
                    )}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-8 w-px bg-slate-700 hidden sm:block"></div>

            <div>
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
            </div>
          </div>
          </div>
        )}
"""

    content = content.replace(old_effect, new_effect)
    content = content.replace(old_settings, new_settings)

    with open(filepath, 'w') as f:
        f.write(content)

patch_file('src/components/MatchScorer.tsx')
