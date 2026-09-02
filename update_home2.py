import re

with open("src/app/page.tsx", "r") as f:
    content = f.read()

# Import Activity or Zap icon if needed
content = content.replace(
    'import { Trophy, Users, Play, Swords, Calendar, Banknote, Medal, ChevronRight, Crown, Star } from "lucide-react";',
    'import { Trophy, Users, Play, Swords, Calendar, Banknote, Medal, ChevronRight, Crown, Star, Activity } from "lucide-react";'
)

# Add fetch for in progress tournaments
pattern_fetch = r'(  const completedTournaments = await prisma\.tournament\.findMany\(\{)'
replacement_fetch = """  const inProgressTournaments = await prisma.tournament.findMany({
    where: { status: "in_progress" },
    orderBy: { createdAt: "desc" },
    take: 5
  });

\\1"""
content = re.sub(pattern_fetch, replacement_fetch, content)

# Add the UI section
pattern_ui = r'(        \{/\* ALBO D\'ORO \(Tornei Terminati\) \*/\})'
replacement_ui = """        {/* TORNEI IN CORSO */}
        <section className="lg:col-span-2 mt-12">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="w-8 h-8 text-blue-400" />
            <h2 className="text-2xl font-black text-white uppercase tracking-widest">Tornei in Corso</h2>
          </div>

          <div className="flex flex-col gap-4">
            {inProgressTournaments.length === 0 ? (
              <div className="bg-slate-900/30 border border-slate-800/50 rounded-3xl p-8 text-center text-slate-600">
                <p>Nessun torneo in fase di svolgimento.</p>
              </div>
            ) : (
              inProgressTournaments.map(t => (
                <div key={t.id} className="bg-slate-900 border border-slate-700 rounded-3xl p-6 hover:border-blue-500/50 transition-colors shadow-xl flex flex-col md:flex-row gap-6 items-center">
                  <div className="flex-1 w-full">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-bold uppercase tracking-wider border border-blue-500/30 flex items-center gap-1">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        In Corso
                      </span>
                      <span className="px-3 py-1 bg-slate-800 text-slate-300 rounded-full text-xs font-bold uppercase tracking-wider border border-slate-700">
                        {formatName(t.format)}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">{t.name}</h3>
                    
                    <p className="text-sm text-slate-400 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-500" /> Iniziato il: {new Date(t.createdAt).toLocaleDateString('it-IT')}
                    </p>
                  </div>
                  
                  <div className="w-full md:w-auto flex justify-end">
                    <Link href={`/tournaments/${t.id}`} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-center transition-colors shadow-lg shadow-blue-500/20 w-full md:w-auto">
                      Vai al Tabellone
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

\\1"""
content = re.sub(pattern_ui, replacement_ui, content)

with open("src/app/page.tsx", "w") as f:
    f.write(content)
