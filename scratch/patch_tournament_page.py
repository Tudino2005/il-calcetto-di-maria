import re

with open('src/app/tournaments/[id]/page.tsx', 'r') as f:
    content = f.read()

old_draw_check = 'if (draw === "true" && tournament.format !== "coppie_fisse" && tournament.format !== "sorteggio_integrale") {'
new_draw_check = 'if (draw === "true" && tournament.status !== "in_progress") {'

content = content.replace(old_draw_check, new_draw_check)

with open('src/app/tournaments/[id]/page.tsx', 'w') as f:
    f.write(content)

print("Patched page.tsx!")
