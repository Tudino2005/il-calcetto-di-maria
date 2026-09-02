import re

with open("src/app/page.tsx", "r") as f:
    content = f.read()

# Add Crown to lucide-react imports if not present, and Star
content = content.replace(
    'import { Trophy, Users, Play, Swords, Calendar, Banknote, Medal, ChevronRight } from "lucide-react";',
    'import { Trophy, Users, Play, Swords, Calendar, Banknote, Medal, ChevronRight, Crown, Star } from "lucide-react";'
)

# Add data fetch
pattern_fetch = r'(  const topTeams = teamStats\.slice\(0, 3\);)'
replacement_fetch = """\\1

  const completedTournaments = await prisma.tournament.findMany({
    where: { status: "completed", winnerTeamId: { not: null } },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      winnerTeam: {
        include: { player1: true, player2: true }
      }
    }
  });"""
content = re.sub(pattern_fetch, replacement_fetch, content)

# Add the UI section below Promo Tournaments
pattern_ui = r'(              \)\)\n            \)\}\n          </div>\n        </section>)'
replacement_ui = """\\1

        {/* ALBO D'ORO (Tornei Terminati) */}
        <section className="lg:col-span-2 mt-12">
          <div className="flex items-center gap-3 mb-6">
            <Crown className="w-8 h-8 text-yellow-500" />
            <h2 className="text-2xl font-black text-white uppercase tracking-widest">Ultimi Campioni</h2>
          </div>

          <div className="flex flex-col gap-4">
            {completedTournaments.length === 0 ? (
              <div className="bg-slate-900/30 border border-slate-800/50 rounded-3xl p-8 text-center text-slate-600">
                <p>Nessun torneo concluso di recente.</p>
              </div>
            ) : (
              completedTournaments.map(t => (
                <div key={t.id} className="bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700/50 rounded-2xl p-5 hover:border-yellow-500/50 transition-colors shadow-lg flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center text-yellow-500 shadow-inner">
                      <Trophy className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white leading-tight">{t.name}</h3>
                      <p className="text-slate-400 text-sm flex items-center gap-2 mt-1">
                        <Calendar className="w-3 h-3" /> {new Date(t.createdAt).toLocaleDateString('it-IT')}
                        <span className="mx-1">•</span>
                        {formatName(t.format)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right flex flex-col items-end">
                    <span className="text-xs text-yellow-500/80 font-bold uppercase tracking-widest mb-1 flex items-center gap-1"><Star className="w-3 h-3"/> Vincitori</span>
                    <div className="bg-slate-950 px-4 py-2 rounded-xl border border-slate-700 shadow-inner font-bold text-white text-sm">
                      {t.winnerTeam?.player1.name} <span className="text-slate-600 mx-1">&</span> {t.winnerTeam?.player2.name}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>"""
content = re.sub(pattern_ui, replacement_ui, content)

with open("src/app/page.tsx", "w") as f:
    f.write(content)
