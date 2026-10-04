import re

with open('src/components/TournamentForm.tsx', 'r') as f:
    content = f.read()

# 1. Change Formato cards (left side)
old_formato = """      <div>
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex flex-col flex-1 bg-slate-800/40 border border-slate-700/80 rounded-2xl p-6 shadow-inner">
            <h3 className="text-lg font-black text-slate-300 mb-6">Formato</h3>
            <label className="flex items-center justify-between w-full cursor-pointer group">
              <input type="radio" name="formatRadio" value="eliminazione_diretta" checked={format === "eliminazione_diretta"} onChange={() => setFormat("eliminazione_diretta")} className="w-5 h-5 accent-emerald-500 shrink-0 cursor-pointer" />
              <div className="flex flex-col items-end pl-4">
                <span className={"text-sm font-bold tracking-wider block text-right transition-colors text-emerald-400"}>Eliminazione Diretta</span>
                <span className="text-[10px] text-slate-400 text-right leading-tight mt-0.5">Tabellone classico. Chi perde è fuori.</span>
              </div>
            </label>
            
            <label className="flex items-center justify-between w-full mt-4 pt-4 border-t border-slate-700/50 cursor-pointer group">
              <input type="radio" name="formatRadio" value="doppia_eliminazione" checked={format === "doppia_eliminazione"} onChange={() => setFormat("doppia_eliminazione")} className="w-5 h-5 accent-amber-500 shrink-0 cursor-pointer" />
              <div className="flex flex-col items-end pl-4">
                <span className={"text-sm font-bold tracking-wider block text-right transition-colors text-amber-400"}>Doppia Eliminazione</span>
                <span className="text-[10px] text-slate-400 text-right leading-tight mt-0.5">Tabellone Winners e Losers Bracket.</span>
              </div>
            </label>
            
            <label className="flex items-center justify-between w-full mt-4 pt-4 border-t border-slate-700/50 cursor-pointer group">
              <input type="radio" name="formatRadio" value="gironi_eliminazione" checked={format === "gironi_eliminazione"} onChange={() => setFormat("gironi_eliminazione")} className="w-5 h-5 accent-blue-500 shrink-0 cursor-pointer" />
              <div className="flex flex-col items-end pl-4">
                <span className={"text-sm font-bold tracking-wider block text-right transition-colors text-blue-400"}>Gironi + Eliminazione</span>
                <span className="text-[10px] text-slate-400 text-right leading-tight mt-0.5">Fase a gruppi seguita da playoff stile Mondiali.</span>
              </div>
            </label>
          </div>"""

new_formato = """      <div className="flex justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full max-w-5xl">
          <div className="flex flex-col bg-slate-800/40 border border-slate-700/80 rounded-2xl p-6 shadow-inner">
            <h3 className="text-lg font-black text-slate-300 mb-6">Formato</h3>
            <label className="flex items-center justify-start gap-4 w-full cursor-pointer group">
              <input type="radio" name="formatRadio" value="eliminazione_diretta" checked={format === "eliminazione_diretta"} onChange={() => setFormat("eliminazione_diretta")} className="w-5 h-5 accent-emerald-500 shrink-0 cursor-pointer" />
              <div className="flex flex-col items-start">
                <span className={"text-sm font-bold tracking-wider block text-left transition-colors text-emerald-400"}>Eliminazione Diretta</span>
                <span className="text-[10px] text-slate-400 text-left leading-tight mt-0.5">Tabellone classico. Chi perde è fuori.</span>
              </div>
            </label>
            
            <label className="flex items-center justify-start gap-4 w-full mt-4 pt-4 border-t border-slate-700/50 cursor-pointer group">
              <input type="radio" name="formatRadio" value="doppia_eliminazione" checked={format === "doppia_eliminazione"} onChange={() => setFormat("doppia_eliminazione")} className="w-5 h-5 accent-amber-500 shrink-0 cursor-pointer" />
              <div className="flex flex-col items-start">
                <span className={"text-sm font-bold tracking-wider block text-left transition-colors text-amber-400"}>Doppia Eliminazione</span>
                <span className="text-[10px] text-slate-400 text-left leading-tight mt-0.5">Tabellone Winners e Losers Bracket.</span>
              </div>
            </label>
            
            <label className="flex items-center justify-start gap-4 w-full mt-4 pt-4 border-t border-slate-700/50 cursor-pointer group">
              <input type="radio" name="formatRadio" value="gironi_eliminazione" checked={format === "gironi_eliminazione"} onChange={() => setFormat("gironi_eliminazione")} className="w-5 h-5 accent-blue-500 shrink-0 cursor-pointer" />
              <div className="flex flex-col items-start">
                <span className={"text-sm font-bold tracking-wider block text-left transition-colors text-blue-400"}>Gironi + Eliminazione</span>
                <span className="text-[10px] text-slate-400 text-left leading-tight mt-0.5">Fase a gruppi seguita da playoff stile Mondiali.</span>
              </div>
            </label>
          </div>"""

content = content.replace(old_formato, new_formato)


# 2. Change Set Rules card (right side)
old_rules = """          <div className="flex flex-col justify-center flex-1">
            <div className="bg-slate-800/40 border border-slate-700/80 rounded-2xl p-6 flex flex-col gap-6 shadow-inner">
              <div className="flex flex-col items-center text-center">
                <label className="text-xs font-black uppercase tracking-wider text-purple-300 block mb-3">
                  Gol per vincere ogni Set
                </label>
                <div className="flex gap-2">
                  {[5, 6, 7, 8, 10].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => updateGoalSettings(val, Math.min(advantageThreshold, val - 1))}
                      className={clsx(
                        "w-12 h-12 rounded-xl text-lg font-black transition shadow-sm",
                        targetGoals === val ? "bg-purple-600 text-white border-2 border-purple-400 shadow-purple-500/30" : "bg-slate-900 border-2 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white"
                      )}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-px w-full bg-slate-700/50"></div>

              <div className="flex flex-col items-center text-center">
                <label className="text-xs font-black uppercase tracking-wider text-yellow-400 block mb-3">
                  Soglia Vantaggi (Pari a cui scattano)
                </label>
                <div className="flex gap-2">
                  {[4, 5, 6, 7, 8].filter(val => val < targetGoals).map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => updateGoalSettings(targetGoals, val)}
                      className={clsx(
                        "w-12 h-12 rounded-xl text-lg font-black transition shadow-sm",
                        advantageThreshold === val ? "bg-yellow-500 text-slate-950 border-2 border-yellow-300 shadow-yellow-500/30" : "bg-slate-900 border-2 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white"
                      )}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>"""

new_rules = """          <div className="flex flex-col justify-center">
            <div className="bg-slate-800/40 border border-slate-700/80 rounded-2xl p-6 flex flex-col gap-6 shadow-inner h-full">
              <div className="flex flex-col items-center text-center mt-2">
                <label className="text-xs font-black uppercase tracking-wider text-purple-300 block mb-3">
                  Gol per vincere ogni Set
                </label>
                <div className="flex gap-2">
                  {[5, 6, 7, 8, 10].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => updateGoalSettings(val, Math.min(advantageThreshold, val - 1))}
                      className={clsx(
                        "w-9 h-9 rounded-lg text-sm font-black transition shadow-sm",
                        targetGoals === val ? "bg-purple-600 text-white border-2 border-purple-400 shadow-purple-500/30" : "bg-slate-900 border-2 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white"
                      )}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-px w-full bg-slate-700/50"></div>

              <div className="flex flex-col items-center text-center mb-2">
                <label className="text-xs font-black uppercase tracking-wider text-yellow-400 block mb-3">
                  Soglia Vantaggi (Pari a cui scattano)
                </label>
                <div className="flex gap-2">
                  {[4, 5, 6, 7, 8].filter(val => val < targetGoals).map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => updateGoalSettings(targetGoals, val)}
                      className={clsx(
                        "w-9 h-9 rounded-lg text-sm font-black transition shadow-sm",
                        advantageThreshold === val ? "bg-yellow-500 text-slate-950 border-2 border-yellow-300 shadow-yellow-500/30" : "bg-slate-900 border-2 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white"
                      )}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>"""

content = content.replace(old_rules, new_rules)

# 3. Change Composizione Squadre (bottom left)
old_comp = """      <div>
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex flex-col flex-1 bg-slate-800/40 border border-slate-700/80 rounded-2xl p-6 shadow-inner">
            <h3 className="text-lg font-black text-slate-300 mb-6">Composizione Squadre</h3>
            <label className="flex items-center justify-between w-full cursor-pointer group">
              <input type="radio" name="typeRadio" value="sorteggio_ruoli" checked={type === "sorteggio_ruoli"} onChange={() => setType("sorteggio_ruoli")} className="w-5 h-5 accent-emerald-500 shrink-0 cursor-pointer" />
              <div className="flex flex-col items-end pl-4">
                <span className={"text-sm font-bold tracking-wider block text-right transition-colors text-emerald-400"}>Sorteggio per Ruoli</span>
                <span className="text-[10px] text-slate-400 text-right leading-tight mt-0.5">Crea coppie unendo un attaccante e un difensore.</span>
              </div>
            </label>
            
            <label className="flex items-center justify-between w-full mt-4 pt-4 border-t border-slate-700/50 cursor-pointer group">
              <input type="radio" name="typeRadio" value="sorteggio_integrale" checked={type === "sorteggio_integrale"} onChange={() => setType("sorteggio_integrale")} className="w-5 h-5 accent-amber-500 shrink-0 cursor-pointer" />
              <div className="flex flex-col items-end pl-4">
                <span className={"text-sm font-bold tracking-wider block text-right transition-colors text-amber-400"}>Sorteggio Integrale</span>
                <span className="text-[10px] text-slate-400 text-right leading-tight mt-0.5">Composizione puramente casuale.</span>
              </div>
            </label>
            
            <label className="flex items-center justify-between w-full mt-4 pt-4 border-t border-slate-700/50 cursor-pointer group">
              <input type="radio" name="typeRadio" value="coppie_fisse" checked={type === "coppie_fisse"} onChange={() => setType("coppie_fisse")} className="w-5 h-5 accent-blue-500 shrink-0 cursor-pointer" />
              <div className="flex flex-col items-end pl-4">
                <span className={"text-sm font-bold tracking-wider block text-right transition-colors text-blue-400"}>Coppie Fisse</span>
                <span className="text-[10px] text-slate-400 text-right leading-tight mt-0.5">Squadre già formate a priori.</span>
              </div>
            </label>
          </div>"""

new_comp = """      <div className="flex justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full max-w-5xl">
          <div className="flex flex-col bg-slate-800/40 border border-slate-700/80 rounded-2xl p-6 shadow-inner">
            <h3 className="text-lg font-black text-slate-300 mb-6">Composizione Squadre</h3>
            <label className="flex items-center justify-start gap-4 w-full cursor-pointer group">
              <input type="radio" name="typeRadio" value="sorteggio_ruoli" checked={type === "sorteggio_ruoli"} onChange={() => setType("sorteggio_ruoli")} className="w-5 h-5 accent-emerald-500 shrink-0 cursor-pointer" />
              <div className="flex flex-col items-start">
                <span className={"text-sm font-bold tracking-wider block text-left transition-colors text-emerald-400"}>Sorteggio per Ruoli</span>
                <span className="text-[10px] text-slate-400 text-left leading-tight mt-0.5">Crea coppie unendo un attaccante e un difensore.</span>
              </div>
            </label>
            
            <label className="flex items-center justify-start gap-4 w-full mt-4 pt-4 border-t border-slate-700/50 cursor-pointer group">
              <input type="radio" name="typeRadio" value="sorteggio_integrale" checked={type === "sorteggio_integrale"} onChange={() => setType("sorteggio_integrale")} className="w-5 h-5 accent-amber-500 shrink-0 cursor-pointer" />
              <div className="flex flex-col items-start">
                <span className={"text-sm font-bold tracking-wider block text-left transition-colors text-amber-400"}>Sorteggio Integrale</span>
                <span className="text-[10px] text-slate-400 text-left leading-tight mt-0.5">Composizione puramente casuale.</span>
              </div>
            </label>
            
            <label className="flex items-center justify-start gap-4 w-full mt-4 pt-4 border-t border-slate-700/50 cursor-pointer group">
              <input type="radio" name="typeRadio" value="coppie_fisse" checked={type === "coppie_fisse"} onChange={() => setType("coppie_fisse")} className="w-5 h-5 accent-blue-500 shrink-0 cursor-pointer" />
              <div className="flex flex-col items-start">
                <span className={"text-sm font-bold tracking-wider block text-left transition-colors text-blue-400"}>Coppie Fisse</span>
                <span className="text-[10px] text-slate-400 text-left leading-tight mt-0.5">Squadre già formate a priori.</span>
              </div>
            </label>
          </div>"""

content = content.replace(old_comp, new_comp)

# 4. Change Toggles (bottom right)
old_toggles = """          <div className="flex flex-col justify-center flex-1">
            <div className={clsx("bg-slate-800/40 border border-slate-700/80 rounded-2xl p-6 flex flex-col justify-center items-center h-full gap-6 shadow-inner transition-all duration-300", type === "coppie_fisse" ? "opacity-0 pointer-events-none" : "opacity-100")}>
              {type !== "coppie_fisse" && (
                <div className="w-full max-w-[250px] flex flex-col items-center">
                  <div className="flex items-center justify-between w-full">
                    <button
                      type="button"
                      onClick={() => setIsBalancedDraw(!isBalancedDraw)}
                      className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 ease-in-out relative flex items-center shadow-inner shrink-0 ${
                        isBalancedDraw ? "bg-emerald-500" : "bg-slate-700"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${
                          isBalancedDraw ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                    <div className="flex flex-col items-end pl-4">
                      <label className="text-sm font-bold tracking-wider text-emerald-400 block text-right">
                        Torneo Equilibrato
                      </label>
                      <span className="text-[10px] text-slate-400 text-right leading-tight mt-0.5">Associa giocatori forti a giocatori deboli</span>
                    </div>
                  </div>

                  <div className="w-full h-px bg-slate-700/50 my-4"></div>

                  <div className="flex items-center justify-between w-full">
                    <button
                      type="button"
                      onClick={() => setPenalizeRepeatedPairs(!penalizeRepeatedPairs)}
                      className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 ease-in-out relative flex items-center shadow-inner shrink-0 ${
                        penalizeRepeatedPairs ? "bg-amber-500" : "bg-slate-700"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${
                          penalizeRepeatedPairs ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                    <div className="flex flex-col items-end pl-4">
                      <label className="text-sm font-bold tracking-wider text-amber-400 block text-right">
                        Evita coppie ripetute
                      </label>
                      <span className="text-[10px] text-slate-400 text-right leading-tight mt-0.5">Penalizza coppie già formate in passato</span>
                    </div>
                  </div>

                  <div className="w-full h-px bg-slate-700/50 my-4"></div>

                  <div className="flex items-center justify-between w-full opacity-50 grayscale cursor-not-allowed">
                    <button
                      type="button"
                      disabled
                      className="w-12 h-7 rounded-full p-1 bg-slate-700 relative flex items-center shadow-inner shrink-0 cursor-not-allowed"
                    >
                      <div className="w-5 h-5 bg-white rounded-full shadow-md transform translate-x-0" />
                    </button>
                    <div className="flex flex-col items-end pl-4">
                      <label className="text-sm font-bold tracking-wider text-slate-400 block text-right">
                        Inversione Ruoli
                      </label>
                      <span className="text-[10px] text-slate-500 text-right leading-tight mt-0.5">I giocatori mantengono il ruolo</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>"""

new_toggles = """          <div className="flex flex-col justify-center">
            <div className={clsx("bg-slate-800/40 border border-slate-700/80 rounded-2xl p-6 flex flex-col justify-center h-full gap-6 shadow-inner transition-all duration-300", type === "coppie_fisse" ? "opacity-0 pointer-events-none" : "opacity-100")}>
              {type !== "coppie_fisse" && (
                <div className="w-full flex flex-col">
                  <div className="flex items-center justify-start gap-4 w-full cursor-pointer" onClick={() => setIsBalancedDraw(!isBalancedDraw)}>
                    <button
                      type="button"
                      className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 ease-in-out relative flex items-center shadow-inner shrink-0 ${
                        isBalancedDraw ? "bg-emerald-500" : "bg-slate-700"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${
                          isBalancedDraw ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                    <div className="flex flex-col items-start">
                      <label className="text-sm font-bold tracking-wider text-emerald-400 block text-left cursor-pointer">
                        Torneo Equilibrato
                      </label>
                      <span className="text-[10px] text-slate-400 text-left leading-tight mt-0.5 cursor-pointer">Associa giocatori forti a giocatori deboli</span>
                    </div>
                  </div>

                  <div className="w-full h-px bg-slate-700/50 my-4"></div>

                  <div className="flex items-center justify-start gap-4 w-full cursor-pointer" onClick={() => setPenalizeRepeatedPairs(!penalizeRepeatedPairs)}>
                    <button
                      type="button"
                      className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 ease-in-out relative flex items-center shadow-inner shrink-0 ${
                        penalizeRepeatedPairs ? "bg-amber-500" : "bg-slate-700"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${
                          penalizeRepeatedPairs ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                    <div className="flex flex-col items-start">
                      <label className="text-sm font-bold tracking-wider text-amber-400 block text-left cursor-pointer">
                        Evita coppie ripetute
                      </label>
                      <span className="text-[10px] text-slate-400 text-left leading-tight mt-0.5 cursor-pointer">Penalizza coppie già formate in passato</span>
                    </div>
                  </div>

                  <div className="w-full h-px bg-slate-700/50 my-4"></div>

                  <div className="flex items-center justify-start gap-4 w-full opacity-50 grayscale cursor-not-allowed">
                    <button
                      type="button"
                      disabled
                      className="w-12 h-7 rounded-full p-1 bg-slate-700 relative flex items-center shadow-inner shrink-0 cursor-not-allowed"
                    >
                      <div className="w-5 h-5 bg-white rounded-full shadow-md transform translate-x-0" />
                    </button>
                    <div className="flex flex-col items-start">
                      <label className="text-sm font-bold tracking-wider text-slate-400 block text-left cursor-not-allowed">
                        Inversione Ruoli
                      </label>
                      <span className="text-[10px] text-slate-500 text-left leading-tight mt-0.5 cursor-not-allowed">I giocatori mantengono il ruolo</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>"""

content = content.replace(old_toggles, new_toggles)

with open('src/components/TournamentForm.tsx', 'w') as f:
    f.write(content)
