import re

def patch_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    if "tournament: true" not in content:
        content = content.replace(
            "teamB: { include: { player1: true, player2: true } },",
            "teamB: { include: { player1: true, player2: true } },\n      tournament: true"
        )

    with open(filepath, 'w') as f:
        f.write(content)

patch_file('src/app/match/[id]/page.tsx')
