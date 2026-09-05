import re

with open("src/app/actions/tournamentActions.ts", "r") as f:
    content = f.read()

content = content.replace(
    'const startDate = formData.get("startDate") ? new Date(formData.get("startDate") as string) : null;',
    'const startDate = formData.get("startDate") ? new Date(formData.get("startDate") as string) : null;\n  const drawDate = formData.get("drawDate") ? new Date(formData.get("drawDate") as string) : null;'
)

content = content.replace(
    'data: { name, type, format, maxTeams, status: "setup", startDate, pricePerPlayer, prizes }',
    'data: { name, type, format, maxTeams, status: "setup", startDate, drawDate, pricePerPlayer, prizes }'
)

with open("src/app/actions/tournamentActions.ts", "w") as f:
    f.write(content)
