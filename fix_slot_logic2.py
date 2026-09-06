import re

with open("src/components/SlotMachineDraw.tsx", "r") as f:
    content = f.read()

# Remove setInitialized
content = content.replace("    setInitialized(true);\n  }, [tournament, initialized]);", "  }, [tournament, teams.length]);")
content = content.replace("setInitialized(true);", "")

with open("src/components/SlotMachineDraw.tsx", "w") as f:
    f.write(content)
