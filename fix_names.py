import re

with open("src/components/TVSlideshow.tsx", "r") as f:
    content = f.read()

# Replace Team A formatting
content = content.replace(
    'className={`flex-1 text-right text-3xl font-bold truncate ${teamAWon ? \'text-white\' : \'text-slate-500\'}`}',
    'className={`flex-1 text-right text-2xl font-bold leading-tight ${teamAWon ? \'text-white\' : \'text-slate-500\'}`}'
)

# Replace Team B formatting
content = content.replace(
    'className={`flex-1 text-left text-3xl font-bold truncate ${teamBWon ? \'text-white\' : \'text-slate-500\'}`}',
    'className={`flex-1 text-left text-2xl font-bold leading-tight ${teamBWon ? \'text-white\' : \'text-slate-500\'}`}'
)

with open("src/components/TVSlideshow.tsx", "w") as f:
    f.write(content)
