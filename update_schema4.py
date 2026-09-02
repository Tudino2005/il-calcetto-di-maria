with open("prisma/schema.prisma", "r") as f:
    content = f.read()

content = content.replace(
    '  winnerTeamId      String?',
    '  startDate         DateTime?\n  pricePerPlayer    Float?\n  prizes            String?\n  winnerTeamId      String?'
)

with open("prisma/schema.prisma", "w") as f:
    f.write(content)
