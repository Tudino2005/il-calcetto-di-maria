import re

with open("src/app/admin/page.tsx", "r") as f:
    content = f.read()

# Add Zap to imports
content = content.replace('import { Trophy, Users, Play, Swords } from "lucide-react";', 'import { Trophy, Users, Play, Swords, Zap } from "lucide-react";')

# Change grid layout to accommodate 5 buttons (maybe 2x3 grid, last one spans 2?)
content = content.replace('className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl"', 'className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl"')

# Add the 5th button at the top
button5 = """
        <Link href="/tournaments/quick" className="group md:col-span-2 bg-gradient-to-r from-orange-600 to-rose-600 border-2 border-orange-400 hover:border-white rounded-3xl p-8 flex items-center justify-center gap-8 transition-all shadow-2xl shadow-orange-500/30 text-center mb-4">
          <div className="bg-white/20 p-6 rounded-full group-hover:scale-125 transition-transform">
            <Zap className="w-12 h-12 text-white" />
          </div>
          <div className="text-left">
            <h2 className="text-3xl font-black text-white uppercase tracking-wider mb-2">Torneo Volante ⚡</h2>
            <p className="text-orange-100 font-bold text-lg">Crea un torneo lampo in 1 click (Senza attesa)</p>
          </div>
        </Link>
"""

# Insert before the first Link
pattern = r'(<Link href="/match")'
content = re.sub(pattern, button5 + r'\1', content)

with open("src/app/admin/page.tsx", "w") as f:
    f.write(content)
