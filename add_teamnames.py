import re

with open("prisma/schema.prisma", "r") as f:
    content = f.read()

# Add teamNames to Tournament
content = content.replace("  bracketData   String? // JSON", "  bracketData   String? // JSON\n  teamNames     Json?   // JSON mapping teamId -> ironic name")

with open("prisma/schema.prisma", "w") as f:
    f.write(content)
