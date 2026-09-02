import re

with open("src/components/TVSlideshow.tsx", "r") as f:
    content = f.read()

# Locate the recent matches slide block
pattern = r'(          \{/\* RECENT MATCHES SLIDE \*/\}\n\s*\{currentSlide.type === "recent_matches" && \(\n\s*<div className="flex flex-col items-center justify-center w-full">)(.*?)(?=\n\s*\{/\* PROMO SLIDE \*/\})'

replacement = """          {/* RECENT MATCHES SLIDE */}
          {currentSlide.type === "recent_matches" && (
            <div className="flex flex-col items-center justify-center w-full h-full relative z-10 px-12">
              <div className="inline-flex items-center gap-3 px-6 py-2 bg-rose-500/10 text-rose-400 rounded-full font-bold uppercase tracking-widest border border-rose-500/20 mb-6">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                </span>
                Ultime Sfide
              </div>
              
              <h2 className="text-5xl font-black uppercase tracking-tight text-white mb-12 drop-shadow-[0_0_15px_rgba(244,63,94,0.2)]">
                Cronologia Partite Libere
              </h2>
              
              <div className="relative w-full max-w-5xl mx-auto flex flex-col gap-6 before:absolute before:inset-y-0 before:left-1/3 before:-ml-[1.5px] before:w-[3px] before:bg-slate-800/80">
                {data.recentFreeMatches.map((m: any) => {
                  const date = new Date(m.playedAt);
                  const isToday = new Date().toDateString() === date.toDateString();
                  const timeLabel = isToday 
                    ? `Oggi, ${date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}`
                    : date.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

                  const teamAWon = m.winnerTeamId === m.teamAId;
                  const winner = teamAWon ? m.teamA : m.teamB;
                  const loser = teamAWon ? m.teamB : m.teamA;
                  const scoreW = teamAWon ? m.scoreTeamA : m.scoreTeamB;
                  const scoreL = teamAWon ? m.scoreTeamB : m.scoreTeamA;

                  return (
                  <div key={m.id} className="relative flex items-center gap-10 w-full">
                    {/* LEFT: TIME */}
                    <div className="w-1/3 text-right shrink-0">
                      <div className="text-2xl font-bold text-slate-300 uppercase tracking-widest">{timeLabel}</div>
                      {isToday && <div className="text-emerald-500 text-sm font-black uppercase mt-1 tracking-widest">Recente</div>}
                    </div>
                    
                    {/* CENTER: NODE */}
                    <div className="absolute left-1/3 -ml-[10px] w-5 h-5 rounded-full bg-slate-950 border-[4px] border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.6)] z-10" />

                    {/* RIGHT: CARD */}
                    <div className="flex-1 bg-slate-900/90 border border-slate-700 p-6 rounded-3xl shadow-xl backdrop-blur-sm flex flex-col gap-4">
                      <div className="flex justify-between items-center text-3xl">
                        <div className="font-bold text-white flex items-center gap-4 leading-tight">
                          <Trophy className="w-8 h-8 text-yellow-500 shrink-0 drop-shadow-[0_0_10px_rgba(234,179,8,0.4)]" />
                          <span>
                            {winner?.player1?.name} <span className="text-slate-500 text-xl mx-1">&</span> {winner?.player2?.name}
                          </span>
                        </div>
                        <div className="font-black text-emerald-400 bg-emerald-500/10 px-4 py-1 rounded-xl">{scoreW}</div>
                      </div>
                      
                      <div className="flex justify-between items-center text-2xl">
                        <div className="font-bold text-slate-500 flex items-center gap-4 pl-12 leading-tight">
                          <span>
                            {loser?.player1?.name} <span className="text-slate-700 text-lg mx-1">&</span> {loser?.player2?.name}
                          </span>
                        </div>
                        <div className="font-black text-slate-600 bg-slate-950 px-4 py-1 rounded-xl border border-slate-800">{scoreL}</div>
                      </div>
                    </div>
                  </div>
                )})}
              </div>
            </div>
          )}"""

content = re.sub(pattern, replacement, content, flags=re.DOTALL)

with open("src/components/TVSlideshow.tsx", "w") as f:
    f.write(content)
