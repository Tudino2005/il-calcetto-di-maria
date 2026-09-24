import re

with open('src/components/TVSlideshow.tsx', 'r') as f:
    content = f.read()

# Replace Team A
old_teama = """                    <span className="text-lg font-bold leading-tight text-slate-200">
                      {m.teamA ? `${m.teamA.player1.name} & ${m.teamA.player2.name}` : "TBD"}
                    </span>
                  </div>"""

new_teama = """                    <span className="text-lg font-bold leading-tight text-slate-200">
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

# Replace Team B
old_teamb = """                    <span className="text-lg font-bold leading-tight text-slate-200">
                      {m.teamB ? `${m.teamB.player1.name} & ${m.teamB.player2.name}` : "TBD"}
                    </span>
                  </div>"""

new_teamb = """                    <span className="text-lg font-bold leading-tight text-slate-200">
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


if old_teama in content:
    content = content.replace(old_teama, new_teama, 1) # Only replace the first occurrence (which is inside the popup manager)
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
