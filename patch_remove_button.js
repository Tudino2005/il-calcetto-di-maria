const fs = require('fs');
let code = fs.readFileSync('src/components/TournamentLobby.tsx', 'utf8');

const targetStr = \`                <div className="flex justify-center transition-all duration-300">
                  <RoleIcon role={p.preferredRole} className="w-5 h-5 opacity-80" />
                </div>
                {isSelected && (
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      handleTogglePayment(p.id, registration.hasPaid); 
                    }}
                    className={clsx(
                      "mt-2 w-max px-4 mx-auto flex justify-center items-center gap-1 py-1 rounded-lg text-[10px] uppercase tracking-wider font-bold transition-all border",
                      registration.hasPaid 
                        ? "bg-emerald-900/50 border-emerald-500/30 text-emerald-400 hover:bg-emerald-800/60" 
                        : "bg-red-900/50 border-red-500/30 text-red-400 hover:bg-red-800/60"
                    )}
                  >
                    {registration.hasPaid ? 'Pagato' : 'Non Pagato'}
                  </button>
                )}
              </div>\`;

const replacementStr = \`                <div className="flex justify-center transition-all duration-300">
                  <RoleIcon role={p.preferredRole} className="w-5 h-5 opacity-80" />
                </div>
              </div>\`;

code = code.replace(targetStr, replacementStr);

// Add the state variable
code = code.replace(
  'const [showDebtorsModal, setShowDebtorsModal] = useState(false);',
  'const [showDebtorsModal, setShowDebtorsModal] = useState(false);\n  const [showPaymentsModal, setShowPaymentsModal] = useState(false);'
);

// Add the button to Cassa Torneo
const cassaTarget = \`            <div className="flex items-center justify-between mb-4">
              <div className="text-slate-400 font-bold uppercase tracking-wider text-xs flex items-center gap-2">
                <Banknote className="w-4 h-4 text-emerald-400" /> Cassa Torneo
              </div>
              <div className="text-emerald-400 font-black text-2xl">{tournament.pricePerPlayer || 0}€ <span className="text-xs text-slate-500">/cad</span></div>
            </div>\`;
            
const cassaReplacement = \`            <div className="flex items-center justify-between mb-4">
              <div className="text-slate-400 font-bold uppercase tracking-wider text-xs flex items-center gap-2">
                <Banknote className="w-4 h-4 text-emerald-400" /> Cassa Torneo
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setShowPaymentsModal(true)} 
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider shadow-lg transition-colors flex items-center gap-2 border border-emerald-400/50"
                >
                  <Banknote className="w-3 h-3" /> <span className="hidden sm:inline">Gestisci Pagamenti</span><span className="sm:hidden">Pagamenti</span>
                </button>
                <div className="text-emerald-400 font-black text-2xl">{tournament.pricePerPlayer || 0}€ <span className="text-xs text-slate-500">/cad</span></div>
              </div>
            </div>\`;
code = code.replace(cassaTarget, cassaReplacement);

// Add the Payments Modal
const paymentsModal = \`
      {/* PAYMENTS MODAL */}
      {showPaymentsModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-emerald-400 flex items-center gap-2"><Banknote className="w-5 h-5"/> Gestione Pagamenti</h3>
              <button onClick={() => setShowPaymentsModal(false)} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400"><X className="w-5 h-5"/></button>
            </div>
            
            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar flex flex-col gap-2">
              {registrations.length === 0 ? (
                <p className="text-slate-400 text-center py-8">Nessun giocatore iscritto al momento.</p>
              ) : (
                registrations.map((r: any) => {
                  const p = allPlayers.find(player => player.id === r.playerId);
                  if (!p) return null;
                  return (
                    <div key={r.playerId} className="flex items-center justify-between p-3 bg-slate-800 rounded-xl border border-slate-700">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-700">
                          {p.avatarUrl ? <img src={\`/players/\${p.avatarUrl}\`} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center font-bold text-slate-400">{p.name.charAt(0)}</div>}
                        </div>
                        <div className="font-bold text-slate-300">{p.name}</div>
                      </div>
                      <button 
                        onClick={() => handleTogglePayment(p.id, r.hasPaid)}
                        className={\`px-3 py-1.5 font-bold text-xs uppercase tracking-wider rounded-lg transition border \${r.hasPaid ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50 hover:bg-emerald-500/30" : "bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20"}\`}
                      >
                        {r.hasPaid ? 'PAGATO' : 'NON PAGATO'}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
\`;

code = code.replace('{/* DEBTORS MODAL */}', paymentsModal + '\n      {/* DEBTORS MODAL */}');

fs.writeFileSync('src/components/TournamentLobby.tsx', code);
