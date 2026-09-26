import re

with open('src/app/actions/tournamentActions.ts', 'r') as f:
    content = f.read()

# 1. Read isBalancedDraw from formData
content = content.replace(
    'const allowRoleSwaps = formData.get("allowRoleSwaps") === "true";',
    'const allowRoleSwaps = formData.get("allowRoleSwaps") === "true";\n  const isBalancedDraw = formData.get("isBalancedDraw") === "true";'
)

# 2. Save it to DB
content = content.replace(
    'allowRoleSwaps,',
    'allowRoleSwaps,\n      isBalancedDraw,'
)

with open('src/app/actions/tournamentActions.ts', 'w') as f:
    f.write(content)

print("Patched createTournament!")
