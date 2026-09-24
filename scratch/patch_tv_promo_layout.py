import re

with open('src/components/TVSlideshow.tsx', 'r') as f:
    content = f.read()

start_marker = '{currentSlide.type === "promo" && (() => {'
end_marker = '          );})()}'
end_idx_base = content.find(end_marker)
if end_idx_base != -1:
    end_idx = end_idx_base + len(end_marker)
    start_idx = content.find(start_marker)
    
    old_block = content[start_idx:end_idx]
    
    new_block = """{currentSlide.type === "promo" && (() => {
            const t = currentSlide.tournament;
            const registrations = t.registrations || [];
            const maxPlayers = (t.maxTeams || 8) * 2;
            const iscritti = registrations.length;
            
            let missingText = "";
            if (t.type === "sorteggio_ruoli") {
              const reqPerRole = maxPlayers / 2;
              let attCount = 0;
              let porCount = 0;
              let entCount = 0;
              
              registrations.forEach((r: any) => {
                if(r.player?.preferredRole === "attaccante") attCount++;
                else if(r.player?.preferredRole === "portiere") porCount++;
                else entCount++;
              });
              
              // Simplistic calculation:
              const missingAtt = reqPerRole - attCount - Math.floor(entCount / 2);
              const missingPor = reqPerRole - porCount - Math.ceil(entCount / 2);
              
              if (iscritti >= maxPlayers) {
                missingText = "Limite Iscritti Raggiunto! (Riserve in attesa)";
              } else {
                missingText = `Mancano: ${Math.max(0, missingAtt)} Attaccanti, ${Math.max(0, missingPor)} Difensori`;
              }
            } else {
              if (iscritti >= maxPlayers) {
                missingText = "Limite Iscritti Raggiunto! (Riserve in attesa)";
              } else {
                missingText = `Mancano: ${maxPlayers - iscritti} Giocatori`;
              }
            }

            const formatTitle = t.format === "eliminazione_diretta" ? "Eliminazione Diretta" : t.format === "doppia_eliminazione" ? "Doppia Eliminazione" : "Gironi + Eliminazione";
            const formatDesc = t.format === "eliminazione_diretta" 
              ? "Tabellone classico a scontro diretto. Nessun appello: chi vince passa al turno successivo, chi perde viene eliminato definitivamente." 
              : t.format === "doppia_eliminazione" 
              ? "Ogni squadra ha due vite! Chi perde la prima volta finisce nel 'Losers Bracket' e può ancora sperare di arrivare in finale vincendo le partite di recupero." 
              : "Ogni squadra affronterà tutte le altre del proprio girone. Solo le prime classificate accederanno alle fasi finali a eliminazione diretta.";
            
            const typeTitle = t.type === "sorteggio_ruoli" ? "Sorteggio per Ruoli" : t.type === "sorteggio_integrale" ? "Sorteggio Integrale" : "Coppie Fisse";
            const typeDesc = t.type === "sorteggio_ruoli" 
              ? "L'algoritmo formerà le coppie in modo bilanciato, accoppiando obbligatoriamente un Attaccante con un Difensore. (Chi sceglie 'Entrambi' farà da jolly)." 
              : t.type === "sorteggio_integrale" 
              ? "Sorteggio totalmente cieco. La fortuna decide chi sarà il tuo compagno, indipendentemente dal ruolo preferito." 
              : "Le coppie sono già decise. Ci si iscrive insieme al proprio compagno storico per sfidare le altre coppie.";

            return (
            <div className="flex w-full h-[85vh] gap-12 text-left items-start mt-8">
              
              {/* LEFT COLUMN - INFO */}
              <div className="flex-1 flex flex-col bg-slate-900/80 p-10 rounded-[3rem] border border-slate-700 shadow-2xl">
                
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  {iscritti < maxPlayers ? (
                    <div className="inline-flex items-center gap-3 px-6 py-2 bg-purple-500/20 text-purple-400 rounded-full font-bold uppercase tracking-widest border border-purple-500/30 animate-pulse">
                      Iscrizioni Aperte
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-3 px-6 py-2 bg-red-500/20 text-red-400 rounded-full font-bold uppercase tracking-widest border border-red-500/30">
                      Iscrizioni Chiuse (In Attesa)
                    </div>
                  )}
                  <div className="inline-flex items-center gap-2 px-6 py-2 bg-slate-800 text-slate-300 rounded-full font-bold uppercase tracking-widest border border-slate-700">
                    {missingText}
                  </div>
                </div>
                
                <h2 className="text-5xl font-black uppercase tracking-tight text-white mb-6 line-clamp-2">
                  {t.name}
                </h2>
                
                {t.type !== 'coppie_fisse' && (
                  <div className="w-[70%] bg-gradient-to-r from-purple-600 to-fuchsia-600 p-6 rounded-3xl shadow-[0_0_40px_rgba(147,51,234,0.4)] mb-8 border border-purple-400 flex items-center justify-between animate-pulse-slow shrink-0">
                    <div className="flex items-center gap-4">
                      <div className="bg-white/20 p-4 rounded-2xl">
                        <Calendar className="w-10 h-10 text-white" />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-purple-100 font-bold uppercase tracking-widest text-xs">Evento Dal Vivo</span>
                        <span className="text-2xl font-black text-white uppercase leading-tight">Cerimonia Sorteggio<br/>Coppie e Calendario</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      {t.drawDate ? (
                        <>
                          <div className="text-2xl font-black text-white">{new Date(t.drawDate).toLocaleDateString('it-IT')}</div>
                          <div className="text-sm font-bold text-purple-200">alle {new Date(t.drawDate).toLocaleTimeString('it-IT', {hour: '2-digit', minute:'2-digit'})}</div>
                        </>
                      ) : (
                        <div className="text-2xl font-black text-white">DA DEFINIRE</div>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="flex gap-6 mb-8 w-[70%]">
                  <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 flex items-center gap-4 flex-1">
                    <Calendar className="w-10 h-10 text-blue-400 shrink-0" />
                    <div>
                      <div className="text-slate-500 font-bold uppercase text-xs tracking-wider">Inizio Torneo</div>
                      <div className="text-xl font-bold whitespace-nowrap">{t.startDate ? new Date(t.startDate).toLocaleDateString('it-IT') : "Da Def."}</div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 flex items-center gap-4 flex-1">
                    <Banknote className="w-10 h-10 text-emerald-400 shrink-0" />
                    <div>
                      <div className="text-slate-500 font-bold uppercase text-xs tracking-wider">Costo a persona</div>
                      <div className="text-xl font-bold">{t.pricePerPlayer ? `${t.pricePerPlayer} €` : "Gratis"}</div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="bg-slate-950/50 p-6 rounded-3xl border border-slate-800 relative overflow-hidden group flex items-center gap-8">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                      <Trophy className="w-32 h-32 text-yellow-500" />
                    </div>
                    <div className="w-1/3 shrink-0 relative z-10">
                      <div className="flex items-center gap-3 mb-2">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        <span className="text-yellow-500 font-bold uppercase text-xs tracking-widest">Regolamento del Torneo</span>
                      </div>
                      <div className="text-2xl font-black text-white">{formatTitle}</div>
                    </div>
                    <div className="flex-1 relative z-10 border-l border-slate-700/50 pl-8">
                      <p className="text-slate-400 font-medium text-lg leading-snug">{formatDesc}</p>
                    </div>
                  </div>
                  
                  <div className="bg-slate-950/50 p-6 rounded-3xl border border-slate-800 relative overflow-hidden group flex items-center gap-8">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                      <Users className="w-32 h-32 text-blue-500" />
                    </div>
                    <div className="w-1/3 shrink-0 relative z-10">
                      <div className="flex items-center gap-3 mb-2">
                        <Users className="w-5 h-5 text-blue-500" />
                        <span className="text-blue-500 font-bold uppercase text-xs tracking-widest">Formazione Squadre</span>
                      </div>
                      <div className="text-2xl font-black text-white">{typeTitle}</div>
                    </div>
                    <div className="flex-1 relative z-10 border-l border-slate-700/50 pl-8">
                      <p className="text-slate-400 font-medium text-lg leading-snug">{typeDesc}</p>
                    </div>
                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN - QR ONLY */}
              <div className="w-[500px] shrink-0 flex flex-col justify-center h-full">
                
                {iscritti < maxPlayers && (
                  <div className="bg-slate-900/80 p-12 rounded-[3rem] border border-slate-700 shadow-2xl flex flex-col items-center">
                     <QRCodeDisplay tournamentId={t.id} />
                  </div>
                )}
                
              </div>
            </div>
          );})()}"""

    content = content.replace(old_block, new_block)
    with open('src/components/TVSlideshow.tsx', 'w') as f:
        f.write(content)
    print("Patched Promo Slide!")
else:
    print("Could not find start/end markers")
