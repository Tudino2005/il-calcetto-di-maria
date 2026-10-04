import re

def patch_file(filepath, replacements):
    with open(filepath, 'r') as f:
        content = f.read()
    
    for old, new in replacements:
        content = content.replace(old, new)
        
    with open(filepath, 'w') as f:
        f.write(content)

# TournamentRulebook.tsx
patch_file('src/components/TournamentRulebook.tsx', [
    ('Ogni set viene vinto', 'Ogni partita viene vinta'),
    ('Il set termina non appena', 'La partita termina non appena')
])

# MatchScorer.tsx
patch_file('src/components/MatchScorer.tsx', [
    ('ripartire dal Set 1', 'ripartire dalla Partita 1'),
    ('vince il set chi segna', 'vince la partita chi segna'),
    ('Gol Effettivi Set', 'Gol Effettivi Partita'),
    ('Situazione Set Partita', 'Situazione Partite Sfida'),
    ('a un solo set dalla vittoria della partita', 'a una sola partita dalla vittoria della sfida'),
    ('per il Set {currentSetNumber}', 'per la Partita {currentSetNumber}'),
    ('Inizia Set', 'Inizia Partita'),
    ('Correggi Set', 'Correggi Partita'),
    ('Gol nel Set', 'Gol nella Partita'),
    ('Stecca Gol Set', 'Stecca Gol Partita'),
    ('Annulla Set Precedente', 'Annulla Partita Precedente')
])

# SlotMachineDraw.tsx
patch_file('src/components/SlotMachineDraw.tsx', [
    ('Ogni partita si gioca al meglio dei 3 set (vince chi se ne aggiudica 2). Vince il singolo set la squadra', 'Ogni sfida si gioca al meglio delle 3 partite (vince chi se ne aggiudica 2). Vince la singola partita la squadra')
])

# TVSlideshow.tsx
patch_file('src/components/TVSlideshow.tsx', [
    ('Ogni set viene vinto', 'Ogni partita viene vinta'),
    ('il set termina esattamente', 'la partita termina esattamente')
])

