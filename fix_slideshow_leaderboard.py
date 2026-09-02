import re

with open("src/components/TVSlideshow.tsx", "r") as f:
    content = f.read()

# Update slides array generation
pattern_slides = r'(\s*// Slide 1: Leaderboard\n\s*slides\.push\(\{ type: "leaderboard" \}\);)'
replacement_slides = """  // Leaderboard Slides (Paginated)
  const itemsPerPage = 5;
  const totalPages = Math.ceil(Math.max(playerStats.length, teamStats.length) / itemsPerPage) || 1;
  for (let i = 0; i < totalPages; i++) {
    slides.push({ type: "leaderboard", page: i, totalPages });
  }"""
content = re.sub(pattern_slides, replacement_slides, content)

# Update leaderboard rendering
pattern_ui = r'(          \{/\* LEADERBOARD SLIDE \*/\}\n\s*\{currentSlide\.type === "leaderboard" && \(\n[\s\S]*?\{teamStats\.slice\(0, 5\)\.map\(\(t: any, i: number\) => \(\n[\s\S]*?\)\)\}\n\s*<\/div>\n\s*<\/div>\n\s*<\/div>\n\s*<\/div>\n\s*\)\})'

replacement_ui = """          {/* LEADERBOARD SLIDE */}
          {currentSlide.type === "leaderboard" && (
            <div className="flex flex-col gap-12 w-full">
              <div className="text-center">
                <h2 className="text-6xl font-black uppercase tracking-widest text-yellow-400 mb-2 drop-shadow-[0_0_15px_rgba(250,204,21,0.3)]">
                  Classifiche Globali
                </h2>
                {currentSlide.totalPages > 1 && (
                  <p className="text-slate-400 font-bold uppercase tracking-widest">
                    Pagina {currentSlide.page + 1} di {currentSlide.totalPages}
                  </p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-16">
                {/* TOP SINGLES */}
                <div className="bg-slate-900/80 p-8 rounded-[3rem] border-2 border-yellow-500/20 shadow-2xl backdrop-blur-sm">
                  <h3 className="text-3xl font-bold mb-8 text-center flex items-center justify-center gap-4 text-white">
                    <Medal className="w-10 h-10 text-yellow-500" /> Singoli
                  </h3>
                  <div className="flex flex-col gap-6">
                    {playerStats.slice(currentSlide.page * 5, (currentSlide.page + 1) * 5).map((p: any, i: number) => {
                      const rank = (currentSlide.page * 5) + i + 1;
                      return (
                      <div key={p.id} className="flex items-center gap-6 bg-slate-800/80 p-6 rounded-3xl border border-slate-700/50">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center font-black text-2xl shadow-inner ${
                          rank === 1 ? "bg-yellow-500 text-yellow-950" :
                          rank === 2 ? "bg-slate-300 text-slate-900" :
                          rank === 3 ? "bg-orange-700 text-orange-100" :
                          "bg-slate-700 text-white"
                        }`}>
                          {rank}
                        </div>
                        <div className="flex-1">
                          <div className="text-2xl font-bold text-white">{p.name}</div>
                          <div className="text-slate-400 text-lg">{p.wins} Vittorie <span className="mx-2">•</span> {p.winRate}% WR</div>
                        </div>
                      </div>
                    )})}
                  </div>
                </div>

                {/* TOP TEAMS */}
                <div className="bg-slate-900/80 p-8 rounded-[3rem] border-2 border-blue-500/20 shadow-2xl backdrop-blur-sm">
                  <h3 className="text-3xl font-bold mb-8 text-center flex items-center justify-center gap-4 text-white">
                    <Users className="w-10 h-10 text-blue-400" /> Coppie
                  </h3>
                  <div className="flex flex-col gap-6">
                    {teamStats.slice(currentSlide.page * 5, (currentSlide.page + 1) * 5).map((t: any, i: number) => {
                      const rank = (currentSlide.page * 5) + i + 1;
                      return (
                      <div key={t.id} className="flex items-center gap-6 bg-slate-800/80 p-6 rounded-3xl border border-slate-700/50">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center font-black text-2xl shadow-inner ${
                          rank === 1 ? "bg-yellow-500 text-yellow-950" :
                          rank === 2 ? "bg-slate-300 text-slate-900" :
                          rank === 3 ? "bg-orange-700 text-orange-100" :
                          "bg-slate-700 text-white"
                        }`}>
                          {rank}
                        </div>
                        <div className="flex-1">
                          <div className="text-2xl font-bold text-white">{t.player1.name} & {t.player2.name}</div>
                          <div className="text-slate-400 text-lg">{t.wins} Vittorie <span className="mx-2">•</span> {t.winRate}% WR</div>
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
