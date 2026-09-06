import re

with open("src/components/TVSlideshow.tsx", "r") as f:
    content = f.read()

old_match_block = """                        <div key={m.id} className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 flex justify-between items-center text-lg font-bold">
                          <span className="text-white flex-1 leading-tight">{m.teamA?.player1?.name} <span className="text-slate-500 text-sm mx-1">&</span> {m.teamA?.player2?.name}</span>
                          <span className="text-slate-500 mx-4 shrink-0">VS</span>
                          <span className="text-white flex-1 text-right leading-tight">{m.teamB?.player1?.name} <span className="text-slate-500 text-sm mx-1">&</span> {m.teamB?.player2?.name}</span>
                        </div>"""

new_match_block = """                        <div key={m.id} className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 flex flex-col justify-center items-center text-lg font-bold gap-2">
                          <div className="flex justify-between w-full items-center">
                            <span className="text-white flex-1 leading-tight">{m.teamA?.player1?.name} <span className="text-slate-500 text-sm mx-1">&</span> {m.teamA?.player2?.name}</span>
                            <span className="text-slate-500 mx-4 shrink-0">VS</span>
                            <span className="text-white flex-1 text-right leading-tight">{m.teamB?.player1?.name} <span className="text-slate-500 text-sm mx-1">&</span> {m.teamB?.player2?.name}</span>
                          </div>
                          {m.scheduledAt ? (
                            <div className="text-xs font-black text-blue-400 bg-blue-500/20 px-3 py-1 rounded-lg">
                              {new Date(m.scheduledAt).toLocaleDateString('it-IT')} alle {new Date(m.scheduledAt).toLocaleTimeString('it-IT', {hour: '2-digit', minute:'2-digit'})}
                            </div>
                          ) : (
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                              Data da programmare
                            </div>
                          )}
                        </div>"""

content = content.replace(old_match_block, new_match_block)

with open("src/components/TVSlideshow.tsx", "w") as f:
    f.write(content)

