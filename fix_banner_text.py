import re

with open("src/components/TVSlideshow.tsx", "r") as f:
    content = f.read()

content = content.replace(
    'Cerimonia Sorteggio Coppie',
    'Cerimonia Sorteggio Coppie e Calendario'
)

with open("src/components/TVSlideshow.tsx", "w") as f:
    f.write(content)

