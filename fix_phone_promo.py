import re

with open("src/app/tournaments/[id]/promo/page.tsx", "r") as f:
    content = f.read()

old_grid = """        <div className="flex flex-wrap justify-center gap-6 mb-12 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          {tournament.startDate && (
            <div className="flex items-center gap-3 bg-slate-900/80 p-4 rounded-2xl border border-slate-700/50">
              <Calendar className="w-6 h-6 text-blue-400" />
              <span className="font-bold text-white">{new Date(tournament.startDate).toLocaleDateString('it-IT')} alle ore {new Date(tournament.startDate).toLocaleTimeString('it-IT', {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
          )}
          <div className="flex items-center gap-3 bg-slate-900/80 p-4 rounded-2xl border border-slate-700/50">
            <Banknote className="w-6 h-6 text-emerald-400" />
            <span className="font-bold text-white">{tournament.pricePerPlayer || "Gratis"} € <span className="text-sm font-normal text-slate-400">/ giocatore</span></span>
          </div>
        </div>"""

new_grid = """        <div className="flex flex-wrap justify-center gap-6 mb-12 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          {tournament.startDate && (
            <div className="flex items-center gap-3 bg-slate-900/80 p-4 rounded-2xl border border-slate-700/50">
              <Calendar className="w-6 h-6 text-blue-400" />
              <span className="font-bold text-white">{new Date(tournament.startDate).toLocaleDateString('it-IT')} <span className="text-sm font-normal text-slate-400">Inizio</span></span>
            </div>
          )}
          
          {tournament.drawDate && tournament.type !== 'coppie_fisse' && (
            <div className="flex items-center gap-3 bg-slate-900/80 p-4 rounded-2xl border border-slate-700/50">
              <Calendar className="w-6 h-6 text-purple-400" />
              <span className="font-bold text-white">{new Date(tournament.drawDate).toLocaleDateString('it-IT')} <span className="text-sm font-normal text-slate-400">Sorteggio</span></span>
            </div>
          )}

          <div className="flex items-center gap-3 bg-slate-900/80 p-4 rounded-2xl border border-slate-700/50">
            <Banknote className="w-6 h-6 text-emerald-400" />
            <span className="font-bold text-white">{tournament.pricePerPlayer || "Gratis"} € <span className="text-sm font-normal text-slate-400">/ giocatore</span></span>
          </div>
        </div>"""

content = content.replace(old_grid, new_grid)

with open("src/app/tournaments/[id]/promo/page.tsx", "w") as f:
    f.write(content)
