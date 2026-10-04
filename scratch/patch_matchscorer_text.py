import re

def patch_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Partita Libera -> Sfida Libera
    content = content.replace('"Partita Libera"', '"Sfida Libera"')
    content = content.replace('>Nuova Partita Libera<', '>Nuova Sfida Libera<')
    
    # Partita di Torneo -> Sfida di Torneo
    content = content.replace('"Partita di Torneo"', '"Sfida di Torneo"')

    # 2 set -> 2 partite
    content = content.replace('Vince chi conquista 2 set', 'Vince chi conquista 2 partite')
    
    # "Match" -> "Sfida" where appropriate
    # Wait, let's carefully check where "Match" is used. I'll just change known UI texts.
    
    with open(filepath, 'w') as f:
        f.write(content)

patch_file('src/components/MatchScorer.tsx')
patch_file('src/app/match/page.tsx')
patch_file('src/app/admin/page.tsx')
patch_file('src/app/error.tsx')
patch_file('src/components/PlayerHistoryView.tsx')
