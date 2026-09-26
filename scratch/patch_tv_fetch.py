import re

with open('src/app/page.tsx', 'r') as f:
    content = f.read()

old_include = """    include: {
      matches: {"""
      
new_include = """    include: {
      groups: {
        include: {
          standings: {
            include: { team: { include: { player1: true, player2: true } } },
            orderBy: [{ points: 'desc' }, { goalDifference: 'desc' }]
          },
          matches: {
            include: {
              teamA: { include: { player1: true, player2: true } },
              teamB: { include: { player1: true, player2: true } }
            }
          }
        }
      },
      matches: {"""

content = content.replace(old_include, new_include)

with open('src/app/page.tsx', 'w') as f:
    f.write(content)

print("Patched TV data fetching!")
