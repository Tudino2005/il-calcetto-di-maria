import re

with open('src/components/TournamentForm.tsx', 'r') as f:
    content = f.read()

old_block = """        <div className="flex flex-col gap-5">
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
        </div>"""

new_block = """        {/* ROW 1 */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mt-2">
          <div className="md:col-span-5 flex flex-col-reverse group">
            <span className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-bold group-hover:text-purple-400 transition-colors">Orario Primo Fischio</span>
            <input
              type="time"
              value={scheduleStartTime}
              onChange={(e) => setScheduleStartTime(e.target.value)}
              className="w-full bg-transparent border-0 border-b border-transparent text-white font-bold text-xl p-0 focus:ring-0 focus:outline-none placeholder-slate-600 transition-colors"
            />
          </div>
          <div className="md:col-span-4 flex flex-col-reverse group">
            <span className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-bold group-hover:text-purple-400 transition-colors">Max Partite al Giorno</span>
            <input
              type="number"
              min="1"
              max="50"
              value={maxMatchesPerDay}
              onChange={(e) => setMaxMatchesPerDay(Math.max(1, Number(e.target.value)))}
              className="w-full bg-transparent border-0 border-b border-transparent text-white font-bold text-xl p-0 focus:ring-0 focus:outline-none placeholder-slate-600 transition-colors"
            />
          </div>
          <div className="md:col-span-3 flex flex-col-reverse group">
            <span className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-bold group-hover:text-purple-400 transition-colors">Biliardini Disponibili</span>
            <select value={numTables} onChange={(e) => setNumTables(Number(e.target.value))} className="w-full bg-transparent border-0 border-b border-transparent text-white font-bold text-xl p-0 focus:ring-0 focus:outline-none cursor-pointer appearance-none transition-colors">
              <option value={1} className="bg-slate-900">1 Biliardino</option>
              <option value={2} className="bg-slate-900">2 Biliardini (Parallelo)</option>
              <option value={3} className="bg-slate-900">3 Biliardini (Parallelo)</option>
              <option value={4} className="bg-slate-900">4 Biliardini (Parallelo)</option>
            </select>
          </div>
        </div>

        {/* ROW 2 - Giorni di gioco */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mt-4">
          <div className="md:col-span-12 flex flex-col-reverse group">
            <span className="text-[10px] text-slate-500 mt-2 uppercase tracking-wider font-bold group-hover:text-purple-400 transition-colors">Giorni di Gioco Settimanali</span>
            <div className="flex flex-wrap gap-4 items-center">
              {DAYS_OF_WEEK.map((day) => {
                const active = scheduleDays.includes(day.value);
                return (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleScheduleDay(day.value)}
                    className={clsx(
                      "flex items-center gap-2 px-3 py-1.5 rounded-full font-bold text-sm transition-all",
                      active
                        ? "bg-purple-500/20 text-purple-400 ring-1 ring-purple-500/50"
                        : "text-slate-500 hover:text-slate-300"
                    )}
                  >
                    {active ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                    {day.label}
                  </button>
                );
              })}
            </div>
            {scheduleDays.length === 0 && (
              <p className="text-amber-400 text-xs mt-2 font-bold">⚠ Seleziona almeno un giorno.</p>
            )}
          </div>
        </div>"""

content = content.replace(old_block, new_block)

with open('src/components/TournamentForm.tsx', 'w') as f:
    f.write(content)
