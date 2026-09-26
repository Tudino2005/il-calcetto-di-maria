import re

with open('src/components/TVSlideshow.tsx', 'r') as f:
    content = f.read()

# Fix the specific line 1648 (which now has "A" instead of "B")
content = content.replace(
    '{m.teamB ? `${m.teamB.player1.name} & ${m.teamB.player2.name}` : getFeederMatchInfo(currentSlide.tournament, m.id, "A")}',
    '{m.teamB ? `${m.teamB.player1.name} & ${m.teamB.player2.name}` : getFeederMatchInfo(currentSlide.tournament, m.id, "B")}'
)

with open('src/components/TVSlideshow.tsx', 'w') as f:
    f.write(content)

print("Fixed!")
