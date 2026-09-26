import re

with open('src/app/actions/tournamentActions.ts', 'r') as f:
    content = f.read()

content = content.replace(
    'const allowRoleSwaps = allowRoleSwapsStr === "true";',
    'const allowRoleSwaps = allowRoleSwapsStr === "true";\n  const isBalancedDraw = formData.get("isBalancedDraw") === "true";'
)

with open('src/app/actions/tournamentActions.ts', 'w') as f:
    f.write(content)

print("Patched createTournament again!")
