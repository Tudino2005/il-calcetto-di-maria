import re

with open("src/components/SlotMachineDraw.tsx", "r") as f:
    content = f.read()

content = content.replace("const spinDuration = 2000;", "const spinDuration = 5000;")

with open("src/components/SlotMachineDraw.tsx", "w") as f:
    f.write(content)
