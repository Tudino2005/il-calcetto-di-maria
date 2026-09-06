import re

with open("src/components/TVSlideshow.tsx", "r") as f:
    content = f.read()

if "import SlotMachineDraw" not in content:
    content = content.replace(
        'import QRCodeDisplay from "@/components/QRCodeDisplay";',
        'import QRCodeDisplay from "@/components/QRCodeDisplay";\nimport SlotMachineDraw from "@/components/SlotMachineDraw";'
    )

with open("src/components/TVSlideshow.tsx", "w") as f:
    f.write(content)
