import re

with open("src/app/players/page.tsx", "r") as f:
    content = f.read()

# Import RoleIcon
content = content.replace(
    'import { ArrowLeft, UserPlus } from "lucide-react";',
    'import { ArrowLeft, UserPlus } from "lucide-react";\nimport RoleIcon from "@/components/RoleIcon";'
)

# 1. Update the Radio buttons in the form
content = content.replace(
    """<div className="h-full flex items-center justify-center bg-slate-900 border-2 border-slate-700 text-center text-slate-400 p-4 rounded-xl peer-checked:bg-emerald-500/20 peer-checked:border-emerald-500 peer-checked:text-white hover:border-slate-500 transition-all font-bold">
                    Attaccante
                  </div>""",
    """<div className="h-full flex flex-col items-center justify-center gap-2 bg-slate-900 border-2 border-slate-700 text-center text-slate-400 p-4 rounded-xl peer-checked:bg-emerald-500/20 peer-checked:border-emerald-500 peer-checked:text-white hover:border-slate-500 transition-all font-bold">
                    <RoleIcon role="attaccante" className="w-12 h-12" />
                    <span className="text-sm">Attaccante</span>
                  </div>"""
)

content = content.replace(
    """<div className="h-full flex items-center justify-center bg-slate-900 border-2 border-slate-700 text-center text-slate-400 p-4 rounded-xl peer-checked:bg-emerald-500/20 peer-checked:border-emerald-500 peer-checked:text-white hover:border-slate-500 transition-all font-bold">
                    Portiere
                  </div>""",
    """<div className="h-full flex flex-col items-center justify-center gap-2 bg-slate-900 border-2 border-slate-700 text-center text-slate-400 p-4 rounded-xl peer-checked:bg-emerald-500/20 peer-checked:border-emerald-500 peer-checked:text-white hover:border-slate-500 transition-all font-bold">
                    <RoleIcon role="portiere" className="w-12 h-12" />
                    <span className="text-sm">Portiere</span>
                  </div>"""
)

content = content.replace(
    """<div className="h-full flex items-center justify-center bg-slate-900 border-2 border-slate-700 text-center text-slate-400 p-4 rounded-xl peer-checked:bg-emerald-500/20 peer-checked:border-emerald-500 peer-checked:text-white hover:border-slate-500 transition-all font-bold">
                    Entrambi
                  </div>""",
    """<div className="h-full flex flex-col items-center justify-center gap-2 bg-slate-900 border-2 border-slate-700 text-center text-slate-400 p-4 rounded-xl peer-checked:bg-emerald-500/20 peer-checked:border-emerald-500 peer-checked:text-white hover:border-slate-500 transition-all font-bold">
                    <RoleIcon role="entrambi" className="w-12 h-12" />
                    <span className="text-sm">Entrambi</span>
                  </div>"""
)

# 2. Update the totals headers
content = content.replace(
    '<div className="text-xs text-slate-500 font-bold uppercase">Attaccanti</div>',
    '<div className="text-xs text-slate-500 font-bold uppercase flex justify-center mb-1"><RoleIcon role="attaccante" className="w-6 h-6" /></div>'
)
content = content.replace(
    '<div className="text-xs text-slate-500 font-bold uppercase">Portieri</div>',
    '<div className="text-xs text-slate-500 font-bold uppercase flex justify-center mb-1"><RoleIcon role="portiere" className="w-6 h-6" /></div>'
)
content = content.replace(
    '<div className="text-xs text-slate-500 font-bold uppercase">Entrambi</div>',
    '<div className="text-xs text-slate-500 font-bold uppercase flex justify-center mb-1"><RoleIcon role="entrambi" className="w-6 h-6" /></div>'
)

# 3. Update the list badges
content = content.replace(
    """<span className="px-3 py-1 bg-slate-700 text-slate-300 rounded-lg text-sm uppercase tracking-wider font-medium">
                    {p.preferredRole}
                  </span>""",
    """<span className="bg-slate-800 p-2 rounded-lg">
                    <RoleIcon role={p.preferredRole} className="w-8 h-8" />
                  </span>"""
)

with open("src/app/players/page.tsx", "w") as f:
    f.write(content)
