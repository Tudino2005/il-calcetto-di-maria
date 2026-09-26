import re

with open('src/app/page.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    "orderBy: [{ points: 'desc' }, { goalDifference: 'desc' }]",
    "orderBy: [{ points: 'desc' }, { won: 'desc' }]"
)

with open('src/app/page.tsx', 'w') as f:
    f.write(content)

print("Patched orderBy!")
