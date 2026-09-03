import re

with open("src/components/TVSlideshow.tsx", "r") as f:
    content = f.read()

# For players
player_top_logic = """
                  {playerStats[0] && (() => {
                    const topPlayers = playerStats.filter((p: any) => 
                      p.winRate === playerStats[0].winRate && 
                      p.wins === playerStats[0].wins && 
                      p.played === playerStats[0].played
                    );
                    return (
                    <div className="mb-6 flex items-center gap-6 bg-slate-900 border-2 border-yellow-500/50 p-6 rounded-3xl w-full shadow-[0_0_30px_rgba(234,179,8,0.15)] relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <Medal className="w-24 h-24 text-yellow-500" />
                      </div>
                      <div className="w-16 flex-shrink-0 text-center font-black text-6xl text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.6)]">
                        1
                      </div>
                      <div className="flex-1 flex flex-col justify-center min-w-0 z-10 gap-3">
                        {topPlayers.map((tp: any, idx: number) => (
                          <div key={tp.id} className={idx > 0 ? "pt-3 border-t border-slate-700/50" : ""}>
                            <div className="text-3xl font-black text-white truncate leading-tight">{tp.name}</div>
                            <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">
                              {tp.preferredRole}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-col items-end shrink-0 ml-4 z-10 justify-center">
                        <div className="text-2xl font-black flex items-baseline gap-1">
                          <span className="text-emerald-400">{playerStats[0].wins} V</span>
                          <span className="text-blue-400">/ {playerStats[0].played} G</span>
                        </div>
                        <div className="text-yellow-500 font-black text-xl">
                          {playerStats[0].winRate}%
                        </div>
                      </div>
                    </div>
                  );
                  })()}
"""

player_regex = r'\{playerStats\[0\] && \(\s*<div className="mb-6 flex items-center gap-6 bg-slate-900 border-2 border-yellow-500/50 p-6 rounded-3xl w-full shadow-\[0_0_30px_rgba\(234,179,8,0\.15\)\] relative overflow-hidden">.*?</div>\s*\)\} \s*<h3 className="text-3xl font-bold text-center flex items-center justify-center gap-4 text-white uppercase tracking-widest drop-shadow-\[0_0_10px_rgba\(250,204,21,0\.2\)\]">'

content = re.sub(player_regex, player_top_logic.strip() + '\n                  <h3 className="text-3xl font-bold text-center flex items-center justify-center gap-4 text-white uppercase tracking-widest drop-shadow-[0_0_10px_rgba(250,204,21,0.2)]">', content, flags=re.DOTALL)


# For teams
team_top_logic = """
                  {teamStats[0] && (() => {
                    const topTeams = teamStats.filter((t: any) => 
                      t.winRate === teamStats[0].winRate && 
                      t.wins === teamStats[0].wins && 
                      t.played === teamStats[0].played
                    );
                    return (
                    <div className="mb-6 flex items-center gap-6 bg-slate-900 border-2 border-yellow-500/50 p-6 rounded-3xl w-full shadow-[0_0_30px_rgba(234,179,8,0.15)] relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <Users className="w-24 h-24 text-blue-500" />
                      </div>
                      <div className="w-16 flex-shrink-0 text-center font-black text-6xl text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.6)]">
                        1
                      </div>
                      <div className="flex-1 flex flex-col justify-center min-w-0 z-10 gap-3">
                        {topTeams.map((tt: any, idx: number) => (
                           <div key={tt.id} className={idx > 0 ? "pt-3 border-t border-slate-700/50" : ""}>
                             <div className="text-3xl font-black text-white leading-tight">{tt.player1.name}</div>
                             <div className="text-3xl font-black text-white leading-tight">{tt.player2.name}</div>
                           </div>
                        ))}
                      </div>
                      <div className="flex flex-col items-end shrink-0 ml-4 z-10 justify-center">
                        <div className="text-2xl font-black flex items-baseline gap-1">
                          <span className="text-emerald-400">{teamStats[0].wins} V</span>
                          <span className="text-blue-400">/ {teamStats[0].played} G</span>
                        </div>
                        <div className="text-yellow-500 font-black text-xl">
                          {teamStats[0].winRate}%
                        </div>
                      </div>
                    </div>
                  );
                  })()}
"""

team_regex = r'\{teamStats\[0\] && \(\s*<div className="mb-6 flex items-center gap-6 bg-slate-900 border-2 border-yellow-500/50 p-6 rounded-3xl w-full shadow-\[0_0_30px_rgba\(234,179,8,0\.15\)\] relative overflow-hidden">.*?</div>\s*\)\}\s*<h3 className="text-3xl font-bold text-center flex items-center justify-center gap-4 text-white uppercase tracking-widest drop-shadow-\[0_0_10px_rgba\(59,130,246,0\.3\)\]">'

content = re.sub(team_regex, team_top_logic.strip() + '\n                  <h3 className="text-3xl font-bold text-center flex items-center justify-center gap-4 text-white uppercase tracking-widest drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]">', content, flags=re.DOTALL)


with open("src/components/TVSlideshow.tsx", "w") as f:
    f.write(content)
