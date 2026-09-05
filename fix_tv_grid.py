import re

with open("src/components/TVSlideshow.tsx", "r") as f:
    content = f.read()

old_grid = """                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 flex items-center gap-4">
                    <Calendar className="w-10 h-10 text-blue-400 shrink-0" />
                    <div>
                      <div className="text-slate-500 font-bold uppercase text-xs tracking-wider">Data Inizio</div>
                      <div className="text-xl font-bold">{t.startDate ? new Date(t.startDate).toLocaleDateString('it-IT') : "Da Def."}</div>
                    </div>
                  </div>
                  
                  {t.drawDate && t.type !== 'coppie_fisse' ? (
                    <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 flex items-center gap-4">
                      <Calendar className="w-10 h-10 text-purple-400 shrink-0" />
                      <div>
                        <div className="text-slate-500 font-bold uppercase text-xs tracking-wider">Data Sorteggio</div>
                        <div className="text-xl font-bold">{new Date(t.drawDate).toLocaleDateString('it-IT')}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 flex items-center gap-4">
                      <Banknote className="w-10 h-10 text-emerald-400 shrink-0" />
                      <div>
                        <div className="text-slate-500 font-bold uppercase text-xs tracking-wider">Costo</div>
                        <div className="text-xl font-bold">{t.pricePerPlayer || "Gratis"} €</div>
                      </div>
                    </div>
                  )}
                </div>"""

new_grid = """                <div className={`grid gap-6 mb-8 ${t.drawDate && t.type !== 'coppie_fisse' ? 'grid-cols-3' : 'grid-cols-2'}`}>
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

content = content.replace(old_grid, new_grid)

with open("src/components/TVSlideshow.tsx", "w") as f:
    f.write(content)
