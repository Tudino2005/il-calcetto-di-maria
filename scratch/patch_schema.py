import re

with open('prisma/schema.prisma', 'r') as f:
    content = f.read()

old_fields = """  allowRoleSwaps     Boolean  @default(true)
  targetGoals        Int      @default(10)
  advantageThreshold Int      @default(2)"""

new_fields = """  allowRoleSwaps     Boolean  @default(true)
  isBalancedDraw     Boolean  @default(false)
  targetGoals        Int      @default(10)
  advantageThreshold Int      @default(2)"""

content = content.replace(old_fields, new_fields)

with open('prisma/schema.prisma', 'w') as f:
    f.write(content)

print("Patched schema!")
