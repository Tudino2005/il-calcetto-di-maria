import re

with open("src/components/TVSlideshow.tsx", "r") as f:
    content = f.read()

# Change slide generation
pattern_slides = r'(\s*// Leaderboard Slides \(Paginated\)\n\s*const itemsPerPage = 5;\n\s*const totalPages = Math\.ceil\(Math\.max\(playerStats\.length, teamStats\.length\) \/ itemsPerPage\) \|\| 1;\n\s*for \(let i = 0; i < totalPages; i\+\+\) \{\n\s*slides\.push\(\{ type: "leaderboard", page: i, totalPages \}\);\n\s*\})'
replacement_slides = """  // Leaderboard Slide (Auto-scrolling)
  const maxRows = Math.max(playerStats.length, teamStats.length);
  // Calculate dynamic duration based on rows (approx 1.5s per row), minimum 12 seconds
  const leaderboardDuration = Math.max(12000, maxRows * 1500);
  slides.push({ type: "leaderboard", duration: leaderboardDuration });"""
content = re.sub(pattern_slides, replacement_slides, content)

# Change interval logic
pattern_interval = r'(\s*useEffect\(\(\) => \{\n\s*if \(slides\.length <= 1\) return;\n\s*const interval = setInterval\(\(\) => \{\n\s*setCurrentIndex\(\(prev\) => \(prev \+ 1\) % slides\.length\);\n\s*\}, 12000\); // Change slide every 12 seconds\n\s*return \(\) => clearInterval\(interval\);\n\s*\}, \[slides\.length\]\);)'

replacement_interval = """  useEffect(() => {
    if (slides.length <= 1) return;
    
    // Get duration of current slide (default 12s if not specified)
    const currentDuration = slides[currentIndex]?.duration || 12000;
    
    const timeout = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, currentDuration);
    
    return () => clearTimeout(timeout);
  }, [currentIndex, slides]);"""
content = re.sub(pattern_interval, replacement_interval, content)

# Update leaderboard rendering
pattern_ui = r'(          \{/\* LEADERBOARD SLIDE \*/\}\n\s*\{currentSlide\.type === "leaderboard" && \(\n[\s\S]*?\{teamStats\.slice\(currentSlide\.page \* 5, \(currentSlide\.page \+ 1\) \* 5\)\.map\(\(t: any, i: number\) => \{\n[\s\S]*?\)\}\)\}\n\s*<\/div>\n\s*<\/div>\n\s*<\/div>\n\s*<\/div>\n\s*\)\})'

replacement_ui = """          {/* LEADERBOARD SLIDE */}
          {currentSlide.type === "leaderboard" && (
            <div className="flex flex-col gap-12 w-full h-[80vh] overflow-hidden relative">
              <div className="text-center shrink-0 z-20 relative bg-slate-950 pb-8">
                <h2 className="text-6xl font-black uppercase tracking-widest text-yellow-400 mb-2 drop-shadow-[0_0_15px_rgba(250,204,21,0.3)]">
                  Classifiche Globali
                </h2>
                <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-transparent to-slate-950 pointer-events-none translate-y-full"></div>
              </div>
              
              <div className="flex-1 overflow-hidden relative z-10 w-full mask-edges">
                <div className="grid grid-cols-2 gap-16 absolute top-0 left-0 w-full animate-scroll-vertical" style={{ animationDuration: `${(currentSlide.duration || 12000) / 1000}s` }}>
                  
                  {/* TOP SINGLES */}
                  <div className="bg-slate-900/80 p-8 rounded-[3rem] border-2 border-yellow-500/20 shadow-2xl backdrop-blur-sm">
                    <h3 className="text-3xl font-bold mb-8 text-center flex items-center justify-center gap-4 text-white">
                      <Medal className="w-10 h-10 text-yellow-500" /> Singoli
                    </h3>
                    <div className="flex flex-col gap-6">
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

                  {/* TOP TEAMS */}
                  <div className="bg-slate-900/80 p-8 rounded-[3rem] border-2 border-blue-500/20 shadow-2xl backdrop-blur-sm">
                    <h3 className="text-3xl font-bold mb-8 text-center flex items-center justify-center gap-4 text-white">
                      <Users className="w-10 h-10 text-blue-400" /> Coppie
                    </h3>
                    <div className="flex flex-col gap-6">
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
            </div>
          )}"""
content = re.sub(pattern_ui, replacement_ui, content)

# Add CSS for animation
pattern_css = r'(        \.animate-fade-in-up \{\n\s*animation: fadeInUp 1s cubic-bezier\(0\.16, 1, 0\.3, 1\) forwards;\n\s*\})'
replacement_css = """        .animate-fade-in-up {
          animation: fadeInUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes scrollVertical {
          0% { transform: translateY(50vh); }
          100% { transform: translateY(calc(-100% - 20vh)); }
        }
        .animate-scroll-vertical {
          animation-name: scrollVertical;
          animation-timing-function: linear;
          animation-fill-mode: forwards;
        }
        .mask-edges {
          mask-image: linear-gradient(to bottom, transparent, black 10%, black 90%, transparent);
          -webkit-mask-image: linear-gradient(to bottom, transparent, black 10%, black 90%, transparent);
        }"""
content = re.sub(pattern_css, replacement_css, content)

with open("src/components/TVSlideshow.tsx", "w") as f:
    f.write(content)
