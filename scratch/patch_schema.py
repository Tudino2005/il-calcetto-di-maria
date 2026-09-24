import re

with open('prisma/schema.prisma', 'r') as f:
    content = f.read()

# Add allowRoleSwapping to Tournament model
old_model = """  maxTeams       Int                      @default(8)
  pricePerPlayer Float?"""

new_model = """  maxTeams       Int                      @default(8)
  allowRoleSwaps Boolean                  @default(false)
  pricePerPlayer Float?"""

content = content.replace(old_model, new_model)

with open('prisma/schema.prisma', 'w') as f:
    f.write(content)

print("Patched schema")
