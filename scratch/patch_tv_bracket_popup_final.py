import re

with open('src/components/TVSlideshow.tsx', 'r') as f:
    content = f.read()

# 1. Widen the card
content = content.replace('scale-[1.6]\' : \'scale-50\'} w-full max-w-[1100px]', 'scale-[1.6]\' : \'scale-50\'} w-[90vw] max-w-[1500px]')

# 2. Fix the avatars squishing (add shrink-0 aspect-square)
content = content.replace('className="w-40 h-40 rounded-full object-cover', 'className="w-40 h-40 shrink-0 aspect-square rounded-full object-cover')
content = content.replace('className="w-40 h-40 bg-slate-800 rounded-full', 'className="w-40 h-40 shrink-0 aspect-square bg-slate-800 rounded-full')

# 3. Move the Date Pill
date_pill_block = """                {(() => {
                  const dateToUse = m.scheduledAt || tournament.startDate;
                  if (!dateToUse) return null;
                  return (
                    <div className="text-lg font-black text-white bg-pink-500 px-6 py-2 rounded-xl mt-3 shadow-lg">
                      {new Date(dateToUse).toLocaleDateString('it-IT')} {m.scheduledAt ? `alle ${new Date(dateToUse).toLocaleTimeString('it-IT', {hour: '2-digit', minute:'2-digit'})}` : ''}
                    </div>
                  );
                })()}"""

# We remove it from its current position at the end of the popup
if date_pill_block in content:
    content = content.replace(date_pill_block, "")
else:
    print("WARNING: Could not find date pill block to remove!")

# And we insert it into the center VS block
old_vs_block = """                  {/* VS BADGE */}
                  <div className="shrink-0 flex flex-col items-center justify-center self-center mx-4 gap-4 mt-8">
                    <div className="flex items-center gap-4">"""

new_vs_block = """                  {/* VS BADGE */}
                  <div className="shrink-0 flex flex-col items-center justify-center self-center mx-4 gap-6 mt-2">
                    {(() => {
                      const dateToUse = m.scheduledAt || t.startDate;
                      if (!dateToUse) return null;
                      return (
                        <div className="text-xl font-black text-white bg-pink-500 px-8 py-3 rounded-2xl shadow-lg border-2 border-pink-400">
                          {new Date(dateToUse).toLocaleDateString('it-IT')} {m.scheduledAt ? `alle ${new Date(dateToUse).toLocaleTimeString('it-IT', {hour: '2-digit', minute:'2-digit'})}` : ''}
                        </div>
                      );
                    })()}
                    <div className="flex items-center gap-4">"""

if old_vs_block in content:
    content = content.replace(old_vs_block, new_vs_block)
else:
    print("WARNING: Could not find VS block to replace!")

with open('src/components/TVSlideshow.tsx', 'w') as f:
    f.write(content)

print("Patched popup layout and date position")
