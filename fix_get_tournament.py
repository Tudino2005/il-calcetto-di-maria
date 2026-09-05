import re

with open("src/app/actions/tournamentActions.ts", "r") as f:
    content = f.read()

content = content.replace(
    'registrations: { include: { player: true } },',
    'registrations: { include: { player: true } },\n      registrationRequests: { orderBy: { createdAt: "asc" } },'
)

with open("src/app/actions/tournamentActions.ts", "w") as f:
    f.write(content)
