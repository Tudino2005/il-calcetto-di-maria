with open('src/app/players/page.tsx', 'r') as f:
    content = f.read()

# Replace the grid container
old_grid = '<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 max-h-[65vh] overflow-y-auto pr-2 custom-scrollbar">'
new_grid = '<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 max-h-[65vh] overflow-y-auto pr-2 custom-scrollbar">'
content = content.replace(old_grid, new_grid)

# Replace the player map
old_map = """            {players.length === 0 ? (
              <p className="text-slate-400 text-center py-8 col-span-full">Nessun giocatore registrato.</p>
            ) : (
              players.map((p) => (
                <Link href={`/players/${p.id}`} key={p.id} className="bg-slate-900 p-4 rounded-xl flex justify-between items-center border border-slate-700 hover:border-emerald-500 transition-colors">
                  <span className="font-bold text-lg text-white truncate mr-2">{p.name}</span>
                  <span className="bg-slate-800 p-2 rounded-lg shrink-0">
                    <RoleIcon role={p.preferredRole} className="w-7 h-7" />
                  </span>
                </Link>
              ))
            )}"""

new_map = """            {players.length === 0 ? (
              <p className="text-slate-400 text-center py-8 col-span-full">Nessun giocatore registrato.</p>
            ) : (
              players.map((p) => (
                <Link href={`/players/${p.id}`} key={p.id} className="bg-slate-900/60 p-4 rounded-2xl flex flex-col items-center justify-center border border-slate-700/50 hover:border-emerald-500 hover:bg-slate-800/80 transition-all group">
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 mb-3">
                    {p.avatarUrl ? (
                      <img src={`/players/${p.avatarUrl}`} alt={p.name} className="w-full h-full object-cover rounded-full border-2 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)] group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="w-full h-full rounded-full border-2 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)] bg-slate-800 flex items-center justify-center text-xl font-black text-emerald-400 group-hover:scale-105 transition-transform">
                        {p.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span className="font-bold text-sm text-white truncate w-full text-center mb-2">{p.name}</span>
                  <RoleIcon role={p.preferredRole} className="w-6 h-6 opacity-90 group-hover:scale-110 transition-transform" />
                </Link>
              ))
            )}"""

content = content.replace(old_map, new_map)

with open('src/app/players/page.tsx', 'w') as f:
    f.write(content)
