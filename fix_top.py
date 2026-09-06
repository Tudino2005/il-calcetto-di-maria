import re

with open("src/components/TVSlideshow.tsx", "r") as f:
    content = f.read()

content = content.replace("Classifica Singoli", "TOP SINGOLI")
content = content.replace("Classifica Coppie", "TOP COPPIE")

with open("src/components/TVSlideshow.tsx", "w") as f:
    f.write(content)
