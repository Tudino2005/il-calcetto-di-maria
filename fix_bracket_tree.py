import re

with open("src/components/TVSlideshow.tsx", "r") as f:
    content = f.read()

# Add bracket_tree to slides
content = content.replace(
    'slides.push({ type: "live_bracket", tournament: t });',
    'slides.push({ type: "live_bracket", tournament: t });\n    slides.push({ type: "bracket_tree", tournament: t, duration: 15000 });'
)

# Render bracket_tree slide
bracket_slide = """
          {/* TABELLONE TURNI / BRACKET TREE */}
          {currentSlide.type === "bracket_tree" && (() => {
            const t = currentSlide.tournament;
            let rounds: any[][] = [];
            
            try {
               const bData = t.bracketData ? JSON.parse(t.bracketData) : null;
               if (bData && bData.rounds) {
                 rounds = bData.rounds.map((roundMatchIds: string[]) => 
                   roundMatchIds.map(id => t.matches?.find((m: any) => m.id === id)).filter(Boolean)
                 ).filter((r: any[]) => r.length > 0);
               }
            } catch (e) {}

            if (rounds.length === 0 && t.matches) {
               const grouped = t.matches.reduce((acc: any, m: any) => {
                 const bt = m.bracketType || 'Turno';
                 if (!acc[bt]) acc[bt] = [];
                 acc[bt].push(m);
                 return acc;
               }, {});
               rounds = Object.values(grouped);
            }

            return (
            <div className="flex flex-col items-center justify-center w-full h-full p-12">
              <div className="inline-flex items-center gap-3 px-6 py-2 bg-pink-500/20 text-pink-400 rounded-full font-bold uppercase tracking-widest border border-pink-500/30 mb-4 animate-pulse">
                Svolgimento Torneo
              </div>
              <h2 className="text-5xl font-black uppercase tracking-tight text-white mb-10">
                Turni {t.name}
              </h2>
              
              <div className="flex gap-6 w-full max-w-7xl h-[65vh] overflow-x-auto overflow-y-hidden hidden-scrollbar items-start justify-center">
                 {rounds.map((round, rIndex) => {
                    let roundName = `Turno ${rIndex + 1}`;
                    if (t.format === 'eliminazione_diretta') {
                        roundName = round.length === 1 ? "Finale" : round.length === 2 ? "Semifinali" : round.length === 4 ? "Quarti" : round.length === 8 ? "Ottavi" : `Turno ${rIndex + 1}`;
                    } else if (round[0]?.bracketType) {
                        roundName = round[0].bracketType.toUpperCase();
                    }
                    
                    return (
                      <div key={rIndex} className="flex flex-col gap-4 min-w-[300px] h-full overflow-y-auto hidden-scrollbar pb-10">
                         <div className="bg-slate-900/90 p-4 text-center rounded-2xl border-2 border-pink-500/30 shadow-xl sticky top-0 z-10 backdrop-blur-md">
                           <h3 className="text-xl font-black text-pink-400 uppercase tracking-widest">{roundName}</h3>
                         </div>
                         <div className="flex flex-col gap-4">
                           {round.map((m: any, mIndex: number) => (
                             <div key={m.id || mIndex} className={`p-4 rounded-xl border flex flex-col gap-3 relative shadow-md transition-all ${m.winnerTeamId ? 'bg-slate-900/80 border-slate-700' : 'bg-slate-800 border-slate-600'}`}>
                                <div className="flex justify-between items-center text-sm font-bold gap-3">
                                  <span className={`flex-1 truncate ${m.winnerTeamId === m.teamAId ? 'text-emerald-400 font-black text-base' : 'text-slate-300'}`}>
                                    {m.teamA ? `${m.teamA.player1.name} & ${m.teamA.player2.name}` : "TBD"}
                                  </span>
                                  <span className={`w-8 text-center rounded py-1 ${m.winnerTeamId === m.teamAId ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-950 text-white'}`}>{m.scoreTeamA}</span>
                                </div>
                                <div className="h-[1px] w-full bg-slate-700/50"></div>
                                <div className="flex justify-between items-center text-sm font-bold gap-3">
                                  <span className={`flex-1 truncate ${m.winnerTeamId === m.teamBId ? 'text-emerald-400 font-black text-base' : 'text-slate-300'}`}>
                                    {m.teamB ? `${m.teamB.player1.name} & ${m.teamB.player2.name}` : "TBD"}
                                  </span>
                                  <span className={`w-8 text-center rounded py-1 ${m.winnerTeamId === m.teamBId ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-950 text-white'}`}>{m.scoreTeamB}</span>
                                </div>
                             </div>
                           ))}
                         </div>
                      </div>
                    )
                 })}
              </div>
            </div>
            );
          })()}"""

content = content.replace('{/* LIVE BRACKET / MATCHES SLIDE */}', bracket_slide + '\n\n          {/* LIVE BRACKET / MATCHES SLIDE */}')

with open("src/components/TVSlideshow.tsx", "w") as f:
    f.write(content)
