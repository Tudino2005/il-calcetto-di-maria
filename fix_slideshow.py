import re

with open("src/components/TVSlideshow.tsx", "r") as f:
    content = f.read()

# Add Clock to lucide-react imports
content = content.replace(
    'import { Trophy, Users, Calendar, Banknote, Medal, Crown, Activity, Swords } from "lucide-react";',
    'import { Trophy, Users, Calendar, Banknote, Medal, Crown, Activity, Swords, Clock, MonitorPlay } from "lucide-react";'
)

# Replace slide generation for inProgressTournaments
pattern_slides = r'(\s*// Slides for In Progress\n\s*inProgressTournaments\.forEach\(\(t: any\) => slides\.push\(\{ type: "live", tournament: t \}\)\);)'
replacement_slides = """  // Slides for In Progress (Bracket & Agenda)
  inProgressTournaments.forEach((t: any) => {
    slides.push({ type: "live_bracket", tournament: t });
    
    // Check if there are scheduled matches
    const hasScheduled = t.matches?.some((m: any) => m.scheduledAt && !m.winnerTeamId);
    if (hasScheduled) {
      slides.push({ type: "live_agenda", tournament: t });
    }
  });"""
content = re.sub(pattern_slides, replacement_slides, content)

# Replace the "live" UI slide block
pattern_ui = r'(\s*\{\/\* LIVE TOURNAMENT SLIDE \*\/\}\n\s*\{currentSlide\.type === "live" && \(\n[\s\S]*?Incontri in svolgimento<\/h3>\n\s*<p className="text-xl text-slate-400">Le partite sono attualmente in corso sui tavoli\.<\/p>\n\s*<\/div>\n\s*<\/div>\n\s*\)\})'

replacement_ui = """          {/* LIVE BRACKET / MATCHES SLIDE */}
          {currentSlide.type === "live_bracket" && (
            <div className="flex flex-col items-center justify-center w-full">
              <div className="inline-flex items-center gap-3 px-6 py-2 bg-blue-500/20 text-blue-400 rounded-full font-bold uppercase tracking-widest border border-blue-500/30 mb-4">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                </span>
                Tabellone In Corso
              </div>
              <h2 className="text-5xl font-black uppercase tracking-tight text-white mb-2">
                {currentSlide.tournament.name}
              </h2>
              <p className="text-xl text-slate-400 mb-8 uppercase tracking-widest">
                {formatName(currentSlide.tournament.format)}
              </p>
              
              <div className="grid grid-cols-2 gap-8 w-full max-w-6xl">
                {/* MATCHES IN CORSO O DA GIOCARE */}
                <div className="bg-slate-900/80 p-8 rounded-[2rem] border-2 border-slate-800 shadow-2xl backdrop-blur-sm">
                  <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <MonitorPlay className="w-6 h-6 text-blue-400" /> Prossimi Incontri
                  </h3>
                  <div className="flex flex-col gap-4">
                    {currentSlide.tournament.matches
                      ?.filter((m: any) => !m.winnerTeamId && m.teamAId && m.teamBId)
                      .slice(0, 4)
                      .map((m: any) => (
                        <div key={m.id} className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 flex justify-between items-center text-lg font-bold">
                          <span className="text-white truncate">{m.teamA?.player1?.name} & {m.teamA?.player2?.name}</span>
                          <span className="text-slate-500 mx-4">VS</span>
                          <span className="text-white truncate">{m.teamB?.player1?.name} & {m.teamB?.player2?.name}</span>
                        </div>
                    ))}
                    {currentSlide.tournament.matches?.filter((m: any) => !m.winnerTeamId && m.teamAId && m.teamBId).length === 0 && (
                       <p className="text-slate-500 text-center py-4">In attesa del prossimo turno...</p>
                    )}
                  </div>
                </div>

                {/* ULTIMI RISULTATI */}
                <div className="bg-slate-900/80 p-8 rounded-[2rem] border-2 border-slate-800 shadow-2xl backdrop-blur-sm">
                  <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <Swords className="w-6 h-6 text-emerald-400" /> Ultimi Risultati
                  </h3>
                  <div className="flex flex-col gap-4">
                    {currentSlide.tournament.matches
                      ?.filter((m: any) => m.winnerTeamId)
                      .slice(0, 4)
                      .map((m: any) => (
                        <div key={m.id} className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 flex justify-between items-center">
                          <span className={`text-lg font-bold truncate ${m.winnerTeamId === m.teamAId ? 'text-emerald-400' : 'text-slate-400'}`}>
                            {m.teamA?.player1?.name} & {m.teamA?.player2?.name}
                          </span>
                          <div className="bg-slate-950 px-4 py-1 rounded-xl text-xl font-black text-white shadow-inner mx-4">
                            {m.scoreTeamA} - {m.scoreTeamB}
                          </div>
                          <span className={`text-lg font-bold truncate ${m.winnerTeamId === m.teamBId ? 'text-emerald-400' : 'text-slate-400'}`}>
                            {m.teamB?.player1?.name} & {m.teamB?.player2?.name}
                          </span>
                        </div>
                    ))}
                    {currentSlide.tournament.matches?.filter((m: any) => m.winnerTeamId).length === 0 && (
                       <p className="text-slate-500 text-center py-4">Nessun match ancora terminato.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* LIVE AGENDA SLIDE */}
          {currentSlide.type === "live_agenda" && (
            <div className="flex flex-col items-center justify-center w-full">
              <div className="inline-flex items-center gap-3 px-6 py-2 bg-indigo-500/20 text-indigo-400 rounded-full font-bold uppercase tracking-widest border border-indigo-500/30 mb-6">
                <Clock className="w-5 h-5" /> Programmazione
              </div>
              <h2 className="text-5xl font-black uppercase tracking-tight text-white mb-12">
                Agenda {currentSlide.tournament.name}
              </h2>
              
              <div className="bg-slate-900/80 p-8 rounded-[3rem] border-2 border-indigo-500/20 shadow-2xl backdrop-blur-sm w-full max-w-4xl">
                <div className="flex flex-col gap-6">
                  {currentSlide.tournament.matches
                    ?.filter((m: any) => m.scheduledAt && !m.winnerTeamId)
                    .sort((a: any, b: any) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
                    .slice(0, 5)
                    .map((m: any) => {
                      const date = new Date(m.scheduledAt);
                      return (
                        <div key={m.id} className="flex items-center justify-between bg-slate-800/80 p-6 rounded-3xl border border-slate-700 shadow-md">
                          <div className="flex items-center gap-6">
                            <div className="bg-indigo-500/20 text-indigo-300 px-6 py-3 rounded-2xl border border-indigo-500/30 font-black text-xl text-center">
                              <div>{date.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}</div>
                              <div>{date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</div>
                            </div>
                            <div>
                              <div className="text-slate-400 text-sm uppercase font-bold tracking-widest mb-1">Girone / Turno: {formatName(m.bracketType)}</div>
                              <div className="text-2xl font-bold text-white flex items-center gap-4">
                                {m.teamAId ? `${m.teamA.player1.name} & ${m.teamA.player2.name}` : "TBD"}
                                <span className="text-slate-500 text-lg">VS</span>
                                {m.teamBId ? `${m.teamB.player1.name} & ${m.teamB.player2.name}` : "TBD"}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                  })}
                </div>
              </div>
            </div>
          )}"""
content = re.sub(pattern_ui, replacement_ui, content)

with open("src/components/TVSlideshow.tsx", "w") as f:
    f.write(content)
