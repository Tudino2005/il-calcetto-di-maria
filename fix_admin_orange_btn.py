import re

with open("src/app/admin/page.tsx", "r") as f:
    content = f.read()

pattern = r'(<Link href="/tournaments/quick" className="group md:col-span-2 bg-gradient-to-r from-orange-600 to-rose-600 border-2 border-orange-400 hover:border-white rounded-3xl p-8 flex items-center justify-center gap-8 transition-all shadow-2xl shadow-orange-500/30 text-center mb-4">\n\s*<div className="bg-white/20 p-6 rounded-full group-hover:scale-125 transition-transform">\n\s*<Zap className="w-12 h-12 text-white" />\n\s*</div>\n\s*<div className="text-left">\n\s*<h2 className="text-3xl font-black text-white uppercase tracking-wider mb-2">Torneo Volante ⚡</h2>\n\s*<p className="text-orange-100 font-bold text-lg">Crea un torneo lampo in 1 click \(Senza attesa\)</p>\n\s*</div>\n\s*</Link>)'

replacement = """<Link href="/tournaments/quick" className="group md:col-span-2 bg-slate-900 border-2 border-slate-700 hover:border-orange-500 hover:bg-slate-800 rounded-3xl p-8 flex flex-col items-center gap-4 transition-all shadow-xl text-center mb-4">
          <div className="bg-orange-500/20 p-6 rounded-full group-hover:scale-110 transition-transform">
            <Zap className="w-12 h-12 text-orange-500" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-wider mb-2">Torneo Volante</h2>
            <p className="text-slate-400 font-bold">Crea un torneo lampo in 1 click (Senza attesa)</p>
          </div>
        </Link>"""

content = re.sub(pattern, replacement, content)

with open("src/app/admin/page.tsx", "w") as f:
    f.write(content)
