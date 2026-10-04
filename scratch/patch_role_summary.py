with open('src/app/players/page.tsx', 'r') as f:
    content = f.read()

old_summary = """            <div className="flex gap-3 mt-3">
              <div className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-center">
                <div className="text-xs text-slate-500 font-bold uppercase flex justify-center mb-1"><RoleIcon role="attaccante" className="w-6 h-6" /></div>
                <div className="text-lg font-black text-white">{players.filter(p => p.preferredRole === 'attaccante').length}</div>
              </div>
              <div className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-center">
                <div className="text-xs text-slate-500 font-bold uppercase flex justify-center mb-1"><RoleIcon role="portiere" className="w-6 h-6" /></div>
                <div className="text-lg font-black text-white">{players.filter(p => p.preferredRole === 'portiere').length}</div>
              </div>
              <div className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-center">
                <div className="text-xs text-slate-500 font-bold uppercase flex justify-center mb-1"><RoleIcon role="entrambi" className="w-6 h-6" /></div>
                <div className="text-lg font-black text-white">{players.filter(p => p.preferredRole === 'entrambi').length}</div>
              </div>
            </div>"""

new_summary = """            <div className="flex flex-wrap items-center gap-6 mt-4 mb-2">
              <div className="flex items-center gap-2">
                <RoleIcon role="attaccante" className="w-5 h-5 opacity-90" />
                <span className="text-slate-400 font-bold text-sm tracking-wide">Attaccanti</span>
                <span className="text-white font-black text-base">{players.filter(p => p.preferredRole === 'attaccante').length}</span>
              </div>
              <div className="flex items-center gap-2">
                <RoleIcon role="portiere" className="w-5 h-5 opacity-90" />
                <span className="text-slate-400 font-bold text-sm tracking-wide">Difensori</span>
                <span className="text-white font-black text-base">{players.filter(p => p.preferredRole === 'portiere').length}</span>
              </div>
              <div className="flex items-center gap-2">
                <RoleIcon role="entrambi" className="w-5 h-5 opacity-90" />
                <span className="text-slate-400 font-bold text-sm tracking-wide">Entrambi</span>
                <span className="text-white font-black text-base">{players.filter(p => p.preferredRole === 'entrambi').length}</span>
              </div>
            </div>"""

content = content.replace(old_summary, new_summary)

with open('src/app/players/page.tsx', 'w') as f:
    f.write(content)
