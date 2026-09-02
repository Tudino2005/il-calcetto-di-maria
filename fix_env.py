import re

with open("prisma/schema.prisma", "r") as f:
    content = f.read()

content = content.replace('env("POSTGRES_PRISMA_URL")', 'env("POSTGRES_URL")')

with open("prisma/schema.prisma", "w") as f:
    f.write(content)
