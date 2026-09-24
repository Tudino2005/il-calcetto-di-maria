import re

with open('src/components/TVSlideshow.tsx', 'r') as f:
    content = f.read()

# Add the renderRoleBadge helper before `return (` of the TVSlideshow component
# Or just inline it directly. Let's inline it directly to avoid placing it in a bad scope.
badge_code = """{p.preferredRole && (() => {
                              const r = p.preferredRole.toLowerCase();
                              if (r === 'portiere' || r === 'difensore') return <span className="bg-blue-600 text-white font-black px-3 py-1 rounded-md tracking-widest text-[10px] uppercase shadow-sm">Defender</span>;
                              if (r === 'attaccante') return <span className="bg-red-600 text-white font-black px-3 py-1 rounded-md tracking-widest text-[10px] uppercase shadow-sm">Striker</span>;
                              if (r === 'entrambi') return <span className="bg-purple-600 text-white font-black px-3 py-1 rounded-md tracking-widest text-[10px] uppercase shadow-sm">Jolly</span>;
                              return null;
                            })()}"""

tp_badge_code = badge_code.replace('p.preferredRole', 'tp.preferredRole')

start_marker = '          {currentSlide.type === "leaderboard" && ('
end_marker = '          {currentSlide.type === "leaderboard_roles" && ('

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

global_code = content[start_idx:end_idx]

# In global_code, find the player name rendering and append the badge.
# For top 1 player:
# `<div className="text-3xl font-black text-white truncate leading-tight">{tp.name}</div>`
# Wait, let's wrap it in a flex container so it pushes the badge to the center/right, or just put it next to the name.
# The user said "al centro il ruolo del giocatore".
# If I make the parent `flex-1`, it takes up space, and the badge can sit on the right of the name or in the center of the row.
# Currently it's:
# <div className="flex items-center gap-3">
#   <div className="text-3xl font-black text-white truncate leading-tight">{tp.name}</div>
# </div>
# I will change it to:
# <div className="flex items-center gap-4 flex-1 justify-between pr-4">
#   <div className="text-3xl font-black text-white truncate leading-tight">{tp.name}</div>
#   {tp_badge_code}
# </div>
# Actually, if I just put it in the flex gap, it will be immediately after the name. The user said "al centro". If it's `justify-between`, it will be on the right side before the win stats. Let's just put it next to the name with a margin left.

global_code = global_code.replace(
    '<div className="flex items-center gap-3">\n                                                            <div className="text-3xl font-black text-white truncate leading-tight">{tp.name}</div>\n\n                            </div>',
    f'<div className="flex items-center gap-3 flex-1 justify-between pr-6">\n                                                            <div className="text-3xl font-black text-white truncate leading-tight">{{tp.name}}</div>\n                                                            {tp_badge_code}\n                            </div>'
)

# For the list players:
# <div className="flex items-center gap-3">
#   <div className="text-2xl font-bold text-white truncate leading-tight">{p.name}</div>
# </div>
global_code = global_code.replace(
    '<div className="flex items-center gap-3">\n                              <div className="text-2xl font-bold text-white truncate leading-tight">{p.name}</div>\n                            </div>',
    f'<div className="flex items-center gap-3 flex-1 justify-between pr-6">\n                              <div className="text-2xl font-bold text-white truncate leading-tight">{{p.name}}</div>\n                              {badge_code}\n                            </div>'
)

content = content[:start_idx] + global_code + content[end_idx:]

with open('src/components/TVSlideshow.tsx', 'w') as f:
    f.write(content)

print("Badges added")
