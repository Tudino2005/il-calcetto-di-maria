import re

def patch_file(filepath, replacements):
    with open(filepath, 'r') as f:
        content = f.read()
    
    for old, new in replacements:
        content = content.replace(old, new)
        
    with open(filepath, 'w') as f:
        f.write(content)

patch_file('src/components/MatchScorer.tsx', [
    ('Match Scorer', 'Segnapunti Sfida'),
    ('Al Meglio dei 3 Set', 'Al Meglio delle 3 Partite'),
    ('Solo Set', 'Solo Partite')
])

