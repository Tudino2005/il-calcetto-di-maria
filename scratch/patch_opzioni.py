import re

with open('src/components/TournamentForm.tsx', 'r') as f:
    content = f.read()

old_code = """      {/* ─── SEZIONE OPZIONI (CALENDARIO AUTOMATICO) ──────────────────────────────── */}
      <div className="bg-slate-800/20 border border-indigo-500/20 rounded-2xl flex flex-col overflow-hidden transition-all duration-300">
        <button 
          type="button" 
          onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
          className="flex items-center justify-between p-4 w-full hover:bg-slate-800/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
              <Settings className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-left">
              <h3 className="text-white font-black uppercase tracking-wider text-sm">Opzioni</h3>
              <p className="text-slate-500 text-[10px] sm:text-xs">Impostazioni avanzate del torneo</p>
            </div>
          </div>
          <div className="text-indigo-400 p-2">
            {showAdvancedOptions ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </button>

        {showAdvancedOptions && (
          <div className="p-6 pt-2 border-t border-indigo-500/10 flex flex-col gap-5 animate-fade-in-up">"""

new_code = """      {/* ─── SEZIONE OPZIONI (CALENDARIO AUTOMATICO) ──────────────────────────────── */}
      <div className="bg-slate-800/40 border border-slate-700/80 rounded-2xl p-8 shadow-inner flex flex-col gap-8">
        <h3 className="text-lg font-black text-slate-300 -mb-2">Opzioni</h3>
        <p className="text-slate-500 text-xs -mt-6">Impostazioni avanzate del torneo</p>
        
        <div className="flex flex-col gap-5">"""

content = content.replace(old_code, new_code)

# We also need to remove the closing tags for the accordion block
# Search for the end of the OPZIONI block, right before SEZIONE FORMATO
old_end = """              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── SEZIONE FORMATO E NOMI ──────────────────────────────── */}"""

new_end = """              </div>
            </div>
        </div>
      </div>

      {/* ─── SEZIONE FORMATO E NOMI ──────────────────────────────── */}"""

content = content.replace(old_end, new_end)

with open('src/components/TournamentForm.tsx', 'w') as f:
    f.write(content)

print("Replaced!")
