import re

with open("src/components/TVSlideshow.tsx", "r") as f:
    content = f.read()

# For players
content = content.replace(
    '{playerStats.map((p: any, i: number) => {',
    '{playerStats.slice(1).map((p: any, i: number) => {'
)
content = content.replace(
    'const rank = i + 1;',
    'const rank = i + 2;'
)

# For teams
content = content.replace(
    '{teamStats.map((t: any, i: number) => {',
    '{teamStats.slice(1).map((t: any, i: number) => {'
)

with open("src/components/TVSlideshow.tsx", "w") as f:
    f.write(content)
