import re

with open('src/components/TournamentForm.tsx', 'r') as f:
    content = f.read()

# I need to find the `)}` that corresponds to showAdvancedOptions and remove it.
# It is followed by `      </div>` and then `      <div className="bg-slate-800/40 border border-slate-700/80 rounded-2xl p-8 shadow-inner flex flex-col gap-10">`

old_block = """              {scheduleDays.length === 0 && (
                <p className="text-amber-400 text-xs mt-2 font-bold">⚠ Seleziona almeno un giorno per generare il calendario.</p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="bg-slate-800/40"""

new_block = """              {scheduleDays.length === 0 && (
                <p className="text-amber-400 text-xs mt-2 font-bold">⚠ Seleziona almeno un giorno per generare il calendario.</p>
              )}
            </div>
        </div>
      </div>

      <div className="bg-slate-800/40"""

content = content.replace(old_block, new_block)

with open('src/components/TournamentForm.tsx', 'w') as f:
    f.write(content)
