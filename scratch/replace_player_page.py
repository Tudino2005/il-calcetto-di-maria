import re

with open('src/app/players/[id]/page.tsx', 'r') as f:
    content = f.read()

# 1. We replace the header box.
header_start = '<div className="bg-slate-800 rounded-3xl p-8 mb-8 border border-slate-700 shadow-xl">'
header_end_marker = '      {/* SPECIALIZZAZIONE PER RUOLO & INDICI DI RENDIMENTO */}'

if header_start in content and header_end_marker in content:
    idx_start = content.find(header_start)
    idx_end = content.find(header_end_marker)
    
    new_header = """<div className="bg-slate-800 rounded-3xl p-6 lg:p-8 mb-8 border border-slate-700 shadow-xl flex flex-col xl:flex-row gap-8 xl:items-center justify-between">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-4xl lg:text-5xl font-black text-white leading-none">{player.name}</h2>
            {myRank && (
              <span className="text-3xl lg:text-4xl font-black text-purple-400">{myRank}°</span>
            )}
          </div>
          <div className="flex items-center gap-4 mt-2">
            <span className="px-4 py-2 bg-slate-900 text-slate-300 rounded-lg text-sm uppercase tracking-wider font-bold border border-slate-700">
              {player.preferredRole}
            </span>
            <form action={handleDelete}>
              <DeleteButton />
            </form>
          </div>
        </div>

        {/* 4 Compact Stat Boxes */}
        <div className="flex flex-wrap lg:flex-nowrap gap-4 w-full xl:w-auto">
          {/* GK Stats */}
          <div className="bg-slate-900/50 border border-blue-500/30 rounded-2xl p-4 flex-1 min-w-[140px] shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-blue-500/20 text-blue-400 rounded-lg flex items-center justify-center text-sm">🛡️</div>
              <div className="text-[10px] uppercase font-black tracking-wider text-blue-400 leading-tight">In Porta</div>
            </div>
            <div className="text-2xl font-black text-white mb-2 leading-none flex items-baseline gap-1">
              {roleStats.defensiveIndex !== null ? roleStats.defensiveIndex : "-"} 
              <span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">Gol Sub.</span>
            </div>
            <div className="flex justify-between items-center text-xs font-bold border-t border-slate-700/50 pt-2.5 mt-1">
              <span className="text-slate-400">{roleStats.gkMatches} G</span>
              <span className="text-yellow-500">{roleStats.gkWinRate ? `${roleStats.gkWinRate}%` : "-"}</span>
            </div>
          </div>

          {/* Striker Stats */}
          <div className="bg-slate-900/50 border border-red-500/30 rounded-2xl p-4 flex-1 min-w-[140px] shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-red-500/20 text-red-400 rounded-lg flex items-center justify-center text-sm">⚔️</div>
              <div className="text-[10px] uppercase font-black tracking-wider text-red-400 leading-tight">In Attacco</div>
            </div>
            <div className="text-2xl font-black text-white mb-2 leading-none flex items-baseline gap-1">
              {roleStats.offensiveIndex !== null ? roleStats.offensiveIndex : "-"} 
              <span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">Gol Fatti</span>
            </div>
            <div className="flex justify-between items-center text-xs font-bold border-t border-slate-700/50 pt-2.5 mt-1">
              <span className="text-slate-400">{roleStats.stMatches} G</span>
              <span className="text-yellow-500">{roleStats.stWinRate ? `${roleStats.stWinRate}%` : "-"}</span>
            </div>
          </div>

          {/* Ideal Partner */}
          <div className="bg-slate-900/50 border border-purple-500/30 rounded-2xl p-4 flex-1 min-w-[140px] shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-purple-500/20 text-purple-400 rounded-lg flex items-center justify-center"><Sparkles className="w-4 h-4" /></div>
              <div className="text-[10px] uppercase font-black tracking-wider text-purple-400 leading-tight">Partner</div>
            </div>
            <div className="text-xl font-black text-white mb-2 leading-none truncate">
              {suggestedPartner ? suggestedPartner.partner.name : "-"}
            </div>
            <div className="flex justify-between items-center text-[11px] font-bold border-t border-slate-700/50 pt-2.5 mt-2">
              <span className="text-slate-400">{suggestedPartner ? `${suggestedPartner.played} G` : "-"}</span>
              <span className="text-emerald-400">{suggestedPartner ? `${suggestedPartner.winRate}% V` : "-"}</span>
            </div>
          </div>

          {/* Total Stats */}
          <div className="bg-slate-900/50 border border-emerald-500/30 rounded-2xl p-4 flex-1 min-w-[140px] shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-emerald-500/20 text-emerald-400 rounded-lg flex items-center justify-center"><Trophy className="w-4 h-4" /></div>
              <div className="text-[10px] uppercase font-black tracking-wider text-emerald-400 leading-tight">Totale</div>
            </div>
            <div className="text-3xl font-black text-white mb-1.5 leading-none flex items-baseline gap-1">
              {totalPlayed}
              <span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">Partite</span>
            </div>
            <div className="flex justify-between items-center text-xs font-bold border-t border-slate-700/50 pt-2 mt-1">
              <span className="text-emerald-400">{totalWins} Vinte</span>
              <span className="text-yellow-500">{winRate}%</span>
            </div>
          </div>
        </div>
      </div>

"""
    content = content[:idx_start] + new_header + content[idx_end:]


# 2. Delete the SPECIALIZZAZIONE and PARTNER sections.
# We remove everything between {/* SPECIALIZZAZIONE PER RUOLO & INDICI DI RENDIMENTO */} and {/* RIEPILOGO PER COMPAGNO */}
section_start = '{/* SPECIALIZZAZIONE PER RUOLO & INDICI DI RENDIMENTO */}'
section_end = '{/* RIEPILOGO PER COMPAGNO */}'

if section_start in content and section_end in content:
    idx_start = content.find(section_start)
    idx_end = content.find(section_end)
    content = content[:idx_start] + content[idx_end:]


# 3. Change the grid cols for Storico Partite to reduce width.
old_grid = '<div className="grid grid-cols-1 xl:grid-cols-2 gap-4">'
new_grid = '<div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">'
content = content.replace(old_grid, new_grid)

with open('src/app/players/[id]/page.tsx', 'w') as f:
    f.write(content)

print("Replaced!")
