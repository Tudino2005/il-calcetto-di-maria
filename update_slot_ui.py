import re

with open("src/components/SlotMachineDraw.tsx", "r") as f:
    content = f.read()

# I want to add the funny name to the formed teams list at the bottom
old_list = """                 <span className="text-white font-bold">{t.player1.name}</span>
                 <span className="text-slate-500 text-xs">&</span>
                 <span className="text-white font-bold">{t.player2.name}</span>"""

new_list = """                 <div className="flex flex-col">
                   {tournament.teamNames && tournament.teamNames[t.id] && (
                     <span className="text-emerald-400 font-black text-xs uppercase tracking-widest text-center mb-1">"{tournament.teamNames[t.id]}"</span>
                   )}
                   <div className="flex items-center gap-2">
                     <span className="text-white font-bold">{t.player1.name}</span>
                     <span className="text-slate-500 text-xs">&</span>
                     <span className="text-white font-bold">{t.player2.name}</span>
                   </div>
                 </div>"""

content = content.replace(old_list, new_list)

# Also when stopping the slot, we can show the name if showConfetti is true
# Wait, let's look for "Estrazione Coppia" text and place the team name there!
old_title = """           <div className="text-slate-400 font-bold uppercase tracking-widest mb-6 text-xl">
              Estrazione Coppia {revealedIndex + 1} di {teams.length}
           </div>"""

new_title = """           <div className="text-slate-400 font-bold uppercase tracking-widest mb-6 text-xl">
              Estrazione Coppia {revealedIndex + 1} di {teams.length}
           </div>
           
           {!spinning && showConfetti && tournament.teamNames && teams[revealedIndex] && tournament.teamNames[teams[revealedIndex].id] && (
              <div className="animate-in zoom-in slide-in-from-bottom-5 duration-500 mb-8 bg-emerald-500/20 border border-emerald-500/40 px-8 py-3 rounded-full shadow-[0_0_30px_rgba(52,211,153,0.3)]">
                <span className="text-3xl font-black text-emerald-400 uppercase tracking-widest">
                  "{tournament.teamNames[teams[revealedIndex].id]}"
                </span>
              </div>
           )}"""

content = content.replace(old_title, new_title)

with open("src/components/SlotMachineDraw.tsx", "w") as f:
    f.write(content)
