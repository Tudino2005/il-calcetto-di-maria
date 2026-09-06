import re

with open("src/components/WipeDataButton.tsx", "r") as f:
    content = f.read()

content = content.replace(
    "Per confermare, scrivi il PIN di sicurezza (MARIA2026):",
    "Per confermare, scrivi il PIN di sicurezza:"
)

with open("src/components/WipeDataButton.tsx", "w") as f:
    f.write(content)

with open("src/components/WipeAllDataButton.tsx", "r") as f:
    content = f.read()

content = content.replace(
    "Per confermare l'eliminazione dell'Anagrafica completa, scrivi il PIN di sicurezza (MARIA2026):",
    "Per confermare l'eliminazione dell'Anagrafica completa, scrivi il PIN di sicurezza:"
)

with open("src/components/WipeAllDataButton.tsx", "w") as f:
    f.write(content)

