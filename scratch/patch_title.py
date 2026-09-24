import re

with open('src/components/TVSlideshow.tsx', 'r') as f:
    content = f.read()

old_header = """                <div className="flex flex-col items-center shrink-0 mb-6 absolute top-0 pt-8 w-full z-10">
                  <Activity className="w-16 h-16 text-blue-400 mb-4 drop-shadow-[0_0_15px_rgba(96,165,250,0.5)] animate-pulse" />
                  <h2 className="text-5xl font-black uppercase tracking-widest text-white drop-shadow-lg flex items-center gap-4">
                    Fascicolo Giocatori (TOP 3)
                  </h2>
                </div>"""

new_header = """                <div className="flex flex-row items-center justify-center shrink-0 mb-6 absolute top-0 pt-8 w-full z-10 gap-6">
                  <Activity className="w-16 h-16 text-blue-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.5)] animate-pulse" />
                  <h2 className="text-5xl font-black uppercase tracking-widest text-white drop-shadow-lg flex items-center">
                    TOP 3
                  </h2>
                </div>"""

content = content.replace(old_header, new_header)

with open('src/components/TVSlideshow.tsx', 'w') as f:
    f.write(content)

print("Patched title header")
