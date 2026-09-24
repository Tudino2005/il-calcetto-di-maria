import re

with open('src/app/page.tsx', 'r') as f:
    content = f.read()

content = content.replace('status: { in: ["in_progress", "drawing"] }', 'status: { in: ["in_progress", "drawing", "matches_drawing"] }')

with open('src/app/page.tsx', 'w') as f:
    f.write(content)

print("Patched page.tsx query!")
