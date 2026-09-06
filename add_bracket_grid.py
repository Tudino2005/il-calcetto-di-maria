import re

with open("src/components/TVSlideshow.tsx", "r") as f:
    content = f.read()

# Add bracket_grid to the slides array
old_push = """    if (t.status === "drawing") {
      slides.push({ type: "slot_machine", tournament: t, duration: 600000 }); // 10 minutes max, the component will manually skip to next
    } else {
      slides.push({ type: "live_bracket", tournament: t, duration: 120000 });"""

new_push = """    if (t.status === "drawing") {
      slides.push({ type: "slot_machine", tournament: t, duration: 600000 }); // 10 minutes max, the component will manually skip to next
    } else {
      slides.push({ type: "bracket_grid", tournament: t, duration: 120000 });
      slides.push({ type: "live_bracket", tournament: t, duration: 120000 });"""

content = content.replace(old_push, new_push)

# Add the render block for bracket_grid
# We'll render exactly what the user's image shows: a nice grid of cards with "DA PIANIFICARE", team names and scores.
grid_ui = """          {/* BRACKET GRID SLIDE */}
          {currentSlide.type === "bracket_grid" && (
            <div className="flex flex-col items-center w-full h-full max-h-[80vh]">
              <div className="inline-flex items-center gap-3 px-6 py-2 bg-purple-500/20 text-purple-400 rounded-full font-bold uppercase tracking-widest border border-purple-500/30 mb-8">
                <Swords className="w-5 h-5" /> Partite del Tabellone
              </div>
              <h2 className="text-5xl font-black uppercase tracking-tight text-white mb-12">
                {currentSlide.tournament.name}
              </h2>
              
              <div className="w-full max-w-7xl overflow-y-auto pr-4 custom-scrollbar pb-12">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  {currentSlide.tournament.matches?.map((m: any) => {
                    const isFinished = !!m.winnerTeamId;
                    return (
                      <div key={m.id} className={`flex flex-col rounded-3xl border-2 p-5 ${isFinished ? 'bg-slate-800/60 border-slate-700 opacity-60' : 'bg-slate-900 border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.15)]'}`}>
                        <div className="text-sm text-slate-400 font-bold mb-4 uppercase tracking-widest flex justify-between items-center">
                          <span>{isFinished ? "Completata" : (m.scheduledAt ? new Date(m.scheduledAt).toLocaleDateString('it-IT') : "Da Pianificare")}</span>
                          <Calendar className="w-4 h-4 text-purple-400" />
                        </div>
                        
                        <div className="flex flex-col gap-3">
                          <div className={`flex justify-between items-center p-3 rounded-xl ${m.winnerTeamId === m.teamAId ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30' : 'bg-slate-800 text-slate-300'}`}>
                            <span className="truncate text-lg">{m.teamAId ? `${m.teamA?.player1?.name} & ${m.teamA?.player2?.name}` : "TBD"}</span>
                            <span className="font-black text-xl ml-3">{m.scoreTeamA}</span>
                          </div>
                          
                          <div className={`flex justify-between items-center p-3 rounded-xl ${m.winnerTeamId === m.teamBId ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30' : 'bg-slate-800 text-slate-300'}`}>
                            <span className="truncate text-lg">{m.teamBId ? `${m.teamB?.player1?.name} & ${m.teamB?.player2?.name}` : "TBD"}</span>
                            <span className="font-black text-xl ml-3">{m.scoreTeamB}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TABELLONE TURNI / BRACKET TREE */}"""

content = content.replace("          {/* TABELLONE TURNI / BRACKET TREE */}", grid_ui)

with open("src/components/TVSlideshow.tsx", "w") as f:
    f.write(content)
