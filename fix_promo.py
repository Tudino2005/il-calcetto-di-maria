import re

with open("src/components/TVSlideshow.tsx", "r") as f:
    content = f.read()

content = content.replace('duration: 60000 }));', 'duration: 30000 }));')

with open("src/components/TVSlideshow.tsx", "w") as f:
    f.write(content)
