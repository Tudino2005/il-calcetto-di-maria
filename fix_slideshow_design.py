import re

with open("src/components/TVSlideshow.tsx", "r") as f:
    content = f.read()

# Pattern for the player row
pattern_player = r'(                      <div key=\{p\.id\} className="flex items-center gap-6 bg-slate-800/80 p-6 rounded-3xl border border-slate-700/50">\n\s*<div className=\{`w-14 h-14 shrink-0 rounded-full flex items-center justify-center font-black text-2xl shadow-inner \$\{\n\s*rank === 1 \? "bg-yellow-500 text-yellow-950" :\n\s*rank === 2 \? "bg-slate-300 text-slate-900" :\n\s*rank === 3 \? "bg-orange-700 text-orange-100" :\n\s*"bg-slate-700 text-white"\n\s*\}\`\}>\n\s*\{rank\}\n\s*<\/div>\n\s*<div className="flex-1 min-w-0">\n\s*<div className="text-2xl font-bold text-white truncate">\{p\.name\}<\/div>\n\s*<div className="text-slate-400 text-lg whitespace-nowrap">\{p\.wins\} Vittorie <span className="mx-2">•<\/span> \{p\.winRate\}% WR<\/div>\n\s*<\/div>\n\s*<\/div>)'

replacement_player = """                      <div key={p.id} className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 px-6 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-6 min-w-0">
                          <div className={`text-3xl font-black w-8 text-center shrink-0 ${
                            rank === 1 ? "text-yellow-500" :
                            rank === 2 ? "text-slate-300" :
                            rank === 3 ? "text-orange-400" :
                            "text-slate-600"
                          }`}>
                            {rank}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <div className="text-2xl font-bold text-white truncate leading-tight">{p.name}</div>
                            <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">{p.preferredRole || "GIOCATORE"}</div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end shrink-0 ml-4">
                          <div className="text-xl font-black flex items-baseline gap-1">
                            <span className="text-emerald-400">{p.wins} V</span>
                            <span className="text-slate-500 text-sm">/ {p.played} G</span>
                          </div>
                          <div className="text-yellow-500 font-black text-lg">
                            {p.winRate}% WR
                          </div>
                        </div>
                      </div>"""

content = re.sub(pattern_player, replacement_player, content)


# Pattern for the team row
pattern_team = r'(                      <div key=\{t\.id\} className="flex items-center gap-6 bg-slate-800/80 p-6 rounded-3xl border border-slate-700/50">\n\s*<div className=\{`w-14 h-14 shrink-0 rounded-full flex items-center justify-center font-black text-2xl shadow-inner \$\{\n\s*rank === 1 \? "bg-yellow-500 text-yellow-950" :\n\s*rank === 2 \? "bg-slate-300 text-slate-900" :\n\s*rank === 3 \? "bg-orange-700 text-orange-100" :\n\s*"bg-slate-700 text-white"\n\s*\}\`\}>\n\s*\{rank\}\n\s*<\/div>\n\s*<div className="flex-1 min-w-0">\n\s*<div className="text-2xl font-bold text-white truncate">\{t\.player1\.name\} & \{t\.player2\.name\}<\/div>\n\s*<div className="text-slate-400 text-lg whitespace-nowrap">\{t\.wins\} Vittorie <span className="mx-2">•<\/span> \{t\.winRate\}% WR<\/div>\n\s*<\/div>\n\s*<\/div>)'

replacement_team = """                      <div key={t.id} className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 px-6 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-6 min-w-0">
                          <div className={`text-3xl font-black w-8 text-center shrink-0 ${
                            rank === 1 ? "text-yellow-500" :
                            rank === 2 ? "text-slate-300" :
                            rank === 3 ? "text-orange-400" :
                            "text-slate-600"
                          }`}>
                            {rank}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <div className="text-xl font-bold text-white truncate leading-tight">{t.player1.name}</div>
                            <div className="text-xl font-bold text-white truncate leading-tight">{t.player2.name}</div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end shrink-0 ml-4">
                          <div className="text-xl font-black flex items-baseline gap-1">
                            <span className="text-emerald-400">{t.wins} V</span>
                            <span className="text-slate-500 text-sm">/ {t.played} G</span>
                          </div>
                          <div className="text-yellow-500 font-black text-lg">
                            {t.winRate}% WR
                          </div>
                        </div>
                      </div>"""

content = re.sub(pattern_team, replacement_team, content)


with open("src/components/TVSlideshow.tsx", "w") as f:
    f.write(content)
