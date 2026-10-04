import re

def patch_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    content = content.replace(
        "[5, 6, 7, 8, 10]",
        "[5, 6, 7, 8, 9, 10]"
    )

    with open(filepath, 'w') as f:
        f.write(content)

patch_file('src/components/TournamentForm.tsx')
patch_file('src/components/MatchScorer.tsx')
