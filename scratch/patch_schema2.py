import re

with open('prisma/schema.prisma', 'r') as f:
    content = f.read()

old_fields = """  maxTeams       Int                      @default(8)
  allowRoleSwaps Boolean                  @default(false)
  pricePerPlayer Float?"""

new_fields = """  maxTeams       Int                      @default(8)
  targetGoals    Int                      @default(7)
  advantageThreshold Int                  @default(5)
  allowRoleSwaps Boolean                  @default(false)
  pricePerPlayer Float?"""

content = content.replace(old_fields, new_fields)

with open('prisma/schema.prisma', 'w') as f:
    f.write(content)

print("Patched schema")
