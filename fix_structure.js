const fs = require('fs');
let code = fs.readFileSync('src/components/TVSlideshow.tsx', 'utf8');

const regex = /\{\/\* TWO COLUMNS \*\/\}\s*<div className="flex w-2\/3 mx-auto flex-1 min-h-0 gap-8 lg:gap-16">[\s\S]*?\{\/\* LEADERBOARD FREE MATCHES \(SERIE A STYLE\) \*\/\}/;

const newSection = `{\/* TWO COLUMNS *\/}
              <div className="flex w-2/3 mx-auto flex-1 min-h-0 gap-8 lg:gap-16">
              
              {/* TOP DEFENDERS FIXED CARD */}
              <div className="flex-1 flex flex-col bg-slate-900/80 p-6 md:p-8 rounded-[3rem] border-2 border-blue-500/20 shadow-2xl backdrop-blur-sm relative min-h-0">
                
                <div className="shrink-0 z-20 relative pb-6 border-b border-slate-700/50 mb-6">
                  <h3 className="text-3xl font-bold text-center flex items-center justify-center gap-4 text-white uppercase tracking-widest drop-shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                    <Shield className="w-10 h-10 text-blue-500" /> TOP DEFENDERS
                  </h3>
                </div>
                
                <div className="flex-1 overflow-hidden relative z-10 w-full mask-edges">
                  <div className="absolute top-0 left-0 w-full animate-scroll-vertical flex flex-col gap-6" style={{ animationDuration: \`\${(currentSlide.duration || 12000) / 1000 * 0.6}s\` }}>
                    {defenderStats.map((p: any, i: number) => {
                      const rank = i + 1;
                      return (
                      <div key={p.id} className="flex items-center bg-slate-900 border border-slate-800 p-4 px-6 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-6 min-w-0 w-[40%] shrink-0">
                          <div className={\`text-3xl font-black w-8 text-center shrink-0 \${
                            rank === 1 ? "text-blue-500" :
                            rank === 2 ? "text-slate-300" :
                            rank === 3 ? "text-orange-400" :
                            "text-slate-600"
                          }\`}>
                            {rank}
                          </div>
                          <div className="flex flex-col min-w-0 justify-center">
                            <div className="flex items-center gap-3">
                              <div className="text-2xl font-bold text-white truncate leading-tight">{p.name}</div>
                            </div>
                          </div>
                        </div>
                        <div className="flex-1 flex justify-center items-center min-w-0">
                          {(() => {
                            const advStats = data.advancedPlayerStats?.find((aps: any) => aps.player.id === p.id);
                            const rStats = advStats?.roleStats;
                            const tSubiti = rStats?.gkGoalsConceded || 0;
                            const mSubiti = rStats?.gkMatches > 0 ? (tSubiti / rStats.gkMatches).toFixed(2) : '-';
                            return (
                              <div className="flex items-center gap-6 shrink-0 mx-2">
                                <div className="flex flex-col items-center gap-1">
                                  <span className="text-[12px] text-blue-500 font-bold uppercase tracking-widest leading-none">Tot Subiti</span>
                                  <span className="text-2xl font-black text-white leading-none">{tSubiti}</span>
                                </div>
                                <div className="flex flex-col items-center gap-1">
                                  <span className="text-[12px] text-blue-500 font-bold uppercase tracking-widest leading-none">Media</span>
                                  <span className="text-2xl font-black text-white leading-none">{mSubiti}</span>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                        <div className="flex flex-col items-end w-[25%] shrink-0 ml-auto">
                          <div className="text-2xl font-black text-blue-500 flex items-baseline gap-1">
                            {p.points} <span className="text-sm">PT</span>
                          </div>
                          <div className="text-sm font-bold text-slate-400 text-right">
                            {p.wins} V / {p.played} G
                          </div>
                        </div>
                      </div>
                    )})}
                  </div>
                </div>
              </div>

              {/* TOP STRIKERS FIXED CARD */}
              <div className="flex-1 flex flex-col bg-slate-900/80 p-8 rounded-[3rem] border-2 border-red-500/20 shadow-2xl backdrop-blur-sm relative">
                
                <div className="shrink-0 z-20 relative pb-6 border-b border-slate-700/50 mb-6">
                  <h3 className="text-3xl font-bold text-center flex items-center justify-center gap-4 text-white uppercase tracking-widest drop-shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                    <Swords className="w-10 h-10 text-red-500" /> TOP STRIKERS
                  </h3>
                </div>
                
                <div className="flex-1 overflow-hidden relative z-10 w-full mask-edges">
                  <div className="absolute top-0 left-0 w-full animate-scroll-vertical flex flex-col gap-6" style={{ animationDuration: \`\${(currentSlide.duration || 12000) / 1000 * 0.6}s\` }}>
                    {strikerStats.map((t: any, i: number) => {
                      const rank = i + 1;
                      return (
                      <div key={t.id} className="flex items-center bg-slate-900 border border-slate-800 p-4 px-6 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-6 min-w-0 w-[40%] shrink-0">
                          <div className={\`text-3xl font-black w-8 text-center shrink-0 \${
                            rank === 1 ? "text-red-500" :
                            rank === 2 ? "text-slate-300" :
                            rank === 3 ? "text-orange-400" :
                            "text-slate-600"
                          }\`}>
                            {rank}
                          </div>
                          <div className="flex flex-col min-w-0 justify-center">
                            <span className="text-2xl font-bold text-white truncate leading-tight">{t.name}</span>
                          </div>
                        </div>
                        <div className="flex-1 flex justify-center items-center min-w-0">
                          {(() => {
                            const advStats = data.advancedPlayerStats?.find((aps: any) => aps.player.id === t.id);
                            const rStats = advStats?.roleStats;
                            const tFatti = rStats?.stGoalsScored || 0;
                            const mFatti = rStats?.stMatches > 0 ? (tFatti / rStats.stMatches).toFixed(2) : '-';
                            return (
                              <div className="flex items-center gap-6 shrink-0 mx-2">
                                <div className="flex flex-col items-center gap-1">
                                  <span className="text-[12px] text-red-500 font-bold uppercase tracking-widest leading-none">Tot Fatti</span>
                                  <span className="text-2xl font-black text-white leading-none">{tFatti}</span>
                                </div>
                                <div className="flex flex-col items-center gap-1">
                                  <span className="text-[12px] text-red-500 font-bold uppercase tracking-widest leading-none">Media</span>
                                  <span className="text-2xl font-black text-white leading-none">{mFatti}</span>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                        <div className="flex flex-col items-end w-[25%] shrink-0 ml-auto">
                          <div className="text-2xl font-black text-red-500 flex items-baseline gap-1">
                            {t.points} <span className="text-sm">PT</span>
                          </div>
                          <div className="text-sm font-bold text-slate-400 text-right">
                            {t.wins} V / {t.played} G
                          </div>
                        </div>
                      </div>
                    )})}
                  </div>
                </div>
              </div>
              
              </div> {/* chiusura flex w-2/3 */}

            </div>
            );
          })()}

          
          {/* LEADERBOARD FREE MATCHES (SERIE A STYLE) */}`;

code = code.replace(regex, newSection);
fs.writeFileSync('src/components/TVSlideshow.tsx', code);
