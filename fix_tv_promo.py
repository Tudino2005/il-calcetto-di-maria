import re

with open("src/components/TVSlideshow.tsx", "r") as f:
    content = f.read()

# Replace the promo slide entirely
old_promo = r'\{\/\* PROMO SLIDE \*\/\}.*?\{currentSlide\.type === "live_bracket" && \('

new_promo = """{/* PROMO SLIDE */}
          {currentSlide.type === "promo" && (() => {
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
                if(r.preferredRole === "attaccante") attCount++;
                else if(r.preferredRole === "portiere") porCount++;
                else entCount++;
              });
              
              // Simplistic calculation:
              const missingAtt = Math.max(0, reqPerRole - attCount - Math.floor(entCount / 2));
              const missingPor = Math.max(0, reqPerRole - porCount - Math.ceil(entCount / 2));
              
              missingText = `Mancano: ${missingAtt} Attaccanti, ${missingPor} Portieri`;
            } else {
              missingText = `Mancano: ${maxPlayers - iscritti} Giocatori`;
            }

            const formatTitle = t.format === "eliminazione_diretta" ? "Eliminazione Diretta" : t.format === "doppia_eliminazione" ? "Doppia Eliminazione" : "Gironi + Eliminazione";
            const formatDesc = t.format === "eliminazione_diretta" ? "Tabellone classico. Chi perde è fuori." : t.format === "doppia_eliminazione" ? "Tabellone Winners e Losers Bracket." : "Fase a gruppi seguita da playoff.";
            
            const typeTitle = t.type === "sorteggio_ruoli" ? "Sorteggio per Ruoli" : t.type === "sorteggio_integrale" ? "Sorteggio Integrale" : "Coppie Fisse";
            const typeDesc = t.type === "sorteggio_ruoli" ? "Un attaccante + un portiere." : t.type === "sorteggio_integrale" ? "Composizione puramente casuale." : "Squadre già formate a priori.";

            return (
            <div className="flex w-full h-[85vh] gap-12 text-left items-start mt-8">
              
              {/* LEFT COLUMN - INFO */}
              <div className="flex-1 flex flex-col h-full bg-slate-900/80 p-10 rounded-[3rem] border border-slate-700 shadow-2xl overflow-hidden">
                <div className="inline-flex items-center gap-3 px-6 py-2 bg-purple-500/20 text-purple-400 rounded-full font-bold uppercase tracking-widest border border-purple-500/30 mb-6 w-fit animate-pulse">
                  Iscrizioni Aperte
                </div>
                
                <h2 className="text-5xl font-black uppercase tracking-tight text-white mb-8 line-clamp-2">
                  {t.name}
                </h2>
                
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 flex items-center gap-4">
                    <Calendar className="w-10 h-10 text-blue-400 shrink-0" />
                    <div>
                      <div className="text-slate-500 font-bold uppercase text-xs tracking-wider">Data Inizio</div>
                      <div className="text-xl font-bold">{t.startDate ? new Date(t.startDate).toLocaleDateString('it-IT') : "Da Def."}</div>
                    </div>
                  </div>
                  <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 flex items-center gap-4">
                    <Banknote className="w-10 h-10 text-emerald-400 shrink-0" />
                    <div>
                      <div className="text-slate-500 font-bold uppercase text-xs tracking-wider">Costo</div>
                      <div className="text-xl font-bold">{t.pricePerPlayer || "Gratis"} €</div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-6 mb-8">
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
                </div>
                
                <div className="bg-purple-900/20 border border-purple-500/30 p-6 rounded-3xl mt-auto">
                  <div className="flex justify-between items-end mb-2">
                    <div className="text-purple-300 font-bold uppercase tracking-wider">Stato Iscrizioni</div>
                    <div className="text-2xl font-black text-white">{iscritti} / {maxPlayers}</div>
                  </div>
                  <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden mb-3 border border-slate-800">
                    <div className="bg-gradient-to-r from-purple-500 to-emerald-400 h-full" style={{ width: `${(iscritti/maxPlayers)*100}%` }}></div>
                  </div>
                  <div className="text-emerald-400 font-bold text-sm text-right">{missingText}</div>
                </div>
              </div>

              {/* RIGHT COLUMN - QR AND NAMES */}
              <div className="w-[500px] shrink-0 flex flex-col gap-8 h-full">
                
                {/* QR CODE GIGANTE */}
                <div className="bg-slate-900/80 p-8 rounded-[3rem] border border-slate-700 shadow-2xl flex flex-col items-center">
                   <QRCodeDisplay tournamentId={t.id} />
                </div>
                
                {/* LISTA NOMI */}
                <div className="flex-1 bg-slate-900/80 p-8 rounded-[3rem] border border-slate-700 shadow-2xl flex flex-col overflow-hidden">
                  <h3 className="text-slate-400 font-bold uppercase tracking-widest text-center mb-6">Giocatori Iscritti</h3>
                  <div className="flex flex-wrap gap-3 overflow-hidden content-start justify-center">
                    {registrations.length === 0 ? (
                       <div className="text-slate-500 mt-10 text-center w-full">Nessun iscritto finora. Fai il primo passo!</div>
                    ) : (
                      registrations.slice(0, 48).map((r: any) => (
                        <div key={r.id} className="bg-slate-800 border border-slate-700 px-4 py-2 rounded-full text-white font-bold text-sm flex items-center gap-2 shadow-md">
                          <RoleIcon role={r.preferredRole} className="w-4 h-4" />
                          {r.playerName.split(" ")[0]}
                        </div>
                      ))
                    )}
                    {registrations.length > 48 && (
                      <div className="bg-slate-800 border border-slate-700 px-4 py-2 rounded-full text-slate-400 font-bold text-sm shadow-md">
                        + {registrations.length - 48} altri
                      </div>
                    )}
                  </div>
                </div>
                
              </div>
            </div>
          );})()}

          {/* LIVE BRACKET / MATCHES SLIDE */}
          {currentSlide.type === "live_bracket" && ("""

content = re.sub(old_promo, new_promo, content, flags=re.DOTALL)

with open("src/components/TVSlideshow.tsx", "w") as f:
    f.write(content)
