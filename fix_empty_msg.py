import re
with open("src/app/players/[id]/page.tsx", "r") as f:
    content = f.read()
content = content.replace("Nessuna partita libera giocata finora", "Nessuna partita giocata finora")
with open("src/app/players/[id]/page.tsx", "w") as f:
    f.write(content)
