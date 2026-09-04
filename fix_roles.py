import re

with open("src/app/players/page.tsx", "r") as f:
    content = f.read()

old_select = """            <div>
              <label className="block text-slate-400 mb-2 font-medium">Ruolo Preferito</label>
              <select 
                name="preferredRole" 
                className="w-full bg-slate-900 border border-slate-600 rounded-xl p-4 text-white text-lg focus:border-emerald-500 focus:outline-none"
              >
                <option value="attaccante">Attaccante</option>
                <option value="portiere">Portiere</option>
                <option value="entrambi">Entrambi (Flessibile)</option>
              </select>
            </div>"""

new_buttons = """            <div>
              <label className="block text-slate-400 mb-4 font-medium">Ruolo Preferito</label>
              <div className="grid grid-cols-3 gap-4">
                <label className="cursor-pointer">
                  <input type="radio" name="preferredRole" value="attaccante" className="peer sr-only" defaultChecked />
                  <div className="h-full flex items-center justify-center bg-slate-900 border-2 border-slate-700 text-center text-slate-400 p-4 rounded-xl peer-checked:bg-emerald-500/20 peer-checked:border-emerald-500 peer-checked:text-white hover:border-slate-500 transition-all font-bold">
                    Attaccante
                  </div>
                </label>
                <label className="cursor-pointer">
                  <input type="radio" name="preferredRole" value="portiere" className="peer sr-only" />
                  <div className="h-full flex items-center justify-center bg-slate-900 border-2 border-slate-700 text-center text-slate-400 p-4 rounded-xl peer-checked:bg-emerald-500/20 peer-checked:border-emerald-500 peer-checked:text-white hover:border-slate-500 transition-all font-bold">
                    Portiere
                  </div>
                </label>
                <label className="cursor-pointer">
                  <input type="radio" name="preferredRole" value="entrambi" className="peer sr-only" />
                  <div className="h-full flex items-center justify-center bg-slate-900 border-2 border-slate-700 text-center text-slate-400 p-4 rounded-xl peer-checked:bg-emerald-500/20 peer-checked:border-emerald-500 peer-checked:text-white hover:border-slate-500 transition-all font-bold">
                    Entrambi
                  </div>
                </label>
              </div>
            </div>"""

content = content.replace(old_select, new_buttons)

with open("src/app/players/page.tsx", "w") as f:
    f.write(content)
