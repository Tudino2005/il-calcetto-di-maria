import re

with open("prisma/schema.prisma", "r") as f:
    content = f.read()

pattern = r'datasource db \{\s*provider = "sqlite"\s*url\s*= "[^"]+"\s*\}'
replacement = """datasource db {
  provider = "postgresql"
  url      = env("POSTGRES_PRISMA_URL")
  directUrl = env("POSTGRES_URL_NON_POOLING")
}"""

content = re.sub(pattern, replacement, content)

with open("prisma/schema.prisma", "w") as f:
    f.write(content)
