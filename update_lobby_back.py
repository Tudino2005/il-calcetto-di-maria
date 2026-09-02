import re

with open("src/components/TournamentLobby.tsx", "r") as f:
    content = f.read()

# Add ArrowLeft import if missing
content = content.replace(
    'import { Users, Swords, AlertTriangle, UserPlus, X, Calendar, Banknote, Trophy } from "lucide-react";',
    'import { Users, Swords, AlertTriangle, UserPlus, X, Calendar, Banknote, Trophy, ArrowLeft } from "lucide-react";\nimport Link from "next/link";'
)

# Add the back button before the header info
pattern = r'(      \{/\* HEADER INFO \*/\}\n      <div className="bg-slate-900 p-8 rounded-3xl border border-slate-700 shadow-xl relative overflow-hidden">)'
replacement = """      {/* BACK BUTTON */}
      <div className="flex justify-start">
        <Link href="/tournaments" className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors font-bold">
          <ArrowLeft className="w-5 h-5" /> Torna ai Tornei
        </Link>
      </div>

\\1"""

content = re.sub(pattern, replacement, content)

with open("src/components/TournamentLobby.tsx", "w") as f:
    f.write(content)
