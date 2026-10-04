def patch_file(filepath, replacements):
    with open(filepath, 'r') as f:
        content = f.read()
    
    for old, new in replacements:
        content = content.replace(old, new)
        
    with open(filepath, 'w') as f:
        f.write(content)

patch_file('src/components/MatchScorer.tsx', [
    ('Set Vinti', 'Partite Vinte'),
    ('Set Persi', 'Partite Perse')
])

patch_file('src/components/TVSlideshow.tsx', [
    ('title="Set Vinti">SV', 'title="Partite Vinte">PV'),
    ('title="Set Persi">SP', 'title="Partite Perse">PP'),
    ('title="Differenza Set">DS', 'title="Differenza Partite">DP'),
    ('SV: Partite Vinte', 'PV: Partite Vinte'),
    ('SP: Partite Perse', 'PP: Partite Perse'),
    ('{/* SV */}', '{/* PV */}'),
    ('{/* SP */}', '{/* PP */}'),
    ('Differenza Set (DS)', 'Differenza Partite (DP)')
])

patch_file('src/components/GroupStageView.tsx', [
    ('title="Differenza Set">DS', 'title="Differenza Partite">DP'),
    ('Differenza Set (DS)', 'Differenza Partite (DP)'),
    ('title="Set Vinti">SV', 'title="Partite Vinte">PV'),
    ('title="Set Persi">SP', 'title="Partite Perse">PP')
])
