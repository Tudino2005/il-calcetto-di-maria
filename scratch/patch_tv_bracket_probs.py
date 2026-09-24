import re

with open('src/components/TVSlideshow.tsx', 'r') as f:
    content = f.read()

old_block = """                      {matchProbs.has(m.id) && (
                        <span className="text-[19px] text-yellow-500/90 font-black tracking-wider text-right uppercase">WIN: {matchProbs.get(m.id).teamAProb.toFixed(0)}%</span>
                      )}
                      <div className="bg-slate-950 px-8 py-5 rounded-3xl text-5xl font-black text-white shadow-inner flex flex-col items-center border-2 border-slate-800">
                        <span>VS</span>
                      </div>
                      {matchProbs.has(m.id) && (
                        <span className="text-[19px] text-yellow-500/90 font-black tracking-wider text-left uppercase">WIN: {matchProbs.get(m.id).teamBProb.toFixed(0)}%</span>
                      )}"""

new_block = """                      {matchProbs.has(m.id) && (
                        <div className="flex flex-col items-center justify-center text-yellow-500/90">
                          <span className="text-xs font-bold tracking-widest uppercase mb-1 opacity-80">Win</span>
                          <span className="text-2xl font-black leading-none">{matchProbs.get(m.id).teamAProb.toFixed(0)}%</span>
                        </div>
                      )}
                      <div className="bg-slate-950 px-8 py-5 mx-2 rounded-3xl text-5xl font-black text-white shadow-inner flex flex-col items-center border-2 border-slate-800">
                        <span>VS</span>
                      </div>
                      {matchProbs.has(m.id) && (
                        <div className="flex flex-col items-center justify-center text-yellow-500/90">
                          <span className="text-xs font-bold tracking-widest uppercase mb-1 opacity-80">Win</span>
                          <span className="text-2xl font-black leading-none">{matchProbs.get(m.id).teamBProb.toFixed(0)}%</span>
                        </div>
                      )}"""

if old_block in content:
    content = content.replace(old_block, new_block)
    print("Patched win probabilities")
else:
    print("Could not find win probabilities block")

with open('src/components/TVSlideshow.tsx', 'w') as f:
    f.write(content)

