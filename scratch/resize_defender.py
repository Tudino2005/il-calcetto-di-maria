import re

with open('src/components/TVSlideshow.tsx', 'r') as f:
    content = f.read()

# Leaderboard sizing
content = content.replace(
    '<img src="/images/defender_icon_gold.png" alt="Defender" className="h-7 w-12 rounded-md object-cover shadow-sm border border-slate-600" />',
    '<img src="/images/defender_icon_gold.png" alt="Defender" className="h-[42px] w-[72px] object-contain drop-shadow-md" />'
)

# Player stats sizing
content = content.replace(
    '<img src="/images/defender_icon_gold.png" alt="Defender" className="h-8 w-14 rounded-md object-cover shadow-md border-2 border-slate-600" />',
    '<img src="/images/defender_icon_gold.png" alt="Defender" className="h-[48px] w-[84px] object-contain drop-shadow-md" />'
)

with open('src/components/TVSlideshow.tsx', 'w') as f:
    f.write(content)

print("Resized defender icon")
