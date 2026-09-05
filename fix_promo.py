import re

with open("src/app/tournaments/[id]/promo/page.tsx", "r") as f:
    content = f.read()

# Add link import
if 'import Link from "next/link";' not in content:
    content = content.replace(
        'import { Calendar, Banknote, Trophy, Users, Swords, Info } from "lucide-react";',
        'import { Calendar, Banknote, Trophy, Users, Swords, Info } from "lucide-react";\nimport Link from "next/link";'
    )

cta = """
        {/* CALL TO ACTION */}
        {(tournament.status === "setup" || tournament.status === "ready_to_draw") && (
          <div className="flex justify-center -mt-6 mb-6">
            <Link 
              href={`/tournaments/${tournament.id}/join`}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-2xl uppercase tracking-widest px-12 py-6 rounded-3xl shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:shadow-[0_0_60px_rgba(16,185,129,0.5)] transition-all hover:-translate-y-1"
            >
              Iscriviti Ora!
            </Link>
          </div>
        )}
"""

content = content.replace(
    '{/* REGOLE E FORMATO */}',
    cta + '\n        {/* REGOLE E FORMATO */}'
)

with open("src/app/tournaments/[id]/promo/page.tsx", "w") as f:
    f.write(content)
