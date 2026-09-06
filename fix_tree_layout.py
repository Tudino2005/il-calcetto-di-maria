import sys

with open("src/components/TVSlideshow.tsx", "r") as f:
    content = f.read()

start_marker = '<div key={m.id || mIndex} className={`p-4 rounded-xl border flex flex-col gap-3 relative shadow-md transition-all ${m.winnerTeamId ? \'bg-slate-900/80 border-slate-700\' : \'bg-slate-800 border-slate-600\'}`}>'
end_marker = '                             </div>\n                           ))}\n                         </div>'

start_idx = content.find(start_marker)
if start_idx == -1:
    print("Start marker not found")
    sys.exit(1)

end_idx = content.find(end_marker, start_idx)
if end_idx == -1:
    print("End marker not found")
    sys.exit(1)

new_block = """<div key={m.id || mIndex} className={`p-4 rounded-xl border flex flex-col justify-center items-center gap-2 relative shadow-md transition-all ${m.winnerTeamId ? 'bg-slate-900/80 border-slate-700' : 'bg-slate-800 border-slate-600'}`}>
                                <div className="flex justify-between items-center w-full">
                                  <span className={`text-sm font-bold flex-1 leading-tight ${m.winnerTeamId === m.teamAId ? 'text-emerald-400 font-black' : 'text-slate-300'}`}>
                                    {m.teamA ? `${m.teamA.player1.name} & ${m.teamA.player2.name}` : "TBD"}
                                  </span>
                                  <div className="shrink-0 bg-slate-950 px-2 py-0.5 rounded text-sm font-black text-white shadow-inner mx-2">
                                    {m.winnerTeamId ? `${m.scoreTeamA} - ${m.scoreTeamB}` : 'VS'}
                                  </div>
                                  <span className={`text-sm font-bold flex-1 text-right leading-tight ${m.winnerTeamId === m.teamBId ? 'text-emerald-400 font-black' : 'text-slate-300'}`}>
                                    {m.teamB ? `${m.teamB.player1.name} & ${m.teamB.player2.name}` : "TBD"}
                                  </span>
                                </div>
                                {(() => {
                                  const dateToUse = m.scheduledAt || currentSlide.tournament.startDate;
                                  if (!dateToUse) return <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Data da definire</div>;
                                  return (
                                    <div className="text-[10px] font-black text-blue-400 bg-blue-500/20 px-2 py-0.5 rounded mt-1">
                                      {new Date(dateToUse).toLocaleDateString('it-IT')} {m.scheduledAt ? `alle ${new Date(dateToUse).toLocaleTimeString('it-IT', {hour: '2-digit', minute:'2-digit'})}` : ''}
                                    </div>
                                  );
                                })()}
"""

new_content = content[:start_idx] + new_block + content[end_idx:]

with open("src/components/TVSlideshow.tsx", "w") as f:
    f.write(new_content)

