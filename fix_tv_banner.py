import re

with open("src/components/TVSlideshow.tsx", "r") as f:
    content = f.read()

# 1. Add huge Draw Date banner
old_header = """                <h2 className="text-5xl font-black uppercase tracking-tight text-white mb-8 line-clamp-2">
                  {t.name}
                </h2>"""

new_header = """                <h2 className="text-5xl font-black uppercase tracking-tight text-white mb-6 line-clamp-2">
                  {t.name}
                </h2>
                
                {t.drawDate && t.type !== 'coppie_fisse' && (
                  <div className="w-full bg-gradient-to-r from-purple-600 to-fuchsia-600 p-6 rounded-3xl shadow-[0_0_40px_rgba(147,51,234,0.4)] mb-8 border border-purple-400 flex items-center justify-between animate-pulse-slow">
                    <div className="flex items-center gap-4">
                      <div className="bg-white/20 p-4 rounded-2xl">
                        <Calendar className="w-10 h-10 text-white" />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-purple-100 font-bold uppercase tracking-widest text-sm">Evento Dal Vivo</span>
                        <span className="text-3xl font-black text-white uppercase">Cerimonia Sorteggio Coppie</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-black text-white">{new Date(t.drawDate).toLocaleDateString('it-IT')}</div>
                      <div className="text-xl font-bold text-purple-200">alle {new Date(t.drawDate).toLocaleTimeString('it-IT', {hour: '2-digit', minute:'2-digit'})}</div>
                    </div>
                  </div>
                )}"""

content = content.replace(old_header, new_header)

# 2. Remove drawDate from the small grid, revert to 2 columns
old_grid = """                <div className={`grid gap-6 mb-8 ${t.drawDate && t.type !== 'coppie_fisse' ? 'grid-cols-3' : 'grid-cols-2'}`}>
                  <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 flex items-center gap-4">
                    <Calendar className="w-10 h-10 text-blue-400 shrink-0" />
                    <div>
                      <div className="text-slate-500 font-bold uppercase text-xs tracking-wider">Data Inizio</div>
                      <div className="text-xl font-bold whitespace-nowrap">{t.startDate ? new Date(t.startDate).toLocaleDateString('it-IT') : "Da Def."}</div>
                    </div>
                  </div>
                  
                  {t.drawDate && t.type !== 'coppie_fisse' && (
                    <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 flex items-center gap-4">
                      <Calendar className="w-10 h-10 text-purple-400 shrink-0" />
                      <div>
                        <div className="text-slate-500 font-bold uppercase text-xs tracking-wider">Sorteggio</div>
                        <div className="text-xl font-bold whitespace-nowrap">{new Date(t.drawDate).toLocaleDateString('it-IT')}</div>
                      </div>
                    </div>
                  )}

                  <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 flex items-center gap-4">
                    <Banknote className="w-10 h-10 text-emerald-400 shrink-0" />
                    <div>
                      <div className="text-slate-500 font-bold uppercase text-xs tracking-wider">Costo</div>
                      <div className="text-xl font-bold">{t.pricePerPlayer || "Gratis"} €</div>
                    </div>
                  </div>
                </div>"""

new_grid = """                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 flex items-center gap-4">
                    <Calendar className="w-10 h-10 text-blue-400 shrink-0" />
                    <div>
                      <div className="text-slate-500 font-bold uppercase text-xs tracking-wider">Inizio Torneo</div>
                      <div className="text-xl font-bold whitespace-nowrap">{t.startDate ? new Date(t.startDate).toLocaleDateString('it-IT') : "Da Def."}</div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 flex items-center gap-4">
                    <Banknote className="w-10 h-10 text-emerald-400 shrink-0" />
                    <div>
                      <div className="text-slate-500 font-bold uppercase text-xs tracking-wider">Costo</div>
                      <div className="text-xl font-bold">{t.pricePerPlayer || "Gratis"} €</div>
                    </div>
                  </div>
                </div>"""

content = content.replace(old_grid, new_grid)

# 3. Fix missingText math to handle over-enrollment
old_missing = """              const missingAtt = Math.max(0, reqPerRole - attCount - Math.floor(entCount / 2));
              const missingPor = Math.max(0, reqPerRole - porCount - Math.ceil(entCount / 2));
              
              missingText = `Mancano: ${missingAtt} Attaccanti, ${missingPor} Portieri`;
            } else {
              missingText = `Mancano: ${maxPlayers - iscritti} Giocatori`;
            }"""

new_missing = """              const missingAtt = reqPerRole - attCount - Math.floor(entCount / 2);
              const missingPor = reqPerRole - porCount - Math.ceil(entCount / 2);
              
              if (iscritti >= maxPlayers) {
                missingText = "Limite Iscritti Raggiunto! (Riserve in attesa)";
              } else {
                missingText = `Mancano: ${Math.max(0, missingAtt)} Attaccanti, ${Math.max(0, missingPor)} Portieri`;
              }
            } else {
              if (iscritti >= maxPlayers) {
                missingText = "Limite Iscritti Raggiunto! (Riserve in attesa)";
              } else {
                missingText = `Mancano: ${maxPlayers - iscritti} Giocatori`;
              }
            }"""

content = content.replace(old_missing, new_missing)

with open("src/components/TVSlideshow.tsx", "w") as f:
    f.write(content)
