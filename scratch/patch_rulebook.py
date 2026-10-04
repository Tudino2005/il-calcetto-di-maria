import os

# TVSlideshow.tsx
tv_path = 'src/components/TVSlideshow.tsx'
with open(tv_path, 'r') as f:
    content = f.read()

old_tv = "Se si arriva sul <b>{(t.advantageThreshold || 5)}-{(t.advantageThreshold || 5)}</b>, si attivano i Vantaggi: per vincere servirà uno scarto di 2 gol."
new_tv = "{t.advantageThreshold === 99 ? 'Vantaggi disattivati (il set termina esattamente ai gol previsti).' : `Se si arriva sul <b>${t.advantageThreshold || 5}-${t.advantageThreshold || 5}</b>, si attivano i Vantaggi: per vincere servirà uno scarto di 2 gol.`}"
content = content.replace(old_tv, new_tv)

with open(tv_path, 'w') as f:
    f.write(content)

# TournamentRulebook.tsx
rulebook_path = 'src/components/TournamentRulebook.tsx'
with open(rulebook_path, 'r') as f:
    content = f.read()

old_rule = "Se si arriva sul punteggio di ${advantageThreshold}-${advantageThreshold}, si attivano i Vantaggi: per vincere servirà uno scarto di almeno 2 gol (es. ${advantageThreshold+2}-${advantageThreshold}, ${advantageThreshold+3}-${advantageThreshold+1})."
new_rule = "${advantageThreshold === 99 ? 'I vantaggi sono disattivati. Il set termina non appena una squadra raggiunge i gol previsti.' : `Se si arriva sul punteggio di ${advantageThreshold}-${advantageThreshold}, si attivano i Vantaggi: per vincere servirà uno scarto di almeno 2 gol (es. ${advantageThreshold+2}-${advantageThreshold}).`}"
content = content.replace(old_rule, new_rule)

with open(rulebook_path, 'w') as f:
    f.write(content)

