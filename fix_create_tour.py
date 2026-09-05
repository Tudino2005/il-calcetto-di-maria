import re

with open("src/app/actions/tournamentActions.ts", "r") as f:
    content = f.read()

content = content.replace(
    'const format = formData.get("format") as string;',
    'const format = formData.get("format") as string;\n  const maxTeams = Number(formData.get("maxTeams") || 8);'
)

content = content.replace(
    'data: { name, type, format, status: "setup", startDate, pricePerPlayer, prizes }',
    'data: { name, type, format, maxTeams, status: "setup", startDate, pricePerPlayer, prizes }'
)

with open("src/app/actions/tournamentActions.ts", "w") as f:
    f.write(content)
