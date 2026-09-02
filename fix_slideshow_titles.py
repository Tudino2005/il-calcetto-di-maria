import re

with open("src/components/TVSlideshow.tsx", "r") as f:
    content = f.read()

pattern_ui = r'(          \{/\* LEADERBOARD SLIDE \*/\}\n\s*\{currentSlide\.type === "leaderboard" && \(\n[\s\S]*?\{teamStats\.map\(\(t: any, i: number\) => \{\n[\s\S]*?\)\}\)\}\n\s*<\/div>\n\s*<\/div>\n\s*<\/div>\n\s*<\/div>\n\s*<\/div>\n\s*\)\})'

replacement_ui = """          {/* LEADERBOARD SLIDE */}
          {currentSlide.type === "leaderboard" && (
            <div className="flex w-full h-[85vh] gap-16">
              
              {/* TOP SINGLES FIXED CARD */}
              <div className="flex-1 flex flex-col bg-slate-900/80 p-8 rounded-[3rem] border-2 border-yellow-500/20 shadow-2xl backdrop-blur-sm relative">
                
                <div className="shrink-0 z-20 relative pb-6 border-b border-slate-700/50 mb-6">
                  <h3 className="text-4xl font-bold text-center flex items-center justify-center gap-4 text-white uppercase tracking-widest drop-shadow-[0_0_10px_rgba(250,204,21,0.2)]">
                    <Medal className="w-12 h-12 text-yellow-500" /> Top Singoli
                  </h3>
                </div>
                
                <div className="flex-1 overflow-hidden relative z-10 w-full mask-edges">
                  <div className="absolute top-0 left-0 w-full animate-scroll-vertical flex flex-col gap-6" style={{ animationDuration: `${(currentSlide.duration || 12000) / 1000}s` }}>
                    {playerStats.map((p: any, i: number) => {
                      const rank = i + 1;
                      return (
                      <div key={p.id} className="flex items-center gap-6 bg-slate-800/80 p-6 rounded-3xl border border-slate-700/50">
                        <div className={`w-14 h-14 shrink-0 rounded-full flex items-center justify-center font-black text-2xl shadow-inner ${
                          rank === 1 ? "bg-yellow-500 text-yellow-950" :
                          rank === 2 ? "bg-slate-300 text-slate-900" :
                          rank === 3 ? "bg-orange-700 text-orange-100" :
                          "bg-slate-700 text-white"
                        }`}>
                          {rank}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-2xl font-bold text-white truncate">{p.name}</div>
                          <div className="text-slate-400 text-lg whitespace-nowrap">{p.wins} Vittorie <span className="mx-2">•</span> {p.winRate}% WR</div>
                        </div>
                      </div>
                    )})}
                  </div>
                </div>
              </div>

              {/* TOP TEAMS FIXED CARD */}
              <div className="flex-1 flex flex-col bg-slate-900/80 p-8 rounded-[3rem] border-2 border-blue-500/20 shadow-2xl backdrop-blur-sm relative">
                
                <div className="shrink-0 z-20 relative pb-6 border-b border-slate-700/50 mb-6">
                  <h3 className="text-4xl font-bold text-center flex items-center justify-center gap-4 text-white uppercase tracking-widest drop-shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                    <Users className="w-12 h-12 text-blue-400" /> Top Coppie
                  </h3>
                </div>
                
                <div className="flex-1 overflow-hidden relative z-10 w-full mask-edges">
                  <div className="absolute top-0 left-0 w-full animate-scroll-vertical flex flex-col gap-6" style={{ animationDuration: `${(currentSlide.duration || 12000) / 1000}s` }}>
                    {teamStats.map((t: any, i: number) => {
                      const rank = i + 1;
                      return (
                      <div key={t.id} className="flex items-center gap-6 bg-slate-800/80 p-6 rounded-3xl border border-slate-700/50">
                        <div className={`w-14 h-14 shrink-0 rounded-full flex items-center justify-center font-black text-2xl shadow-inner ${
                          rank === 1 ? "bg-yellow-500 text-yellow-950" :
                          rank === 2 ? "bg-slate-300 text-slate-900" :
                          rank === 3 ? "bg-orange-700 text-orange-100" :
                          "bg-slate-700 text-white"
                        }`}>
                          {rank}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-2xl font-bold text-white truncate">{t.player1.name} & {t.player2.name}</div>
                          <div className="text-slate-400 text-lg whitespace-nowrap">{t.wins} Vittorie <span className="mx-2">•</span> {t.winRate}% WR</div>
                        </div>
                      </div>
                    )})}
                  </div>
                </div>
              </div>

            </div>
          )}"""
content = re.sub(pattern_ui, replacement_ui, content)

with open("src/components/TVSlideshow.tsx", "w") as f:
    f.write(content)
