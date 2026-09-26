import re

with open('prisma/schema.prisma', 'r') as f:
    content = f.read()

old_fields = """  allowRoleSwaps Boolean                  @default(false)"""
new_fields = """  allowRoleSwaps Boolean                  @default(false)\n  isBalancedDraw Boolean                  @default(false)"""

content = content.replace(old_fields, new_fields)

with open('prisma/schema.prisma', 'w') as f:
    f.write(content)

print("Patched schema successfully!")
