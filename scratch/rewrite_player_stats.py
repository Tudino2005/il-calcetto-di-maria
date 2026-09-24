import re

with open('src/components/TVSlideshow.tsx', 'r') as f:
    content = f.read()

start_marker = '{/* PLAYER STATS SLIDE */}'
end_marker = '{/* LEADERBOARD FREE MATCHES (SERIE A STYLE) */}'

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx == -1 or end_idx == -1:
    print("Could not find markers")
    exit(1)

new_slide_code = """{/* PLAYER STATS SLIDE */}
          {currentSlide.type === "player_stats" && (() => {
            const pageStats = data.advancedPlayerStats?.slice(0, 3) || [];
            
            const formatRole = (role: string) => {
              if (!role) return "";
              const r = role.toLowerCase();
              if (r === 'portiere' || r === 'difensore') return 'Defender';
              if (r === 'attaccante') return 'Striker';
              if (r === 'entrambi') return 'Both';
              return role;
            };
            
            const stage = spotlightPlayerIdx !== null ? spotlightPlayerIdx : 0;
            
            return (
              <div className="flex flex-col items-center justify-center w-full h-[85vh] relative z-10 px-8 animate-fade-in">
                <div className="flex flex-col items-center shrink-0 mb-6 absolute top-0 pt-8 w-full z-10">
                  <Activity className="w-16 h-16 text-blue-400 mb-4 drop-shadow-[0_0_15px_rgba(96,165,250,0.5)] animate-pulse" />
                  <h2 className="text-5xl font-black uppercase tracking-widest text-white drop-shadow-lg flex items-center gap-4">
                    Fascicolo Giocatori (TOP 3)
                  </h2>
                </div>
                
                <div className="w-full h-full relative max-w-[1600px] mx-auto pt-[160px]">
                    {pageStats.map((ps: any, cardIdx: number) => {
                      const { player, rank, played, wins, winRate, totalGoalsScored, avgGoalsPerMatch, roleStats } = ps;
                      
                      const mySpotlightStage = 2 - cardIdx;
                      let styles: any = {};
                      
                      if (stage < mySpotlightStage) {
                        styles = {
                          opacity: 0,
                          transform: 'translate(-50%, 50%) scale(0.5)',
                          zIndex: 0,
                        };
                      } else if (stage === mySpotlightStage) {
                        styles = {
                          opacity: 1,
                          transform: 'translate(-50%, -50%) scale(1.4)',
                          zIndex: 50,
                          borderColor: 'rgba(99,102,241,0.9)',
                          boxShadow: '0 0 80px rgba(99,102,241,0.6)'
                        };
                      } else {
                        const podiumOffsets = [
                          { x: '0px', y: '-80px', scale: 1.35, color: 'rgba(234,179,8,0.8)', shadow: '0 0 60px rgba(234,179,8,0.4)' },
                          { x: '-460px', y: '40px', scale: 1.25, color: 'rgba(203,213,225,0.8)', shadow: '0 20px 25px -5px rgba(0,0,0,0.5)' },
                          { x: '460px', y: '60px', scale: 1.25, color: 'rgba(249,115,22,0.8)', shadow: '0 20px 25px -5px rgba(0,0,0,0.5)' },
                        ];
                        const pos = podiumOffsets[cardIdx];
                        styles = {
                          opacity: 1,
                          transform: `translate(calc(-50% + ${pos.x}), calc(-50% + ${pos.y})) scale(${pos.scale})`,
                          zIndex: cardIdx === 0 ? 30 : (cardIdx === 1 ? 20 : 10),
                          borderColor: pos.color,
                          boxShadow: pos.shadow
                        };
                      }
                      
                      return (
                        <div
                          key={player.id}
                          className="absolute left-1/2 top-1/2 bg-slate-900 border-4 p-4 rounded-3xl flex flex-col gap-3 overflow-hidden transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] w-[380px]"
                          style={styles}
                        >
                          {rank === 1 && <div className="absolute top-0 right-0 p-2 opacity-10 pointer-events-none text-8xl">👑</div>}
                          
                          {/* TOP ROW: Profile, Name, Role */}
                          <div className="flex items-center gap-4 z-10">
                            {player.avatarUrl ? (
                              <img src={`/players/${player.avatarUrl}`} alt={player.name} className="w-16 h-16 rounded-full object-cover border-2 border-slate-600 shadow-sm flex-shrink-0" />
                            ) : (
                              <div className="w-16 h-16 bg-slate-800 rounded-full border-2 border-slate-600 flex items-center justify-center shadow-sm flex-shrink-0">
                                <span className="text-2xl font-black text-slate-500 uppercase">{player.name.substring(0,2)}</span>
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="text-2xl font-black text-white truncate">{player.name}</h3>
                                {rank && <span className="text-2xl font-black text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.4)] flex-shrink-0">{rank}°</span>}
                              </div>
                              <div className="text-[17px] font-black text-slate-400 uppercase tracking-widest">{formatRole(player.preferredRole)}</div>
                            </div>
                          </div>

                          {/* MIDDLE ROW: Key stats — Gioc / Vinte / WR% */}
                          <div className="grid grid-cols-3 gap-1 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 z-10 mt-2">
                            <div className="flex flex-col items-center">
                              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Gioc</span>
                              <span className="text-xl font-black text-white">{played}</span>
                            </div>
                            <div className="flex flex-col items-center">
                              <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 mb-0.5">Vinte</span>
                              <span className="text-xl font-black text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]">{wins}</span>
                            </div>
                            <div className="flex flex-col items-center bg-yellow-500/10 rounded-lg -m-1 p-1 border border-yellow-500/20">
                              <span className="text-[9px] font-black uppercase tracking-widest text-yellow-500 mb-0.5">WR%</span>
                              <span className="text-xl font-black text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]">{winRate}%</span>
                            </div>
                          </div>

                          {/* ROLE SPECIFIC STATS */}
                          <div className="flex flex-col gap-2 z-10 mt-2">
                            {roleStats.gkMatches > 0 && (
                              <div className="bg-blue-950/30 border border-blue-900/50 rounded-xl p-2.5">
                                <div className="text-[11px] font-black uppercase tracking-widest text-blue-400 mb-2 flex items-center gap-2">
                                  <Shield className="w-4 h-4"/> Defender
                                  {roleStats.gkMatches > 0 && <span className="text-slate-500 font-bold normal-case text-[15px]">({roleStats.gkMatches} match)</span>}
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="flex items-center justify-between bg-slate-900/70 rounded-xl px-4 py-2"><span className="text-[13px] font-black uppercase text-slate-400">Tot Subiti</span><span className="text-lg font-black text-blue-300">{roleStats.gkGoalsConceded > 0 ? roleStats.gkGoalsConceded : <span className="text-slate-600">-</span>}</span></div>
                                  <div className="flex items-center justify-between bg-slate-900/70 rounded-xl px-4 py-2"><span className="text-[13px] font-black uppercase text-slate-400">Media</span><span className="text-lg font-black text-blue-200">{roleStats.defensiveIndex ?? <span className="text-slate-600">-</span>}</span></div>
                                </div>
                              </div>
                            )}

                            {roleStats.stMatches > 0 && (
                              <div className="bg-red-950/30 border border-red-900/50 rounded-xl p-2.5">
                                <div className="text-[11px] font-black uppercase tracking-widest text-red-400 mb-2 flex items-center gap-2">
                                  <Swords className="w-4 h-4"/> Striker
                                  {roleStats.stMatches > 0 && <span className="text-slate-500 font-bold normal-case text-[15px]">({roleStats.stMatches} match)</span>}
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="flex items-center justify-between bg-slate-900/70 rounded-xl px-4 py-2"><span className="text-[13px] font-black uppercase text-slate-400">Tot Fatti</span><span className="text-lg font-black text-red-300">{roleStats.stGoalsScored > 0 ? roleStats.stGoalsScored : <span className="text-slate-600">-</span>}</span></div>
                                  <div className="flex items-center justify-between bg-slate-900/70 rounded-xl px-4 py-2"><span className="text-[13px] font-black uppercase text-slate-400">Media</span><span className="text-lg font-black text-red-200">{roleStats.offensiveIndex ?? <span className="text-slate-600">-</span>}</span></div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
                
                {/* FOOTER INFO */}
                <div className="bg-slate-950 absolute bottom-0 left-0 w-full p-2 text-center text-[15px] text-slate-500 font-bold uppercase tracking-widest border-t border-slate-800 z-20">
                  SG: Sfide Giocate • V: Vittorie • P: Perse • WR%: Win Rate (Vittorie / Sfide)
                </div>
              </div>
            );
          })()}

          """

final_content = content[:start_idx] + new_slide_code + content[end_idx:]

with open('src/components/TVSlideshow.tsx', 'w') as f:
    f.write(final_content)

print("Rewrote player stats slide")
