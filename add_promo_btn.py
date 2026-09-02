import re

with open("src/components/TournamentLobby.tsx", "r") as f:
    content = f.read()

# Add link to Promo Page in the top right
pattern = r'(      \{/\* HEADER INFO \*/\}\n      <div className="flex justify-start">\n        <Link href="/tournaments" className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors font-bold">\n          <ArrowLeft className="w-5 h-5" /> Torna ai Tornei\n        </Link>\n      </div>)'
replacement = """      {/* BACK & PROMO BUTTONS */}
      <div className="flex justify-between items-center">
        <Link href="/tournaments" className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors font-bold">
          <ArrowLeft className="w-5 h-5" /> Torna ai Tornei
        </Link>
        <Link href={`/tournaments/${tournament.id}/promo`} target="_blank" className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/50 rounded-xl transition-colors font-bold">
          Locandina Pubblica <Share2 className="w-4 h-4" />
        </Link>
      </div>"""
content = re.sub(pattern, replacement, content)

# Also import Share2 if not already
content = content.replace(
    'import { Users, Swords, AlertTriangle, UserPlus, X, Calendar, Banknote, Trophy, ArrowLeft, CheckCircle2, Circle } from "lucide-react";',
    'import { Users, Swords, AlertTriangle, UserPlus, X, Calendar, Banknote, Trophy, ArrowLeft, CheckCircle2, Circle, Share2 } from "lucide-react";'
)

with open("src/components/TournamentLobby.tsx", "w") as f:
    f.write(content)
