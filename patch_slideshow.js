const fs = require('fs');
let file = fs.readFileSync('src/components/TVSlideshow.tsx', 'utf8');

// 1. Insert slides generator
const slidesGen = `
  if (data.freeMatchesStats && data.freeMatchesStats.length > 0) {
    const playersPerPage = 10;
    const pages = Math.ceil(data.freeMatchesStats.length / playersPerPage);
    for (let p = 0; p < pages; p++) {
      slides.push({ type: "leaderboard_free", duration: 15000, page: p });
    }
  }
`;

file = file.replace(
  '  slides.push({ type: "leaderboard", duration: leaderboardDuration });',
  '  slides.push({ type: "leaderboard", duration: leaderboardDuration });\n' + slidesGen
);

// 2. Add the slide rendering logic
// I will place it right before the HALL OF FAME SLIDE or RECENT MATCHES SLIDE
const slideRender = `
          {/* LEADERBOARD FREE MATCHES (SERIE A STYLE) */}
          {currentSlide.type === "leaderboard_free" && (
            <div className="flex flex-col items-center w-full max-w-7xl h-[85vh] relative z-10 mx-auto px-4">
              <div className="flex items-center gap-4 mb-8 shrink-0">
                <Swords className="w-12 h-12 text-emerald-400 drop-shadow-lg" />
                <h2 className="text-5xl font-black uppercase tracking-widest text-white drop-shadow-lg">
                  Sfide Libere
                </h2>
                <Swords className="w-12 h-12 text-emerald-400 drop-shadow-lg" />
              </div>
              
              <div className="w-full bg-slate-900/95 border border-slate-700/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col flex-1">
                {/* TABLE HEADER */}
                <div className="grid grid-cols-12 gap-2 bg-slate-950/80 p-4 border-b border-slate-700/50 text-slate-400 font-bold uppercase tracking-widest text-xs">
                  <div className="col-span-1 text-center">Pos</div>
                  <div className="col-span-3">Giocatore</div>
                  <div className="col-span-1 text-center" title="Sfide Giocate">SG</div>
                  <div className="col-span-1 text-center text-emerald-400/70" title="Vittorie">V</div>
                  <div className="col-span-1 text-center text-red-400/70" title="Perse">P</div>
                  <div className="col-span-1 text-center" title="Set Vinti">SV</div>
                  <div className="col-span-1 text-center" title="Set Persi">SP</div>
                  <div className="col-span-1 text-center" title="Differenza Set">DS</div>
                  <div className="col-span-1 text-center text-white" title="Win Rate %">WR%</div>
                  <div className="col-span-1 text-center">Ultime 5</div>
                </div>
                
                {/* ROWS */}
                <div className="flex flex-col flex-1">
                  {data.freeMatchesStats.slice(currentSlide.page * 10, (currentSlide.page + 1) * 10).map((stats: any, index: number) => {
                    const globalRank = (currentSlide.page * 10) + index + 1;
                    const isFirst = globalRank === 1;
                    
                    return (
                      <div 
                        key={stats.id} 
                        className={\`grid grid-cols-12 gap-2 p-4 items-center border-b border-slate-800/30 transition-colors flex-1 \${
                          isFirst ? 'bg-yellow-500/10 border-yellow-500/20' : 'even:bg-slate-800/30 hover:bg-slate-800/50'
                        }\`}
                      >
                        {/* Pos */}
                        <div className="col-span-1 text-center">
                          <span className={\`text-xl font-black \${isFirst ? 'text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]' : 'text-slate-500'}\`}>
                            {globalRank}
                          </span>
                        </div>
                        {/* Giocatore */}
                        <div className="col-span-3 flex items-center gap-3">
                          <RoleIcon role={stats.role} className={\`w-5 h-5 \${isFirst ? 'text-yellow-400' : 'text-slate-400'}\`} />
                          <span className={\`text-lg font-bold uppercase tracking-wider truncate \${isFirst ? 'text-yellow-400' : 'text-white'}\`}>
                            {stats.name}
                          </span>
                        </div>
                        {/* SG */}
                        <div className="col-span-1 text-center text-slate-300 font-bold">{stats.sg}</div>
                        {/* V */}
                        <div className="col-span-1 text-center text-emerald-400 font-bold">{stats.v}</div>
                        {/* P */}
                        <div className="col-span-1 text-center text-red-400 font-bold">{stats.p}</div>
                        {/* SV */}
                        <div className="col-span-1 text-center text-slate-300 font-medium">{stats.sv}</div>
                        {/* SP */}
                        <div className="col-span-1 text-center text-slate-300 font-medium">{stats.sp}</div>
                        {/* DS */}
                        <div className="col-span-1 text-center font-bold text-slate-300">
                          {stats.ds > 0 ? \`+\${stats.ds}\` : stats.ds}
                        </div>
                        {/* WR% */}
                        <div className="col-span-1 text-center font-black text-xl text-white">
                          {stats.wr.toFixed(0)}%
                        </div>
                        {/* Ultime 5 */}
                        <div className="col-span-1 flex items-center justify-center gap-1">
                          {stats.recentForm.slice().reverse().map((result: string, rIdx: number) => (
                            <div 
                              key={rIdx}
                              className={\`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm \${
                                result === 'W' ? 'bg-emerald-500' : 'bg-red-500'
                              }\`}
                            >
                              {result === 'W' ? '✓' : '×'}
                            </div>
                          ))}
                          {Array.from({ length: Math.max(0, 5 - stats.recentForm.length) }).map((_, rIdx) => (
                            <div key={\`empty-\${rIdx}\`} className="w-4 h-4 rounded-full border border-slate-700 bg-slate-800/50"></div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* FOOTER INFO */}
                <div className="bg-slate-950 p-2 text-center text-[10px] text-slate-500 font-bold uppercase tracking-widest border-t border-slate-800">
                  SG: Sfide Giocate • V: Vittorie • P: Perse • SV: Set Vinti • SP: Set Persi • DS: Differenza Set • WR%: Win Rate (Vittorie / Sfide)
                </div>
              </div>
            </div>
          )}
`;

file = file.replace(
  '{/* RECENT MATCHES SLIDE */}',
  slideRender + '\n          {/* RECENT MATCHES SLIDE */}'
);

fs.writeFileSync('src/components/TVSlideshow.tsx', file);
