import re

with open("src/components/TVSlideshow.tsx", "r") as f:
    content = f.read()

old_block = """                                  <span className={`w-8 text-center rounded py-1 ${m.winnerTeamId === m.teamBId ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-950 text-white'}`}>{m.scoreTeamB}</span>
                                </div>
                             </div>"""

new_block = """                                  <span className={`w-8 text-center rounded py-1 ${m.winnerTeamId === m.teamBId ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-950 text-white'}`}>{m.scoreTeamB}</span>
                                </div>
                                {!m.winnerTeamId && (
                                  <div className="text-[10px] text-center font-bold uppercase tracking-wider mt-1 text-slate-500">
                                    {m.scheduledAt ? `${new Date(m.scheduledAt).toLocaleDateString('it-IT')} - ${new Date(m.scheduledAt).toLocaleTimeString('it-IT', {hour: '2-digit', minute:'2-digit'})}` : 'Da programmare'}
                                  </div>
                                )}
                             </div>"""

content = content.replace(old_block, new_block)

with open("src/components/TVSlideshow.tsx", "w") as f:
    f.write(content)

