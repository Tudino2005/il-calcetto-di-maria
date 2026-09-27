const fs = require('fs');
let code = fs.readFileSync('src/components/TournamentForm.tsx', 'utf8');

const regex = /\{\/\* ─── SEZIONE CALENDARIO AUTOMATICO ──────────────────────────────── \*\/\}\s*<div className="bg-slate-800\/40 border border-indigo-500\/30 rounded-2xl p-6 flex flex-col gap-5">[\s\S]*?\{\/\* Days of week \*\/\}\s*<div>[\s\S]*?<\/div>\s*<\/div>/;

const newBlock = `{/* ─── SEZIONE OPZIONI (CALENDARIO AUTOMATICO) ──────────────────────────────── */}
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
              <h3 className="text-white font-black uppercase tracking-wider text-sm">Opzioni Calendario</h3>
              <p className="text-slate-500 text-[10px] sm:text-xs">Parametri per la generazione automatica degli orari</p>
            </div>
          </div>
          <div className="text-indigo-400 p-2">
            {showAdvancedOptions ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </button>

        {showAdvancedOptions && (
          <div className="p-6 pt-2 border-t border-indigo-500/10 flex flex-col gap-5 animate-fade-in-up">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Start Time */}
              <div>
                <label className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-wider text-xs mb-2">
                  <Clock className="w-3.5 h-3.5" /> Orario Primo Fischio
                </label>
                <input
                  type="time"
                  value={scheduleStartTime}
                  onChange={(e) => setScheduleStartTime(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Max Matches Per Day */}
              <div>
                <label className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-wider text-xs mb-2">
                  <Hash className="w-3.5 h-3.5" /> Max Partite al Giorno
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={maxMatchesPerDay}
                  onChange={(e) => setMaxMatchesPerDay(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-indigo-500 transition-colors text-center text-xl font-black"
                />
              </div>
            </div>

            {/* Num Tables */}
            <div>
              <label className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-wider text-xs mb-2">
                <Cpu className="w-3.5 h-3.5" /> Biliardini Disponibili (partite in parallelo)
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setNumTables(n)}
                    className={clsx(
                      "flex-1 py-3 rounded-xl font-black text-lg transition border-2",
                      numTables === n
                        ? "bg-indigo-600 border-indigo-400 text-white"
                        : "bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white"
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Days of week */}
            <div>
              <label className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-wider text-xs mb-2">
                <CheckSquare className="w-3.5 h-3.5" /> Giorni di Gioco
              </label>
              <div className="flex gap-2">
                {DAYS_OF_WEEK.map((day) => {
                  const active = scheduleDays.includes(day.value);
                  return (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleScheduleDay(day.value)}
                      className={clsx(
                        "flex-1 flex flex-col items-center justify-center py-3 rounded-xl font-bold text-sm transition border-2",
                        active
                          ? "bg-indigo-600 border-indigo-400 text-white"
                          : "bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-500"
                      )}
                    >
                      {active
                        ? <CheckSquare className="w-3.5 h-3.5 mb-1" />
                        : <Square className="w-3.5 h-3.5 mb-1" />
                      }
                      {day.label}
                    </button>
                  );
                })}
              </div>
              {scheduleDays.length === 0 && (
                <p className="text-amber-400 text-xs mt-2 font-bold">⚠ Seleziona almeno un giorno per generare il calendario.</p>
              )}
            </div>
          </div>
        )}
      </div>`;

code = code.replace(regex, newBlock);
fs.writeFileSync('src/components/TournamentForm.tsx', code);
