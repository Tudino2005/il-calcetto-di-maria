import re

def patch_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Add scoringMode state
    if "const [scoringMode" not in content:
        content = content.replace(
            "const [targetGoals, setTargetGoals] = useState<number>(7);",
            "const [scoringMode, setScoringMode] = useState<'goals' | 'sets'>('goals');\n  const [targetGoals, setTargetGoals] = useState<number>(7);"
        )

    # Add hidden input for scoringMode
    if 'name="scoringMode"' not in content:
        content = content.replace(
            '<input type="hidden" name="targetGoals" value={targetGoals} />',
            '<input type="hidden" name="scoringMode" value={scoringMode} />\n        <input type="hidden" name="targetGoals" value={targetGoals} />'
        )

    # Replace the card UI to include Modalità Gol / Solo Partite switch
    old_card_start = """              <div className="flex flex-col items-center text-center mt-2">
                <label className="text-xs font-black uppercase tracking-wider text-purple-300 block mb-3">
                  Gol per vincere ogni Partita
                </label>"""
                
    new_card_start = """              <div className="flex justify-center mb-2">
                <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl p-1 text-xs font-bold shadow-inner">
                  <button
                    type="button"
                    onClick={() => setScoringMode('goals')}
                    className={`px-4 py-2 rounded-lg transition-all ${scoringMode === 'goals' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                  >
                    ⚽ Modalità Gol
                  </button>
                  <button
                    type="button"
                    onClick={() => setScoringMode('sets')}
                    className={`px-4 py-2 rounded-lg transition-all ${scoringMode === 'sets' ? 'bg-slate-700 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                  >
                    🏆 Solo Partite
                  </button>
                </div>
              </div>

              {scoringMode === 'goals' && (
                <>
                  <div className="h-px w-full bg-slate-700/50 mb-2"></div>
                  <div className="flex flex-col items-center text-center mt-2">
                    <label className="text-xs font-black uppercase tracking-wider text-purple-300 block mb-3">
                      Gol per vincere ogni Partita
                    </label>"""
                    
    old_card_end = """                    NO
                  </button>
                </div>
              </div>"""
              
    new_card_end = """                    NO
                  </button>
                </div>
              </div>
              </>
              )}
              {scoringMode === 'sets' && (
                <div className="flex-1 flex flex-col items-center justify-center text-center mt-4 mb-4">
                  <span className="text-4xl mb-4 opacity-50">🏆</span>
                  <p className="text-sm font-bold text-slate-300">Modalità Solo Partite</p>
                  <p className="text-xs text-slate-500 mt-2 max-w-[200px]">Il segnapunti conterà solo i set vinti, senza tracciare i gol.</p>
                </div>
              )}"""

    content = content.replace(old_card_start, new_card_start)
    content = content.replace(old_card_end, new_card_end)

    with open(filepath, 'w') as f:
        f.write(content)

patch_file('src/components/TournamentForm.tsx')
