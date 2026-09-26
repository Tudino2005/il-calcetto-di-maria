import re

with open('src/components/TVSlideshow.tsx', 'r') as f:
    content = f.read()

# Replace TBD for teamA in Loser Bracket
old_teamA_lb = '>{m.teamA ? `${m.teamA.player1.name} & ${m.teamA.player2.name}` : "TBD"}<'
new_teamA_lb = '>{m.teamA ? `${m.teamA.player1.name} & ${m.teamA.player2.name}` : getFeederMatchInfo(currentSlide.tournament, m.id, "A")}<'

content = content.replace(old_teamA_lb, new_teamA_lb)

# Replace TBD for teamB in Loser Bracket
old_teamB_lb = '>{m.teamB ? `${m.teamB.player1.name} & ${m.teamB.player2.name}` : "TBD"}<'
new_teamB_lb = '>{m.teamB ? `${m.teamB.player1.name} & ${m.teamB.player2.name}` : getFeederMatchInfo(currentSlide.tournament, m.id, "B")}<'

content = content.replace(old_teamB_lb, new_teamB_lb)

# Also in TVSlideshow, there are two lines with `mt-10">TBD</span>` (lines 94, 155)
content = content.replace('>TBD</span>', '>IN ATTESA</span>')

with open('src/components/TVSlideshow.tsx', 'w') as f:
    f.write(content)

print("Patched TVSlideshow.tsx LB!")
