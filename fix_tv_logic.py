import re

with open("src/components/TVSlideshow.tsx", "r") as f:
    content = f.read()

# 1. Hide QR code and badge if full
old_badge = """                <div className="inline-flex items-center gap-3 px-6 py-2 bg-purple-500/20 text-purple-400 rounded-full font-bold uppercase tracking-widest border border-purple-500/30 mb-6 w-fit animate-pulse">
                  Iscrizioni Aperte
                </div>"""
new_badge = """                {iscritti < maxPlayers ? (
                  <div className="inline-flex items-center gap-3 px-6 py-2 bg-purple-500/20 text-purple-400 rounded-full font-bold uppercase tracking-widest border border-purple-500/30 mb-6 w-fit animate-pulse">
                    Iscrizioni Aperte
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-3 px-6 py-2 bg-red-500/20 text-red-400 rounded-full font-bold uppercase tracking-widest border border-red-500/30 mb-6 w-fit">
                    Iscrizioni Chiuse (In Attesa)
                  </div>
                )}"""
content = content.replace(old_badge, new_badge)

old_qr = """                {/* QR CODE GIGANTE */}
                <div className="bg-slate-900/80 p-8 rounded-[3rem] border border-slate-700 shadow-2xl flex flex-col items-center">
                   <QRCodeDisplay tournamentId={t.id} />
                </div>"""
new_qr = """                {/* QR CODE GIGANTE */}
                {iscritti < maxPlayers && (
                  <div className="bg-slate-900/80 p-8 rounded-[3rem] border border-slate-700 shadow-2xl flex flex-col items-center">
                     <QRCodeDisplay tournamentId={t.id} />
                  </div>
                )}"""
content = content.replace(old_qr, new_qr)

# 2. Show draw banner even if date is missing
old_banner = """                {t.drawDate && t.type !== 'coppie_fisse' && (
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

new_banner = """                {t.type !== 'coppie_fisse' && (
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
                      {t.drawDate ? (
                        <>
                          <div className="text-4xl font-black text-white">{new Date(t.drawDate).toLocaleDateString('it-IT')}</div>
                          <div className="text-xl font-bold text-purple-200">alle {new Date(t.drawDate).toLocaleTimeString('it-IT', {hour: '2-digit', minute:'2-digit'})}</div>
                        </>
                      ) : (
                        <div className="text-3xl font-black text-white">DA DEFINIRE</div>
                      )}
                    </div>
                  </div>
                )}"""

content = content.replace(old_banner, new_banner)

with open("src/components/TVSlideshow.tsx", "w") as f:
    f.write(content)
