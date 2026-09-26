import re

with open('src/components/TVSlideshow.tsx', 'r') as f:
    content = f.read()

old_code = """                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 w-full max-w-[1600px] h-auto max-h-[70vh] overflow-hidden">
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
                </div>"""

new_code = """                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full max-w-[1600px] h-auto max-h-[70vh] overflow-hidden px-4">
                  {t.groups && t.groups.map((group: any) => (
                    <div key={group.id} className="bg-[#151927] border border-slate-700/60 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-full">
                      <div className="bg-[#1e2436] py-5 px-6 border-b border-slate-700/60 flex items-center justify-between">
                        <h3 className="text-2xl font-bold text-white uppercase tracking-widest">{group.name}</h3>
                      </div>
                      
                      <div className="flex-1 overflow-hidden">
                        <table className="w-full text-left border-collapse table-fixed">
                          <thead>
                            <tr className="border-b border-slate-700/60 text-slate-400 text-xs uppercase tracking-widest">
                              <th className="py-4 px-6 font-bold w-20">Pos</th>
                              <th className="py-4 px-6 font-bold w-auto">Squadra</th>
                              <th className="py-4 px-6 font-bold text-center w-24">PG</th>
                              <th className="py-4 px-6 font-bold text-center w-24">V</th>
                              <th className="py-4 px-6 font-bold text-center w-24">DS</th>
                              <th className="py-4 px-6 font-bold text-center text-fuchsia-400 w-24">PTI</th>
                            </tr>
                          </thead>
                          <tbody>
                            {group.standings.map((standing: any, index: number) => {
                              const isQualifying = index < 2; // Assuming top 2 qualify
                              const ds = (standing.setsFor || 0) - (standing.setsAgainst || 0);
                              return (
                                <tr key={standing.id} className="border-b border-slate-800/40 last:border-0 hover:bg-slate-800/20 transition-colors">
                                  <td className="py-4 px-6">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isQualifying ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-500'}`}>
                                      {index + 1}
                                    </div>
                                  </td>
                                  <td className="py-4 px-6 truncate">
                                    <span className="text-lg font-bold text-slate-200 truncate">
                                      {standing.team?.player1?.name} & {standing.team?.player2?.name}
                                    </span>
                                  </td>
                                  <td className="py-4 px-6 text-center text-lg font-medium text-slate-400">{standing.played}</td>
                                  <td className="py-4 px-6 text-center text-lg font-medium text-slate-400">{standing.won}</td>
                                  <td className="py-4 px-6 text-center text-lg font-medium text-slate-400">{ds > 0 ? `+${ds}` : ds}</td>
                                  <td className="py-4 px-6 text-center">
                                    <span className="text-xl font-bold text-fuchsia-400">{standing.points}</span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>"""

content = content.replace(old_code, new_code)

with open('src/components/TVSlideshow.tsx', 'w') as f:
    f.write(content)

print("Patched UI!")
