import re

with open("src/app/actions/tournamentActions.ts", "r") as f:
    content = f.read()

content = content.replace('await prisma.group.deleteMany({});', 'await prisma.tournamentGroup.deleteMany({});')

with open("src/app/actions/tournamentActions.ts", "w") as f:
    f.write(content)
