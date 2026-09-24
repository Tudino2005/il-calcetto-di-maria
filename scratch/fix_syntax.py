import re

with open('src/components/TVSlideshow.tsx', 'r') as f:
    content = f.read()

content = content.replace(r"\'portiere\'", "'portiere'")
content = content.replace(r"\'difensore\'", "'difensore'")
content = content.replace(r"\'attaccante\'", "'attaccante'")

with open('src/components/TVSlideshow.tsx', 'w') as f:
    f.write(content)

print("Fixed syntax")
