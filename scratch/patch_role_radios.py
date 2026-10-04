with open('src/components/PlayerForm.tsx', 'r') as f:
    content = f.read()

old_roles = """          <div>
            <label className="block text-slate-400 mb-4 font-medium">Ruolo Preferito</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="cursor-pointer">
                <input type="radio" name="role" value="attaccante" checked={preferredRole === "attaccante"} onChange={() => setPreferredRole("attaccante")} className="peer sr-only" />
                <div className="flex items-center justify-center gap-2 bg-slate-900 border-2 border-slate-700 text-slate-400 py-3 px-2 rounded-xl peer-checked:bg-emerald-500/20 peer-checked:border-emerald-500 peer-checked:text-white hover:border-slate-500 transition-all font-bold">
                  <RoleIcon role="attaccante" className="w-6 h-6 shrink-0" />
                  <span className="text-sm">Attaccante</span>
                </div>
              </label>
              <label className="cursor-pointer">
                <input type="radio" name="role" value="portiere" checked={preferredRole === "portiere"} onChange={() => setPreferredRole("portiere")} className="peer sr-only" />
                <div className="flex items-center justify-center gap-2 bg-slate-900 border-2 border-slate-700 text-slate-400 py-3 px-2 rounded-xl peer-checked:bg-emerald-500/20 peer-checked:border-emerald-500 peer-checked:text-white hover:border-slate-500 transition-all font-bold">
                  <RoleIcon role="portiere" className="w-6 h-6 shrink-0" />
                  <span className="text-sm">Difensore</span>
                </div>
              </label>
              <label className="cursor-pointer">
                <input type="radio" name="role" value="entrambi" checked={preferredRole === "entrambi"} onChange={() => setPreferredRole("entrambi")} className="peer sr-only" />
                <div className="flex items-center justify-center gap-2 bg-slate-900 border-2 border-slate-700 text-slate-400 py-3 px-2 rounded-xl peer-checked:bg-emerald-500/20 peer-checked:border-emerald-500 peer-checked:text-white hover:border-slate-500 transition-all font-bold">
                  <RoleIcon role="entrambi" className="w-6 h-6 shrink-0" />
                  <span className="text-sm">Entrambi</span>
                </div>
              </label>
            </div>
          </div>"""

new_roles = """          <div>
            <label className="block text-slate-400 mb-4 font-medium uppercase tracking-wider text-[10px]">Ruolo Preferito</label>
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
              <label className="flex items-center justify-start gap-3 cursor-pointer group">
                <input type="radio" name="role" value="attaccante" checked={preferredRole === "attaccante"} onChange={() => setPreferredRole("attaccante")} className="w-5 h-5 accent-emerald-500 shrink-0 cursor-pointer" />
                <div className="flex items-center gap-2">
                  <RoleIcon role="attaccante" className={`w-5 h-5 transition-colors ${preferredRole === 'attaccante' ? 'text-emerald-400 opacity-100' : 'text-slate-500 opacity-80 group-hover:text-emerald-400 group-hover:opacity-100'}`} />
                  <span className={`text-sm font-bold tracking-wider block text-left transition-colors ${preferredRole === 'attaccante' ? 'text-emerald-400' : 'text-slate-400 group-hover:text-emerald-400'}`}>Attaccante</span>
                </div>
              </label>
              
              <label className="flex items-center justify-start gap-3 cursor-pointer group">
                <input type="radio" name="role" value="portiere" checked={preferredRole === "portiere"} onChange={() => setPreferredRole("portiere")} className="w-5 h-5 accent-emerald-500 shrink-0 cursor-pointer" />
                <div className="flex items-center gap-2">
                  <RoleIcon role="portiere" className={`w-5 h-5 transition-colors ${preferredRole === 'portiere' ? 'text-emerald-400 opacity-100' : 'text-slate-500 opacity-80 group-hover:text-emerald-400 group-hover:opacity-100'}`} />
                  <span className={`text-sm font-bold tracking-wider block text-left transition-colors ${preferredRole === 'portiere' ? 'text-emerald-400' : 'text-slate-400 group-hover:text-emerald-400'}`}>Difensore</span>
                </div>
              </label>

              <label className="flex items-center justify-start gap-3 cursor-pointer group">
                <input type="radio" name="role" value="entrambi" checked={preferredRole === "entrambi"} onChange={() => setPreferredRole("entrambi")} className="w-5 h-5 accent-emerald-500 shrink-0 cursor-pointer" />
                <div className="flex items-center gap-2">
                  <RoleIcon role="entrambi" className={`w-5 h-5 transition-colors ${preferredRole === 'entrambi' ? 'text-emerald-400 opacity-100' : 'text-slate-500 opacity-80 group-hover:text-emerald-400 group-hover:opacity-100'}`} />
                  <span className={`text-sm font-bold tracking-wider block text-left transition-colors ${preferredRole === 'entrambi' ? 'text-emerald-400' : 'text-slate-400 group-hover:text-emerald-400'}`}>Entrambi</span>
                </div>
              </label>
            </div>
          </div>"""

content = content.replace(old_roles, new_roles)

with open('src/components/PlayerForm.tsx', 'w') as f:
    f.write(content)
