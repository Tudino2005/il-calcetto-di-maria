import re

with open('src/components/TVSlideshow.tsx', 'r') as f:
    content = f.read()

new_slide = """
          {currentSlide.type === "group_stage" && (() => {
            const t = currentSlide.tournament;
            return (
              <div className="flex flex-col items-center w-full h-full px-8 py-4">
                <div className="inline-flex items-center gap-3 px-6 py-2 bg-indigo-500/20 text-indigo-400 rounded-full font-bold uppercase tracking-widest border border-indigo-500/30 mb-6 animate-pulse">
                  Fase a Gironi in Diretta
                </div>
                <h2 className="text-5xl font-black uppercase tracking-tight text-white mb-8 text-center drop-shadow-2xl">
                  {t.name}
                </h2>
                
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 w-full max-w-[1600px] h-auto max-h-[70vh] overflow-hidden">
                  {t.groups && t.groups.map((group: any) => (
                    <div key={group.id} className="bg-slate-900 border-2 border-indigo-500/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-full">
                      <div className="bg-indigo-600/20 py-4 px-6 border-b border-indigo-500/30 flex items-center justify-between">
                        <h3 className="text-3xl font-black text-indigo-400 uppercase tracking-widest">{group.name}</h3>
                      </div>
                      
                      <div className="p-2 flex-1">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b-2 border-slate-700/50 text-slate-400 text-sm uppercase tracking-wider">
                              <th className="p-4 font-black">Pos</th>
                              <th className="p-4 font-black">Squadra</th>
                              <th className="p-4 font-black text-center text-blue-400">Pt</th>
                              <th className="p-4 font-black text-center text-slate-500">G</th>
                              <th className="p-4 font-black text-center text-emerald-500">V</th>
                              <th className="p-4 font-black text-center text-red-500">P</th>
                            </tr>
                          </thead>
                          <tbody>
                            {group.standings.map((standing: any, index: number) => {
                              const isQualifying = index < 2; // Assuming top 2 qualify
                              return (
                                <tr key={standing.id} className={`border-b border-slate-800/50 last:border-0 transition-colors ${isQualifying ? 'bg-emerald-900/10' : ''}`}>
                                  <td className="p-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl font-black ${isQualifying ? 'bg-emerald-500 text-emerald-950' : 'bg-slate-800 text-slate-400'}`}>
                                      {index + 1}
                                    </div>
                                  </td>
                                  <td className="p-4">
                                    <div className="flex flex-col">
                                      <span className="text-xl font-bold text-white leading-tight">{standing.team?.player1?.name}</span>
                                      <span className="text-xl font-bold text-slate-400 leading-tight">{standing.team?.player2?.name}</span>
                                    </div>
                                  </td>
                                  <td className="p-4 text-center">
                                    <span className="text-3xl font-black text-blue-400">{standing.points}</span>
                                  </td>
                                  <td className="p-4 text-center text-xl font-bold text-slate-500">{standing.played}</td>
                                  <td className="p-4 text-center text-xl font-bold text-emerald-500">{standing.won}</td>
                                  <td className="p-4 text-center text-xl font-bold text-red-500">{standing.lost}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
"""

content = content.replace('{/* TABELLONE TURNI / BRACKET TREE */}', '{/* TABELLONE TURNI / BRACKET TREE */}\n' + new_slide)

with open('src/components/TVSlideshow.tsx', 'w') as f:
    f.write(content)

print("Patched UI!")
