import re

with open("src/components/TVSlideshow.tsx", "r") as f:
    content = f.read()

# Add import
if "SlotMachineDraw" not in content:
    content = content.replace(
        'import QRCodeDisplay from "./QRCodeDisplay";',
        'import QRCodeDisplay from "./QRCodeDisplay";\nimport SlotMachineDraw from "./SlotMachineDraw";'
    )

# Add render block
render_block = """
          {/* SLOT MACHINE DRAW SLIDE */}
          {currentSlide.type === "slot_machine" && (
             <SlotMachineDraw tournament={currentSlide.tournament} />
          )}

          {/* TABELLONE TURNI / BRACKET TREE */}
"""

if "SLOT MACHINE DRAW SLIDE" not in content:
    content = content.replace('{/* TABELLONE TURNI / BRACKET TREE */}', render_block)

with open("src/components/TVSlideshow.tsx", "w") as f:
    f.write(content)
