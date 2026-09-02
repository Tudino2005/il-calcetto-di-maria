import re

with open("src/components/TVSlideshow.tsx", "r") as f:
    content = f.read()

# Replace the badge and title
pattern = r'(<div className="inline-flex items-center gap-3 px-6 py-2 bg-rose-500/10 text-rose-400 rounded-full font-bold uppercase tracking-widest border border-rose-500/20 mb-6">.*?</h2\>)'

replacement = """<h2 className="text-5xl font-black uppercase tracking-widest text-white mb-12 flex items-center gap-6 drop-shadow-[0_0_15px_rgba(244,63,94,0.3)]">
                <span className="relative flex h-6 w-6">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-6 w-6 bg-rose-600"></span>
                </span>
                Ultime Sfide
              </h2>"""

content = re.sub(pattern, replacement, content, flags=re.DOTALL)

with open("src/components/TVSlideshow.tsx", "w") as f:
    f.write(content)
