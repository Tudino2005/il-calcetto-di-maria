import re

with open("src/components/TVSlideshow.tsx", "r") as f:
    content = f.read()

# Replace for player stats
content = content.replace(
    '<span className="text-slate-500 text-sm">/ {p.played} G</span>',
    '<span className="text-blue-400">/ {p.played} G</span>'
)

# Replace for team stats
content = content.replace(
    '<span className="text-slate-500 text-sm">/ {t.played} G</span>',
    '<span className="text-blue-400">/ {t.played} G</span>'
)

with open("src/components/TVSlideshow.tsx", "w") as f:
    f.write(content)
