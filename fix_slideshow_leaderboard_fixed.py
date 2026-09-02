import re

with open("src/components/TVSlideshow.tsx", "r") as f:
    content = f.read()

# PLAYER STATS
# 1. Isolate the fixed card for singles
player_fixed = """
                <div className="shrink-0 z-20 relative pb-6 border-b border-slate-700/50 mb-6">
                  {playerStats[0] && (
                    <div className="mb-6 flex items-center gap-6 bg-slate-900 border-2 border-yellow-500/50 p-6 rounded-3xl w-full shadow-[0_0_30px_rgba(234,179,8,0.15)] relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <Medal className="w-24 h-24 text-yellow-500" />
                      </div>
                      <div className="w-16 flex-shrink-0 text-center font-black text-6xl text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.6)]">
                        1
                      </div>
                      <div className="flex-1 flex flex-col justify-center min-w-0 z-10">
                        <div className="text-3xl font-black text-white truncate leading-tight">{playerStats[0].name}</div>
                        <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">
                          {playerStats[0].preferredRole}
                        </div>
                      </div>
                      <div className="flex flex-col items-end shrink-0 ml-4 z-10">
                        <div className="text-2xl font-black flex items-baseline gap-1">
                          <span className="text-emerald-400">{playerStats[0].wins} V</span>
                          <span className="text-blue-400">/ {playerStats[0].played} G</span>
                        </div>
                        <div className="text-yellow-500 font-black text-xl">
                          {playerStats[0].winRate}%
                        </div>
                      </div>
                    </div>
                  )}
                  <h3 className="text-3xl font-bold text-center flex items-center justify-center gap-4 text-white uppercase tracking-widest drop-shadow-[0_0_10px_rgba(250,204,21,0.2)]">
                    <Medal className="w-10 h-10 text-yellow-500" /> Classifica Singoli
                  </h3>
                </div>
"""
content = re.sub(
    r'<div className="shrink-0 z-20 relative pb-6 border-b border-slate-700/50 mb-6">\s*<h3 className="text-4xl font-bold text-center flex items-center justify-center gap-4 text-white uppercase tracking-widest drop-shadow-\[0_0_10px_rgba\(250,204,21,0\.2\)\]">\s*<Medal className="w-12 h-12 text-yellow-500" /> Top Singoli\s*</h3>\s*</div>',
    player_fixed.strip(),
    content
)

# 2. Make singles scroll start at 2
content = content.replace(
    '{playerStats.map((p: any, index: number) => (',
    '{playerStats.slice(1).map((p: any, index: number) => {\n                      const realIndex = index + 1;\n                      return ('
)
content = content.replace(
    'index === 0 ? "text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" :',
    'realIndex === 0 ? "text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" :'
)
content = content.replace(
    'index === 1 ? "text-slate-300 drop-shadow-[0_0_8px_rgba(203,213,225,0.5)]" :',
    'realIndex === 1 ? "text-slate-300 drop-shadow-[0_0_8px_rgba(203,213,225,0.5)]" :'
)
content = content.replace(
    'index === 2 ? "text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.5)]" :',
    'realIndex === 2 ? "text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.5)]" :'
)
content = content.replace(
    '{index + 1}',
    '{realIndex + 1}'
)
# Close the return block for singles
content = re.sub(
    r'(<div className="text-yellow-500 font-black text-lg">\s*\{p.winRate\}%\s*</div>\s*</div>\s*</div>\s*)\)\)}',
    r'\1);\n                    })}',
    content
)


# TEAM STATS
team_fixed = """
                <div className="shrink-0 z-20 relative pb-6 border-b border-slate-700/50 mb-6">
                  {teamStats[0] && (
                    <div className="mb-6 flex items-center gap-6 bg-slate-900 border-2 border-yellow-500/50 p-6 rounded-3xl w-full shadow-[0_0_30px_rgba(234,179,8,0.15)] relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <Users className="w-24 h-24 text-blue-500" />
                      </div>
                      <div className="w-16 flex-shrink-0 text-center font-black text-6xl text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.6)]">
                        1
                      </div>
                      <div className="flex-1 flex flex-col justify-center min-w-0 z-10">
                        <div className="text-3xl font-black text-white leading-tight">{teamStats[0].player1.name}</div>
                        <div className="text-3xl font-black text-white leading-tight">{teamStats[0].player2.name}</div>
                      </div>
                      <div className="flex flex-col items-end shrink-0 ml-4 z-10">
                        <div className="text-2xl font-black flex items-baseline gap-1">
                          <span className="text-emerald-400">{teamStats[0].wins} V</span>
                          <span className="text-blue-400">/ {teamStats[0].played} G</span>
                        </div>
                        <div className="text-yellow-500 font-black text-xl">
                          {teamStats[0].winRate}%
                        </div>
                      </div>
                    </div>
                  )}
                  <h3 className="text-3xl font-bold text-center flex items-center justify-center gap-4 text-white uppercase tracking-widest drop-shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                    <Users className="w-10 h-10 text-blue-400" /> Classifica Coppie
                  </h3>
                </div>
"""
content = re.sub(
    r'<div className="shrink-0 z-20 relative pb-6 border-b border-slate-700/50 mb-6">\s*<h3 className="text-4xl font-bold text-center flex items-center justify-center gap-4 text-white uppercase tracking-widest drop-shadow-\[0_0_10px_rgba\(59,130,246,0\.2\)\]">\s*<Users className="w-12 h-12 text-blue-400" /> Top Coppie\s*</h3>\s*</div>',
    team_fixed.strip(),
    content
)

# 2. Make teams scroll start at 2
content = content.replace(
    '{teamStats.map((t: any, index: number) => (',
    '{teamStats.slice(1).map((t: any, index: number) => {\n                      const realIndex = index + 1;\n                      return ('
)
content = content.replace(
    'realIndex === 1 ? "text-slate-300 drop-shadow-[0_0_8px_rgba(203,213,225,0.5)]" :', # Note: this was replaced incorrectly if it matched both, but let's check
    'realIndex === 1 ? "text-slate-300 drop-shadow-[0_0_8px_rgba(203,213,225,0.5)]" :'
)
# Actually, the string replacement logic for realIndex needs to be careful. I will use regex for safety on the team block.
content = re.sub(
    r'(<div key=\{t\.id\} className="flex items-center gap-6 bg-slate-900 border border-slate-700/50 p-5 rounded-3xl w-full">\s*<div className=\{`w-16 flex-shrink-0 text-center font-black text-5xl \$\{)\n\s*index === 0',
    r'\1\n                          realIndex === 0',
    content
)
content = re.sub(
    r'realIndex === 0 \? "text-yellow-500 drop-shadow-\[0_0_8px_rgba\(234,179,8,0\.5\)\]" :\n\s*index === 1',
    r'realIndex === 0 ? "text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" :\n                          realIndex === 1',
    content
)
content = re.sub(
    r'realIndex === 1 \? "text-slate-300 drop-shadow-\[0_0_8px_rgba\(203,213,225,0\.5\)\]" :\n\s*index === 2',
    r'realIndex === 1 ? "text-slate-300 drop-shadow-[0_0_8px_rgba(203,213,225,0.5)]" :\n                          realIndex === 2',
    content
)
# Close the return block for teams
content = re.sub(
    r'(<div className="text-yellow-500 font-black text-lg">\s*\{t.winRate\}%\s*</div>\s*</div>\s*</div>\s*)\)\)}',
    r'\1);\n                    })}',
    content
)

with open("src/components/TVSlideshow.tsx", "w") as f:
    f.write(content)
