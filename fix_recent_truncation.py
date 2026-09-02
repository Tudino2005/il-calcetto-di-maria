import re

with open("src/components/TVSlideshow.tsx", "r") as f:
    content = f.read()

# Recent matches
content = content.replace(
    'className={`flex-1 text-right text-2xl font-bold leading-tight ${teamAWon ? \'text-white\' : \'text-slate-500\'}`}',
    'className={`flex-1 text-right text-2xl font-bold leading-tight ${teamAWon ? \'text-white\' : \'text-slate-500\'}`}'
)

with open("src/components/TVSlideshow.tsx", "w") as f:
    f.write(content)
