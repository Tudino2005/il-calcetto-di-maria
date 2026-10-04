import re

def patch_file(filepath, replacements):
    with open(filepath, 'r') as f:
        content = f.read()
    
    for old, new in replacements:
        content = content.replace(old, new)
        
    with open(filepath, 'w') as f:
        f.write(content)

# MatchScorer.tsx
patch_file('src/components/MatchScorer.tsx', [
    ('Set {setFinishedModal.setNumber} Concluso', 'Partita {setFinishedModal.setNumber} Conclusa'),
    ('{setsWonA} Set', '{setsWonA} Partite'),
    ('{setsWonB} Set', '{setsWonB} Partite'),
    ('3° Set Decisivo', '3ª Partita Decisiva'),
    ('Set {s.setNumber}:', 'Partita {s.setNumber}:'),
    ('In corso: Set {currentSetNumber}', 'In corso: Partita {currentSetNumber}'),
    ('Set Point Rosso', 'Punto Partita Rosso'),
    ('Set Point Blu', 'Punto Partita Blu'),
    ('+ SET ROSSO', '+ PARTITA ROSSA'),
    ('+ SET BLU', '+ PARTITA BLU'),
    ('Dettaglio Set Giocati:', 'Dettaglio Partite Giocate:'),
    ('⚡ VANTAGGI SET', '⚡ VANTAGGI PARTITA')
])

# PlayerHistoryView.tsx
patch_file('src/components/PlayerHistoryView.tsx', [
    ('Dettaglio Set:', 'Dettaglio Partite:')
])

# DoubleEliminationBracket.tsx & TournamentBracket.tsx
patch_file('src/components/DoubleEliminationBracket.tsx', [('Set: {formatSetScores', 'Partite: {formatSetScores')])
patch_file('src/components/TournamentBracket.tsx', [('Set: {formatSetScores', 'Partite: {formatSetScores')])

# TVSlideshow.tsx
patch_file('src/components/TVSlideshow.tsx', [
    ('SV: Set Vinti • SP: Set Persi • DS: Differenza Set', 'SV: Partite Vinte • SP: Partite Perse • DP: Diff. Partite')
])
