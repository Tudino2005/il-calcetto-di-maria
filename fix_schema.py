import re

with open("prisma/schema.prisma", "r") as f:
    content = f.read()

content = content.replace("  bracketData    String?", "  bracketData    String?\n  teamNames      Json?")

with open("prisma/schema.prisma", "w") as f:
    f.write(content)
