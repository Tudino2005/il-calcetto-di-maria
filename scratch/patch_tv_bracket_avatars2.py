import re

with open('src/components/TVSlideshow.tsx', 'r') as f:
    content = f.read()

# Replace Team A
old_teama = """                  <div className="flex-1 flex flex-col min-w-0 pr-2">
                    {m.teamAId && t.teamNames && t.teamNames[m.teamAId] && (
                      <span className="text-xs text-purple-400 font-bold uppercase tracking-wider mb-1">
                        "{t.teamNames[m.teamAId]}"
                      </span>
                    )}
                    <span className="text-lg font-bold leading-tight text-slate-200">
                      {m.teamA ? `${m.teamA.player1.name} & ${m.teamA.player2.name}` : "TBD"}
                    </span>
                    {m.teamA && (
                      <div className="flex items-center gap-2 mt-3 justify-start">
                        {[m.teamA.player1, m.teamA.player2].map((player, i) => (
                           player && (
                             player.avatarUrl ? (
                               <img key={i} src={`/players/${player.avatarUrl}`} alt={player.name} className="w-12 h-12 rounded-full object-cover border-2 border-slate-600 shadow-sm" />
                             ) : (
                               <div key={i} className="w-12 h-12 bg-slate-800 rounded-full border-2 border-slate-600 flex items-center justify-center shadow-sm">
                                 <span className="text-[16px] font-black text-slate-500 uppercase">{player.name.substring(0,2)}</span>
                               </div>
                             )
                           )
                        ))}
                      </div>
                    )}
                  </div>"""

new_teama = """                  <div className="flex-1 flex flex-col min-w-0 pr-4">
                    {m.teamAId && t.teamNames && t.teamNames[m.teamAId] && (
                      <span className="text-[13px] text-purple-400 font-black uppercase tracking-widest mb-3">
                        "{t.teamNames[m.teamAId]}"
                      </span>
                    )}
                    {m.teamA && (
                      <div className="flex items-center gap-4 justify-start">
                        {[m.teamA.player1, m.teamA.player2].map((player, i) => (
                           player && (
                             player.avatarUrl ? (
                               <img key={i} src={`/players/${player.avatarUrl}`} alt={player.name} className="w-24 h-24 rounded-full object-cover border-[3px] border-slate-600 shadow-lg" />
                             ) : (
                               <div key={i} className="w-24 h-24 bg-slate-800 rounded-full border-[3px] border-slate-600 flex items-center justify-center shadow-lg">
                                 <span className="text-3xl font-black text-slate-500 uppercase">{player.name.substring(0,2)}</span>
                               </div>
                             )
                           )
                        ))}
                      </div>
                    )}
                    <span className="text-xl font-bold leading-tight text-slate-200 mt-4">
                      {m.teamA ? `${m.teamA.player1.name} & ${m.teamA.player2.name}` : "TBD"}
                    </span>
                  </div>"""

# Replace Team B
old_teamb = """                  <div className="flex-1 flex flex-col min-w-0 pl-2 text-right">
                    {m.teamBId && t.teamNames && t.teamNames[m.teamBId] && (
                      <span className="text-xs text-purple-400 font-bold uppercase tracking-wider mb-1">
                        "{t.teamNames[m.teamBId]}"
                      </span>
                    )}
                    <span className="text-lg font-bold leading-tight text-slate-200">
                      {m.teamB ? `${m.teamB.player1.name} & ${m.teamB.player2.name}` : "TBD"}
                    </span>
                    {m.teamB && (
                      <div className="flex items-center gap-2 mt-3 justify-end">
                        {[m.teamB.player1, m.teamB.player2].map((player, i) => (
                           player && (
                             player.avatarUrl ? (
                               <img key={i} src={`/players/${player.avatarUrl}`} alt={player.name} className="w-12 h-12 rounded-full object-cover border-2 border-slate-600 shadow-sm" />
                             ) : (
                               <div key={i} className="w-12 h-12 bg-slate-800 rounded-full border-2 border-slate-600 flex items-center justify-center shadow-sm">
                                 <span className="text-[16px] font-black text-slate-500 uppercase">{player.name.substring(0,2)}</span>
                               </div>
                             )
                           )
                        ))}
                      </div>
                    )}
                  </div>"""

new_teamb = """                  <div className="flex-1 flex flex-col items-end min-w-0 pl-4 text-right">
                    {m.teamBId && t.teamNames && t.teamNames[m.teamBId] && (
                      <span className="text-[13px] text-purple-400 font-black uppercase tracking-widest mb-3">
                        "{t.teamNames[m.teamBId]}"
                      </span>
                    )}
                    {m.teamB && (
                      <div className="flex items-center gap-4 justify-end">
                        {[m.teamB.player1, m.teamB.player2].map((player, i) => (
                           player && (
                             player.avatarUrl ? (
                               <img key={i} src={`/players/${player.avatarUrl}`} alt={player.name} className="w-24 h-24 rounded-full object-cover border-[3px] border-slate-600 shadow-lg" />
                             ) : (
                               <div key={i} className="w-24 h-24 bg-slate-800 rounded-full border-[3px] border-slate-600 flex items-center justify-center shadow-lg">
                                 <span className="text-3xl font-black text-slate-500 uppercase">{player.name.substring(0,2)}</span>
                               </div>
                             )
                           )
                        ))}
                      </div>
                    )}
                    <span className="text-xl font-bold leading-tight text-slate-200 mt-4">
                      {m.teamB ? `${m.teamB.player1.name} & ${m.teamB.player2.name}` : "TBD"}
                    </span>
                  </div>"""

if old_teama in content:
    content = content.replace(old_teama, new_teama, 1) 
    print("Patched Team A")
else:
    print("Could not find Team A block")

if old_teamb in content:
    content = content.replace(old_teamb, new_teamb, 1)
    print("Patched Team B")
else:
    print("Could not find Team B block")

with open('src/components/TVSlideshow.tsx', 'w') as f:
    f.write(content)
