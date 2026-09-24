import re

with open('src/components/TVSlideshow.tsx', 'r') as f:
    content = f.read()

start_marker = '<div className="flex flex-col gap-4">'
end_marker = '              </div>\n\n              {/* RIGHT COLUMN - QR ONLY */}'

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx != -1 and end_idx != -1:
    old_block = content[start_idx:end_idx]
    
    new_block = """<div className="flex flex-col gap-3">
                  <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800 relative overflow-hidden group flex items-center gap-6">
                    <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                      <Trophy className="w-24 h-24 text-yellow-500" />
                    </div>
                    <div className="w-1/4 shrink-0 relative z-10">
                      <div className="flex items-center gap-2 mb-1">
                        <Trophy className="w-4 h-4 text-yellow-500" />
                        <span className="text-yellow-500 font-bold uppercase text-[10px] tracking-widest">Regolamento</span>
                      </div>
                      <div className="text-xl font-black text-white leading-tight">{formatTitle}</div>
                    </div>
                    <div className="flex-1 relative z-10 border-l border-slate-700/50 pl-6">
                      <p className="text-slate-400 font-medium text-sm leading-snug">{formatDesc}</p>
                    </div>
                  </div>
                  
                  <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800 relative overflow-hidden group flex items-center gap-6">
                    <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                      <Users className="w-24 h-24 text-blue-500" />
                    </div>
                    <div className="w-1/4 shrink-0 relative z-10">
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="w-4 h-4 text-blue-500" />
                        <span className="text-blue-500 font-bold uppercase text-[10px] tracking-widest">Formazione Squadre</span>
                      </div>
                      <div className="text-xl font-black text-white leading-tight">{typeTitle}</div>
                    </div>
                    <div className="flex-1 relative z-10 border-l border-slate-700/50 pl-6">
                      <p className="text-slate-400 font-medium text-sm leading-snug">{typeDesc}</p>
                    </div>
                  </div>

                  <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800 relative overflow-hidden group flex items-center gap-6">
                    <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                      <Goal className="w-24 h-24 text-emerald-500" />
                    </div>
                    <div className="w-1/4 shrink-0 relative z-10">
                      <div className="flex items-center gap-2 mb-1">
                        <Goal className="w-4 h-4 text-emerald-500" />
                        <span className="text-emerald-500 font-bold uppercase text-[10px] tracking-widest">Punteggio</span>
                      </div>
                      <div className="text-xl font-black text-white leading-tight">Condizioni di Vittoria</div>
                    </div>
                    <div className="flex-1 relative z-10 border-l border-slate-700/50 pl-6">
                      <p className="text-slate-400 font-medium text-sm leading-snug">
                        Ogni set viene vinto dalla prima squadra che raggiunge i <b>{t.targetGoals || 7} Gol</b>. Se si arriva sul <b>{(t.advantageThreshold || 5)}-{(t.advantageThreshold || 5)}</b>, si attivano i Vantaggi: per vincere servirà uno scarto di 2 gol.
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-950/50 p-4 rounded-2xl border border-red-900/30 relative overflow-hidden group flex items-center gap-6">
                    <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                      <ShieldAlert className="w-24 h-24 text-red-500" />
                    </div>
                    <div className="w-1/4 shrink-0 relative z-10">
                      <div className="flex items-center gap-2 mb-1">
                        <ShieldAlert className="w-4 h-4 text-red-500" />
                        <span className="text-red-500 font-bold uppercase text-[10px] tracking-widest">Codice D'Onore</span>
                      </div>
                      <div className="text-xl font-black text-white leading-tight">Zero Rullate</div>
                    </div>
                    <div className="flex-1 relative z-10 border-l border-slate-700/50 pl-6">
                      <p className="text-slate-400 font-medium text-sm leading-snug">La rotazione della stecca di 360 gradi, sia prima che dopo aver colpito la pallina, costituisce fallo. Se la pallina entra in rete in seguito a una rullata, il gol è nullo.</p>
                    </div>
                  </div>

                  <div className="bg-slate-950/50 p-4 rounded-2xl border border-orange-900/30 relative overflow-hidden group flex items-center gap-6">
                    <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                      <AlertTriangle className="w-24 h-24 text-orange-500" />
                    </div>
                    <div className="w-1/4 shrink-0 relative z-10">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                        <span className="text-orange-500 font-bold uppercase text-[10px] tracking-widest">Codice D'Onore</span>
                      </div>
                      <div className="text-xl font-black text-white leading-tight">Divieto di Gancio</div>
                    </div>
                    <div className="flex-1 relative z-10 border-l border-slate-700/50 pl-6">
                      <p className="text-slate-400 font-medium text-sm leading-snug">È vietato fermare o controllare la pallina per poi tirare con lo stesso omino. Vietato anche il 'passetto' (passare palla a un omino sulla stessa stecca). Gioco di prima intenzione o sponda.</p>
                    </div>
                  </div>

                </div>
"""

    content = content.replace(old_block, new_block)
    
    # Let's also tighten the upper spacings so it fits
    content = content.replace('p-10 rounded-[3rem]', 'p-8 rounded-[2rem]')
    content = content.replace('gap-12 text-left items-start mt-8', 'gap-8 text-left items-start mt-4')
    content = content.replace('mb-8 w-[70%]', 'mb-6 w-[75%]')
    content = content.replace('mb-6 line-clamp-2', 'mb-4 line-clamp-1')
    content = content.replace('h-[85vh]', 'h-[90vh]')

    with open('src/components/TVSlideshow.tsx', 'w') as f:
        f.write(content)
    print("Patched Promo Rules!")
else:
    print("Could not find start/end markers")
