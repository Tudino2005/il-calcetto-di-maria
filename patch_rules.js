const fs = require('fs');
let code = fs.readFileSync('src/components/SlotMachineDraw.tsx', 'utf8');

const oldRules1 = `<p className="text-2xl font-bold mb-16 italic text-slate-300">Eliminazione diretta pura e spietata: un errore e il team è fuori.</p>`;
const newRules1 = `<p className="text-2xl font-bold mb-16 italic text-slate-300">
                   {tournament.format === 'gironi_eliminazione' ? 'Fase a gironi seguita da eliminazione diretta.' : 
                    tournament.format === 'doppia_eliminazione' ? 'Tabellone a doppia eliminazione (Winners & Losers bracket).' : 
                    'Eliminazione diretta pura e spietata: un errore e il team è fuori.'}
                 </p>`;

const oldRules2 = `<h3 className="text-3xl font-black text-yellow-400 mb-6">1. Formato del Match</h3>
                       <p className="text-2xl text-slate-100 leading-relaxed">Il torneo si disputa con la formula dell'eliminazione diretta. Ogni partita si gioca al meglio dei 3 set (vince chi se ne aggiudica 2). Vince il singolo set la squadra che per prima raggiunge i 6 gol. È obbligatorio uno scarto di due reti per la vittoria: in caso di parità sul 6-6, si andrà ai vantaggi ad oltranza finché una delle due squadre non otterrà un doppio vantaggio consecutivo (es. 7-5, 8-6, 12-10).</p>`;

const newRules2 = `<h3 className="text-3xl font-black text-yellow-400 mb-6">1. Formato del Match</h3>
                       <p className="text-2xl text-slate-100 leading-relaxed">
                         {tournament.format === 'gironi_eliminazione' ? "Il torneo inizia con una fase a gironi all'italiana. Le migliori squadre accederanno alla fase ad eliminazione diretta." :
                          tournament.format === 'doppia_eliminazione' ? "Il torneo prevede un tabellone principale (Winners) e uno di ripescaggio (Losers). Una sconfitta non ti elimina definitivamente!" :
                          "Il torneo si disputa con la formula dell'eliminazione diretta."} 
                         Ogni partita si gioca al meglio dei 3 set (vince chi se ne aggiudica 2). Vince il singolo set la squadra che per prima raggiunge i {tournament.targetGoals || 6} gol. È obbligatorio uno scarto di due reti per la vittoria: in caso di parità, si andrà ai vantaggi ad oltranza finché una squadra non otterrà un doppio vantaggio consecutivo.
                       </p>`;

code = code.replace(oldRules1, newRules1);
code = code.replace(oldRules2, newRules2);
fs.writeFileSync('src/components/SlotMachineDraw.tsx', code);
