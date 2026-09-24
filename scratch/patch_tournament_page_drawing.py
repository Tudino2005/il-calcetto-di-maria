import re

with open('src/app/tournaments/[id]/page.tsx', 'r') as f:
    content = f.read()

old_logic = 'if (tournament.status === "drawing") {'
new_logic = 'if (tournament.status === "drawing" || tournament.status === "matches_drawing") {'

content = content.replace(old_logic, new_logic)

with open('src/app/tournaments/[id]/page.tsx', 'w') as f:
    f.write(content)

print("Patched drawing status in tournament detail page!")
