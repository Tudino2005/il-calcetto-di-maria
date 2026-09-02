import re

with open("src/components/TVSlideshow.tsx", "r") as f:
    content = f.read()

# Add the slide
pattern_slide = r'(  const leaderboardDuration = Math\.max\(12000, maxRows \* 1500\);\n\s*slides\.push\(\{ type: "leaderboard", duration: leaderboardDuration \}\);)'
replacement_slide = """  const leaderboardDuration = Math.max(12000, maxRows * 1500);
  slides.push({ type: "leaderboard", duration: leaderboardDuration });
  
  if (data.recentFreeMatches && data.recentFreeMatches.length > 0) {
    slides.push({ type: "recent_matches", duration: 12000 });
  }"""
content = re.sub(pattern_slide, replacement_slide, content)

# Add the UI
pattern_ui = r'(          \{/\* PROMO SLIDE \*/\})'
replacement_ui = """          {/* RECENT MATCHES SLIDE */}
          {currentSlide.type === "recent_matches" && (
            <div className="flex flex-col items-center justify-center w-full">
              <div className="inline-flex items-center gap-3 px-6 py-2 bg-rose-500/20 text-rose-400 rounded-full font-bold uppercase tracking-widest border border-rose-500/30 mb-8">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                </span>
                Ultime Sfide
              </div>
              <h2 className="text-6xl font-black uppercase tracking-tight text-white mb-12 drop-shadow-[0_0_15px_rgba(244,63,94,0.3)]">
                Partite Libere
              </h2>
              
              <div className="flex flex-col gap-6 w-full max-w-5xl">
                {data.recentFreeMatches.map((m: any) => {
                  const date = new Date(m.playedAt);
                  const isToday = new Date().toDateString() === date.toDateString();
                  const timeLabel = isToday 
                    ? `Oggi, ${date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}`
                    : date.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

                  const teamAWon = m.winnerTeamId === m.teamAId;
                  const teamBWon = m.winnerTeamId === m.teamBId;

                  return (
                  <div key={m.id} className="flex items-center justify-between bg-slate-900/80 border-2 border-slate-700/50 p-6 rounded-3xl shadow-xl backdrop-blur-sm">
                    <div className="w-48 text-left text-slate-400 font-bold uppercase tracking-widest">
                      {timeLabel}
                    </div>
                    
                    <div className="flex-1 flex items-center justify-center gap-8">
                      <div className={`flex-1 text-right text-3xl font-bold truncate ${teamAWon ? 'text-white' : 'text-slate-500'}`}>
                        {m.teamA?.player1?.name} <span className="text-xl mx-1">&</span> {m.teamA?.player2?.name}
                      </div>
                      
                      <div className="shrink-0 bg-slate-950 px-8 py-3 rounded-2xl text-4xl font-black shadow-inner border border-slate-800 flex gap-4">
                        <span className={teamAWon ? 'text-emerald-400' : 'text-white'}>{m.scoreTeamA}</span>
                        <span className="text-slate-600">-</span>
                        <span className={teamBWon ? 'text-emerald-400' : 'text-white'}>{m.scoreTeamB}</span>
                      </div>

                      <div className={`flex-1 text-left text-3xl font-bold truncate ${teamBWon ? 'text-white' : 'text-slate-500'}`}>
                        {m.teamB?.player1?.name} <span className="text-xl mx-1">&</span> {m.teamB?.player2?.name}
                      </div>
                    </div>
                  </div>
                )})}
              </div>
            </div>
          )}

          {/* PROMO SLIDE */}"""
content = re.sub(pattern_ui, replacement_ui, content)

with open("src/components/TVSlideshow.tsx", "w") as f:
    f.write(content)
