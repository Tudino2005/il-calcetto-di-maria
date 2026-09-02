import re

with open("src/components/TournamentLobby.tsx", "r") as f:
    content = f.read()

pattern = r'(      \{/\* BACK BUTTON \*/\}\n      <div className="flex justify-start">\n        <Link href="/tournaments" className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors font-bold">\n          <ArrowLeft className="w-5 h-5" /> Torna ai Tornei\n        </Link>\n      </div>)'
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

with open("src/components/TournamentLobby.tsx", "w") as f:
    f.write(content)
