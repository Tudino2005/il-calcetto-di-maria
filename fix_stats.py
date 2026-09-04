import re

with open("src/app/players/page.tsx", "r") as f:
    content = f.read()

old_code = """<h2 className="text-xl font-bold text-white mb-6">Giocatori Registrati ({players.length})</h2>"""

new_code = """<div className="flex flex-col mb-6">
            <h2 className="text-xl font-bold text-white">Giocatori Registrati ({players.length})</h2>
            <div className="flex gap-3 mt-3">
              <div className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-center">
                <div className="text-xs text-slate-500 font-bold uppercase">Attaccanti</div>
                <div className="text-lg font-black text-white">{players.filter(p => p.preferredRole === 'attaccante').length}</div>
              </div>
              <div className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-center">
                <div className="text-xs text-slate-500 font-bold uppercase">Portieri</div>
                <div className="text-lg font-black text-white">{players.filter(p => p.preferredRole === 'portiere').length}</div>
              </div>
              <div className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-center">
                <div className="text-xs text-slate-500 font-bold uppercase">Entrambi</div>
                <div className="text-lg font-black text-white">{players.filter(p => p.preferredRole === 'entrambi').length}</div>
              </div>
            </div>
          </div>"""

content = content.replace(old_code, new_code)

with open("src/app/players/page.tsx", "w") as f:
    f.write(content)
