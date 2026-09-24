import re

with open('src/components/TVSlideshow.tsx', 'r') as f:
    content = f.read()

start_marker = '<div className="flex justify-between items-center w-full">'
end_marker = '{(() => {'

start_idx = content.find(start_marker)
end_idx = content.find(end_marker, start_idx)

if start_idx != -1 and end_idx != -1:
    old_block = content[start_idx:end_idx]
    
    new_block = """<div className="flex justify-between items-start w-full">
                  {/* TEAM A */}
                  <div className="flex-1 flex flex-col min-w-0 px-2 items-center">
                    {m.teamAId && t.teamNames && t.teamNames[m.teamAId] && (
                      <span className="text-sm text-purple-400 font-black uppercase tracking-widest mb-6 text-center">
                        "{t.teamNames[m.teamAId]}"
                      </span>
                    )}
                    {m.teamA ? (
                      <div className="flex items-start justify-center gap-6 w-full">
                        {[m.teamA.player1, m.teamA.player2].map((player, i) => (
                           player && (
                             <div key={i} className="flex flex-col items-center gap-4 flex-1">
                               {player.avatarUrl ? (
                                 <img src={`/players/${player.avatarUrl}`} alt={player.name} className="w-40 h-40 rounded-full object-cover border-4 border-slate-500 shadow-2xl" />
                               ) : (
                                 <div className="w-40 h-40 bg-slate-800 rounded-full border-4 border-slate-600 flex items-center justify-center shadow-2xl">
                                   <span className="text-5xl font-black text-slate-500 uppercase">{player.name.substring(0,2)}</span>
                                 </div>
                               )}
                               <span className="text-2xl font-bold leading-tight text-white text-center break-words w-full">
                                 {player.name}
                               </span>
                             </div>
                           )
                        ))}
                      </div>
                    ) : (
                      <span className="text-2xl font-bold text-slate-500 mt-10">TBD</span>
                    )}
                  </div>

                  {/* VS BADGE */}
                  <div className="shrink-0 flex flex-col items-center justify-center self-center mx-4 gap-4 mt-8">
                    <div className="flex items-center gap-4">
                      {matchProbs.has(m.id) && (
                        <span className="text-[19px] text-yellow-500/90 font-black tracking-wider text-right uppercase">WIN: {matchProbs.get(m.id).teamAProb.toFixed(0)}%</span>
                      )}
                      <div className="bg-slate-950 px-8 py-5 rounded-3xl text-5xl font-black text-white shadow-inner flex flex-col items-center border-2 border-slate-800">
                        <span>VS</span>
                      </div>
                      {matchProbs.has(m.id) && (
                        <span className="text-[19px] text-yellow-500/90 font-black tracking-wider text-left uppercase">WIN: {matchProbs.get(m.id).teamBProb.toFixed(0)}%</span>
                      )}
                    </div>
                  </div>

                  {/* TEAM B */}
                  <div className="flex-1 flex flex-col min-w-0 px-2 items-center">
                    {m.teamBId && t.teamNames && t.teamNames[m.teamBId] && (
                      <span className="text-sm text-purple-400 font-black uppercase tracking-widest mb-6 text-center">
                        "{t.teamNames[m.teamBId]}"
                      </span>
                    )}
                    {m.teamB ? (
                      <div className="flex items-start justify-center gap-6 w-full">
                        {[m.teamB.player1, m.teamB.player2].map((player, i) => (
                           player && (
                             <div key={i} className="flex flex-col items-center gap-4 flex-1">
                               {player.avatarUrl ? (
                                 <img src={`/players/${player.avatarUrl}`} alt={player.name} className="w-40 h-40 rounded-full object-cover border-4 border-slate-500 shadow-2xl" />
                               ) : (
                                 <div className="w-40 h-40 bg-slate-800 rounded-full border-4 border-slate-600 flex items-center justify-center shadow-2xl">
                                   <span className="text-5xl font-black text-slate-500 uppercase">{player.name.substring(0,2)}</span>
                                 </div>
                               )}
                               <span className="text-2xl font-bold leading-tight text-white text-center break-words w-full">
                                 {player.name}
                               </span>
                             </div>
                           )
                        ))}
                      </div>
                    ) : (
                      <span className="text-2xl font-bold text-slate-500 mt-10">TBD</span>
                    )}
                  </div>
                </div>
                """

    content = content.replace(old_block, new_block)
    
    # Also adjust the container max-width to allow these huge avatars to fit perfectly
    content = content.replace('scale-50} w-full max-w-[900px]', 'scale-50} w-full max-w-[1100px]')
    content = content.replace('p-6 rounded-2xl border-4', 'p-10 rounded-3xl border-4')

    with open('src/components/TVSlideshow.tsx', 'w') as f:
        f.write(content)
    print("Patched entire VS block")
else:
    print("Could not find the block boundaries")

