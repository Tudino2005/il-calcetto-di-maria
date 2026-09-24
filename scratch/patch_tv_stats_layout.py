import re

with open('src/components/TVSlideshow.tsx', 'r') as f:
    content = f.read()

# Defenders Patch
def_old = """                      <div key={p.id} className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 px-6 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-6 min-w-0 flex-1">
                          <div className={`text-3xl font-black w-8 text-center shrink-0 ${
                            rank === 1 ? "text-blue-500" :
                            rank === 2 ? "text-slate-300" :
                            rank === 3 ? "text-orange-400" :
                            "text-slate-600"
                          }`}>
                            {rank}
                          </div>
                                                    <div className="flex flex-col min-w-0 justify-center flex-1">
                            <div className="flex items-center gap-3">
                              <div className="text-2xl font-bold text-white truncate leading-tight">{p.name}</div>
                            </div>
                          </div>
                          {(() => {
                            const advStats = data.advancedPlayerStats?.find((aps: any) => aps.player.id === p.id);
                            const rStats = advStats?.roleStats;
                            const tSubiti = rStats?.gkGoalsConceded || 0;
                            const mSubiti = rStats?.gkMatches > 0 ? (tSubiti / rStats.gkMatches).toFixed(2) : '-';
                            return (
                              <div className="flex items-center gap-2 shrink-0 mx-2">
                                <span className="text-[7px] text-blue-500 font-bold uppercase tracking-widest leading-none">Tot Subiti</span>
                                <span className="text-sm font-black text-white leading-none">{tSubiti}</span>
                                <span className="text-[7px] text-blue-500 font-bold uppercase tracking-widest leading-none ml-2">Media</span>
                                <span className="text-sm font-black text-white leading-none">{mSubiti}</span>
                              </div>
                            );
                          })()}
                        </div>
                        <div className="flex flex-col items-end shrink-0 ml-4">"""

def_new = """                      <div key={p.id} className="flex items-center bg-slate-900 border border-slate-800 p-4 px-6 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-6 min-w-0 w-[40%] shrink-0">
                          <div className={`text-3xl font-black w-8 text-center shrink-0 ${
                            rank === 1 ? "text-blue-500" :
                            rank === 2 ? "text-slate-300" :
                            rank === 3 ? "text-orange-400" :
                            "text-slate-600"
                          }`}>
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
                        <div className="flex flex-col items-end w-[25%] shrink-0 ml-auto">"""


# Strikers Patch
strk_old = """                      <div key={t.id} className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 px-6 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-6 min-w-0 flex-1">
                          <div className={`text-3xl font-black w-8 text-center shrink-0 ${
                            rank === 1 ? "text-red-500" :
                            rank === 2 ? "text-slate-300" :
                            rank === 3 ? "text-orange-400" :
                            "text-slate-600"
                          }`}>
                            {rank}
                          </div>
                                                    <div className="flex items-baseline gap-2 min-w-0 flex-wrap flex-1">
                            <span className="text-xl font-bold text-white truncate leading-tight">{t.name}</span>
                          </div>
                          {(() => {
                            const advStats = data.advancedPlayerStats?.find((aps: any) => aps.player.id === t.id);
                            const rStats = advStats?.roleStats;
                            const tFatti = rStats?.stGoalsScored || 0;
                            const mFatti = rStats?.stMatches > 0 ? (tFatti / rStats.stMatches).toFixed(2) : '-';
                            return (
                              <div className="flex items-center gap-2 shrink-0 mx-2">
                                <div className="flex gap-2 items-baseline">
                                  <span className="text-[9px] text-red-400 font-bold tracking-widest uppercase">Tot Fatti</span>
                                  <span className="text-base font-black text-white leading-none">{tFatti}</span>
                                </div>
                                <div className="flex gap-2 items-baseline">
                                  <span className="text-[9px] text-red-400 font-bold tracking-widest uppercase">Media</span>
                                  <span className="text-base font-black text-white leading-none">{mFatti}</span>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                        
                        <div className="flex flex-col items-end shrink-0 ml-4">"""

strk_new = """                      <div key={t.id} className="flex items-center bg-slate-900 border border-slate-800 p-4 px-6 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-6 min-w-0 w-[40%] shrink-0">
                          <div className={`text-3xl font-black w-8 text-center shrink-0 ${
                            rank === 1 ? "text-red-500" :
                            rank === 2 ? "text-slate-300" :
                            rank === 3 ? "text-orange-400" :
                            "text-slate-600"
                          }`}>
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
                        <div className="flex flex-col items-end w-[25%] shrink-0 ml-auto">"""

if def_old in content:
    content = content.replace(def_old, def_new)
    print("Patched Defenders")
else:
    print("Could not find Defenders block")

if strk_old in content:
    content = content.replace(strk_old, strk_new)
    print("Patched Strikers")
else:
    print("Could not find Strikers block")

with open('src/components/TVSlideshow.tsx', 'w') as f:
    f.write(content)
