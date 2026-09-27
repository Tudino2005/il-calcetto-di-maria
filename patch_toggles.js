const fs = require('fs');
let code = fs.readFileSync('src/components/TournamentForm.tsx', 'utf8');

const oldBlock = `
              {type !== "coppie_fisse" && (
                <div className="flex flex-col items-center text-center max-w-[250px] mb-6 border-b border-slate-700/50 pb-6 w-full">
                  <div className="flex items-center justify-between w-full">
                    <button
                      type="button"
                      onClick={() => setIsBalancedDraw(!isBalancedDraw)}
                      className={\`w-16 h-9 rounded-full p-1 transition-colors duration-300 ease-in-out relative flex items-center shadow-inner \${
                        isBalancedDraw ? "bg-emerald-500" : "bg-slate-700"
                      }\`}
                    >
                      <div
                        className={\`w-7 h-7 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out \${
                          isBalancedDraw ? "translate-x-7" : "translate-x-0"
                        }\`}
                      />
                    </button>
                    <div className="flex flex-col items-end">
                      <label className="text-lg font-black tracking-wider text-emerald-400 block">
                        Crea torneo equilibrato
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between w-full mt-4 pt-4 border-t border-slate-700/50">
                      <button
                        type="button"
                        onClick={() => setAvoidRepeatedPairs(!avoidRepeatedPairs)}
                        className={\`w-12 h-7 rounded-full p-1 transition-colors duration-300 ease-in-out relative flex items-center shadow-inner \${
                          avoidRepeatedPairs ? "bg-amber-500" : "bg-slate-700"
                        }\`}
                      >
                        <div
                          className={\`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out \${
                            avoidRepeatedPairs ? "translate-x-5" : "translate-x-0"
                          }\`}
                        />
                      </button>
                      <div className="flex flex-col items-end">
                        <label className="text-sm font-bold tracking-wider text-amber-400 block">
                          Evita coppie ripetute
                        </label>
                        <span className="text-[10px] text-slate-400 max-w-[120px] text-right leading-tight">Penalizza coppie già formate in passato</span>
                      </div>
                    </div>
                </div>
              )}

              <div className="flex flex-col items-center text-center max-w-[250px]">
                <label className="text-xs font-black uppercase tracking-wider text-emerald-400 block mb-4">
                  Inversione Ruoli
                </label>
                <div className="flex flex-col items-center gap-3 w-full">
                  <button
                    type="button"
                    onClick={() => setAllowRoleSwaps(!allowRoleSwaps)}
                    className={clsx(
                      "w-16 h-9 rounded-full p-1 transition-colors duration-300 ease-in-out relative flex items-center shadow-inner",
                      allowRoleSwaps ? "bg-emerald-500" : "bg-slate-700"
                    )}
                  >
                    <div
                      className={clsx(
                        "w-7 h-7 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out",
                        allowRoleSwaps ? "translate-x-7" : "translate-x-0"
                      )}
                    />
                  </button>
                  <span className={clsx("text-sm font-bold", allowRoleSwaps ? "text-emerald-400" : "text-slate-400")}>
                    {allowRoleSwaps ? "SÌ, CONSENTITA" : "NO, BLOCCATA"}
                  </span>
                  <span className="text-xs text-slate-500 leading-tight">
                    {allowRoleSwaps 
                      ? "I giocatori potranno scambiarsi i ruoli durante il torneo."
                      : "I giocatori dovranno mantenere il loro ruolo originario."}
                  </span>
                </div>
              </div>
`;

const newBlock = `
              {type !== "coppie_fisse" && (
                <>
                  <div className="flex items-center justify-between w-full w-max-[250px]">
                    <button
                      type="button"
                      onClick={() => setIsBalancedDraw(!isBalancedDraw)}
                      className={\`w-12 h-7 rounded-full p-1 transition-colors duration-300 ease-in-out relative flex items-center shadow-inner shrink-0 \${
                        isBalancedDraw ? "bg-emerald-500" : "bg-slate-700"
                      }\`}
                    >
                      <div
                        className={\`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out \${
                          isBalancedDraw ? "translate-x-5" : "translate-x-0"
                        }\`}
                      />
                    </button>
                    <div className="flex flex-col items-end pl-4">
                      <label className="text-sm font-bold tracking-wider text-emerald-400 block text-right">
                        Torneo Equilibrato
                      </label>
                      <span className="text-[10px] text-slate-400 text-right leading-tight mt-0.5">Associa giocatori forti a giocatori deboli</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between w-full mt-4 pt-4 border-t border-slate-700/50">
                    <button
                      type="button"
                      onClick={() => setAvoidRepeatedPairs(!avoidRepeatedPairs)}
                      className={\`w-12 h-7 rounded-full p-1 transition-colors duration-300 ease-in-out relative flex items-center shadow-inner shrink-0 \${
                        avoidRepeatedPairs ? "bg-amber-500" : "bg-slate-700"
                      }\`}
                    >
                      <div
                        className={\`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out \${
                          avoidRepeatedPairs ? "translate-x-5" : "translate-x-0"
                        }\`}
                      />
                    </button>
                    <div className="flex flex-col items-end pl-4">
                      <label className="text-sm font-bold tracking-wider text-amber-400 block text-right">
                        Evita coppie ripetute
                      </label>
                      <span className="text-[10px] text-slate-400 text-right leading-tight mt-0.5">Penalizza coppie già formate in passato</span>
                    </div>
                  </div>
                </>
              )}

              <div className="flex items-center justify-between w-full mt-4 pt-4 border-t border-slate-700/50 w-max-[250px]">
                <button
                  type="button"
                  onClick={() => setAllowRoleSwaps(!allowRoleSwaps)}
                  className={clsx(
                    "w-12 h-7 rounded-full p-1 transition-colors duration-300 ease-in-out relative flex items-center shadow-inner shrink-0",
                    allowRoleSwaps ? "bg-blue-500" : "bg-slate-700"
                  )}
                >
                  <div
                    className={clsx(
                      "w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out",
                      allowRoleSwaps ? "translate-x-5" : "translate-x-0"
                    )}
                  />
                </button>
                <div className="flex flex-col items-end pl-4">
                  <label className={clsx("text-sm font-bold tracking-wider block text-right", allowRoleSwaps ? "text-blue-400" : "text-slate-400")}>
                    Inversione Ruoli
                  </label>
                  <span className="text-[10px] text-slate-400 text-right leading-tight mt-0.5">
                    {allowRoleSwaps 
                      ? "Ruoli interscambiabili in partita"
                      : "I giocatori mantengono il ruolo"}
                  </span>
                </div>
              </div>
`;

code = code.replace(oldBlock.trim(), newBlock.trim());

fs.writeFileSync('src/components/TournamentForm.tsx', code);
