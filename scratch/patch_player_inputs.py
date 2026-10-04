with open('src/components/PlayerForm.tsx', 'r') as f:
    content = f.read()

old_nome = """          <div>
            <label className="block text-slate-400 mb-2 font-medium">Nome (Nickname)</label>
            <input 
              type="text" 
              value={name}
              onChange={e => setName(e.target.value)}
              required 
              className="w-full bg-slate-900 border border-slate-600 rounded-xl p-4 text-white text-lg focus:border-emerald-500 focus:outline-none"
              placeholder="Es. Mario Rossi (se esiste, verrà aggiornato)"
            />
          </div>"""

new_nome = """          <div className="flex flex-col-reverse group mt-2 mb-4">
            <span className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-bold group-hover:text-emerald-400 transition-colors">Nome (Nickname)</span>
            <input 
              type="text" 
              value={name}
              onChange={e => setName(e.target.value)}
              required 
              className="w-full bg-transparent border-0 border-b border-transparent text-white font-bold text-xl p-0 focus:ring-0 focus:outline-none placeholder-slate-600 transition-colors"
              placeholder="Es. Mario Rossi (se esiste, verrà aggiornato)"
            />
          </div>"""

old_media = """          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-2 font-medium">Video Sigla (.mp4)</label>
              <input 
                type="text" 
                value={mediaUrl}
                onChange={e => setMediaUrl(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-xl p-4 text-white text-base focus:border-emerald-500 focus:outline-none"
                placeholder="es. enzo.mp4"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-2 font-medium">Foto Card (.jpeg)</label>
              <input 
                type="text" 
                value={avatarUrl}
                onChange={e => setAvatarUrl(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-xl p-4 text-white text-base focus:border-emerald-500 focus:outline-none"
                placeholder="es. Enzo.jpeg"
              />
            </div>
          </div>"""

new_media = """          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-4 mb-6">
            <div className="flex flex-col-reverse group">
              <span className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-bold group-hover:text-emerald-400 transition-colors">Video Sigla (.mp4)</span>
              <input 
                type="text" 
                value={mediaUrl}
                onChange={e => setMediaUrl(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-transparent text-white font-bold text-xl p-0 focus:ring-0 focus:outline-none placeholder-slate-600 transition-colors"
                placeholder="es. enzo.mp4"
              />
            </div>
            <div className="flex flex-col-reverse group">
              <span className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-bold group-hover:text-emerald-400 transition-colors">Foto Card (.jpeg)</span>
              <input 
                type="text" 
                value={avatarUrl}
                onChange={e => setAvatarUrl(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-transparent text-white font-bold text-xl p-0 focus:ring-0 focus:outline-none placeholder-slate-600 transition-colors"
                placeholder="es. Enzo.jpeg"
              />
            </div>
          </div>"""

content = content.replace(old_nome, new_nome)
content = content.replace(old_media, new_media)

with open('src/components/PlayerForm.tsx', 'w') as f:
    f.write(content)
