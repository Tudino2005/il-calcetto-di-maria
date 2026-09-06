import re

with open("src/components/SlotMachineDraw.tsx", "r") as f:
    content = f.read()

content = content.replace("}, 6000);", "}, 60000);")

with open("src/components/SlotMachineDraw.tsx", "w") as f:
    f.write(content)

