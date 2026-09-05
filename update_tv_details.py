import re

with open("src/components/TVSlideshow.tsx", "r") as f:
    content = f.read()

# Make the boxes much larger and more detailed
old_format_desc = """            const formatDesc = t.format === "eliminazione_diretta" ? "Tabellone classico. Chi perde è fuori." : t.format === "doppia_eliminazione" ? "Tabellone Winners e Losers Bracket." : "Fase a gruppi seguita da playoff.";"""

new_format_desc = """            const formatDesc = t.format === "eliminazione_diretta" 
              ? "Tabellone classico a scontro diretto. Nessun appello: chi vince passa al turno successivo, chi perde viene eliminato definitivamente dal torneo." 
              : t.format === "doppia_eliminazione" 
              ? "Ogni squadra ha due vite! Chi perde la prima volta finisce nel 'Losers Bracket' e può ancora sperare di arrivare in finale vincendo tutte le partite di recupero." 
              : "Ogni squadra affronterà tutte le altre del proprio girone. Solo le prime classificate accederanno alle fasi finali a eliminazione diretta.";"""

content = content.replace(old_format_desc, new_format_desc)

old_type_desc = """            const typeDesc = t.type === "sorteggio_ruoli" ? "Un attaccante + un portiere." : t.type === "sorteggio_integrale" ? "Composizione puramente casuale." : "Squadre già formate a priori.";"""

new_type_desc = """            const typeDesc = t.type === "sorteggio_ruoli" 
              ? "L'algoritmo formerà le coppie in modo bilanciato, accoppiando obbligatoriamente un Attaccante con un Portiere. (Chi sceglie 'Entrambi' farà da jolly)." 
              : t.type === "sorteggio_integrale" 
              ? "Sorteggio totalmente cieco. La fortuna decide chi sarà il tuo compagno, indipendentemente dal ruolo preferito." 
              : "Le coppie sono già decise. Ci si iscrive insieme al proprio compagno storico per sfidare le altre coppie.";"""

content = content.replace(old_type_desc, new_type_desc)

old_boxes = """                <div className="flex flex-col gap-6 mb-8">
                  <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800">
                    <h3 className="text-slate-400 font-bold uppercase tracking-widest text-sm flex items-center gap-2 mb-2">
                      <Trophy className="w-5 h-5 text-yellow-500" /> Formato Torneo
                    </h3>
                    <div className="text-white font-bold text-xl">{formatTitle}</div>
                    <div className="text-slate-500 text-sm mt-1">{formatDesc}</div>
                  </div>
                  
                  <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800">
                    <h3 className="text-slate-400 font-bold uppercase tracking-widest text-sm flex items-center gap-2 mb-2">
                      <Users className="w-5 h-5 text-purple-400" /> Modalità Squadre
                    </h3>
                    <div className="text-white font-bold text-xl">{typeTitle}</div>
                    <div className="text-slate-500 text-sm mt-1">{typeDesc}</div>
                  </div>
                </div>"""

new_boxes = """                <div className="flex flex-col gap-5 mb-8">
                  <div className="bg-gradient-to-r from-slate-950 to-slate-900 p-8 rounded-3xl border border-yellow-500/30 shadow-[0_0_20px_rgba(234,179,8,0.05)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                      <Trophy className="w-32 h-32 text-yellow-500" />
                    </div>
                    <h3 className="text-yellow-500 font-black uppercase tracking-widest text-sm flex items-center gap-3 mb-3">
                      <Trophy className="w-5 h-5" /> Regolamento del Torneo
                    </h3>
                    <div className="text-white font-black text-3xl mb-2">{formatTitle}</div>
                    <div className="text-slate-300 text-lg leading-relaxed relative z-10">{formatDesc}</div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-slate-950 to-slate-900 p-8 rounded-3xl border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.05)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                      <Users className="w-32 h-32 text-blue-500" />
                    </div>
                    <h3 className="text-blue-400 font-black uppercase tracking-widest text-sm flex items-center gap-3 mb-3">
                      <Users className="w-5 h-5" /> Formazione Squadre
                    </h3>
                    <div className="text-white font-black text-3xl mb-2">{typeTitle}</div>
                    <div className="text-slate-300 text-lg leading-relaxed relative z-10">{typeDesc}</div>
                  </div>
                </div>"""

content = content.replace(old_boxes, new_boxes)

# Also fix the drawDate issue. To prevent it shrinking, add a fallback if missing for visual layout?
# Actually, the grid looks fine with 2 items. The problem was just they expected to see it.

with open("src/components/TVSlideshow.tsx", "w") as f:
    f.write(content)
