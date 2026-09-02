import re

with open("src/app/tournaments/[id]/page.tsx", "r") as f:
    content = f.read()

content = content.replace(
    '  if (tournament.status === "setup") {',
    '  if (tournament.status === "setup" || tournament.status === "ready_to_draw") {'
)

with open("src/app/tournaments/[id]/page.tsx", "w") as f:
    f.write(content)
